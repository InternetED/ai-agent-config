#!/usr/bin/env node

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const sourceRoot = path.resolve(scriptDirectory, "..");
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ai-agent-config-upstreams-test-"));
const emptyGitConfig = path.join(temporaryRoot, "empty-gitconfig");
fs.writeFileSync(emptyGitConfig, "");
const isolatedGitEnvironment = { ...process.env, GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: emptyGitConfig, GIT_CONFIG_COUNT: "0" };

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", env: isolatedGitEnvironment, ...options });
  assert.equal(result.status, 0, `${command} ${args.join(" ")} failed:\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}

function treeDigest(root) {
  const hash = crypto.createHash("sha256");
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
      const entryPath = path.join(directory, entry.name);
      const relativePath = path.relative(root, entryPath).replaceAll(path.sep, "/");
      hash.update(`${entry.isDirectory() ? "d" : "f"}:${relativePath}\0`);
      if (entry.isDirectory()) visit(entryPath);
      else hash.update(fs.readFileSync(entryPath));
    }
  };
  visit(root);
  return hash.digest("hex");
}

function commitRepository(repository) {
  run("git", ["init", "--quiet", "--initial-branch", "main", repository]);
  run("git", ["-C", repository, "config", "user.email", "tests@example.invalid"]);
  run("git", ["-C", repository, "config", "user.name", "Upstream fixture"]);
  run("git", ["-C", repository, "add", "."]);
  run("git", ["-C", repository, "commit", "--quiet", "-m", "fixture"]);
}

function createFixture(name, { invalidOverlay = false, invalidSkillOverlay = false, protectedCandidate = null } = {}) {
  const root = path.join(temporaryRoot, name);
  fs.mkdirSync(root, { recursive: true });
  for (const entry of ["Config", "Licenses", "Scripts", "Skills", "overlays"]) {
    fs.cpSync(path.join(sourceRoot, entry), path.join(root, entry), { recursive: true });
  }
  fs.copyFileSync(path.join(sourceRoot, "upstreams.lock.json"), path.join(root, "upstreams.lock.json"));
  fs.copyFileSync(path.join(sourceRoot, "package.json"), path.join(root, "package.json"));

  const lock = JSON.parse(fs.readFileSync(path.join(root, "upstreams.lock.json"), "utf8"));
  const mattRepository = path.join(root, "fixtures", "matt");
  const compoundRepository = path.join(root, "fixtures", "compound");
  fs.mkdirSync(path.join(mattRepository, "skills"), { recursive: true });
  fs.mkdirSync(path.join(compoundRepository, "skills"), { recursive: true });
  fs.writeFileSync(path.join(mattRepository, "LICENSE"), "fixture matt license\n", "utf8");
  fs.writeFileSync(path.join(compoundRepository, "LICENSE"), "fixture compound license\n", "utf8");

  for (const skillName of lock.sources["mattpocock-skills"].skills) {
    fs.cpSync(path.join(root, "Skills", skillName), path.join(mattRepository, "skills", skillName), { recursive: true });
  }
  fs.appendFileSync(path.join(mattRepository, "skills", "ask-matt", "SKILL.md"), "\nFixture upstream change.\n", "utf8");
  if (protectedCandidate) {
    const skillDirectory = path.join(mattRepository, "skills", protectedCandidate);
    fs.mkdirSync(skillDirectory, { recursive: true });
    fs.writeFileSync(path.join(skillDirectory, "SKILL.md"), `---\nname: ${protectedCandidate}\ndescription: fixture conflict\n---\n`, "utf8");
  }
  fs.cpSync(path.join(root, "Skills", "ce-commit"), path.join(compoundRepository, "skills", "ce-commit"), { recursive: true });
  commitRepository(mattRepository);
  commitRepository(compoundRepository);

  if (invalidOverlay) {
    const overlayDirectory = path.join(root, "overlays", "zz-invalid-overlay");
    fs.mkdirSync(overlayDirectory, { recursive: true });
    fs.writeFileSync(path.join(overlayDirectory, "SKILL.md"), "invalid overlay\n", "utf8");
  }
  if (invalidSkillOverlay) {
    fs.writeFileSync(path.join(root, "overlays", "ask-matt", "SKILL.md"), "not a skill\n", "utf8");
  }

  const gitConfig = path.join(root, "gitconfig");
  fs.writeFileSync(gitConfig, `[url \"${pathToFileURL(mattRepository).href}\"]\n\tinsteadOf = https://github.com/mattpocock/skills.git\n[url \"${pathToFileURL(compoundRepository).href}\"]\n\tinsteadOf = https://github.com/everyinc/compound-engineering-plugin.git\n`, "utf8");
  return {
    root,
    environment: { ...isolatedGitEnvironment, GIT_CONFIG_GLOBAL: gitConfig },
    script: path.join(root, "Scripts", "sync-upstreams.mjs"),
  };
}

function invoke(fixture, args) {
  return spawnSync(process.execPath, [fixture.script, ...args], { cwd: fixture.root, env: fixture.environment, encoding: "utf8" });
}

try {
  const missingScope = createFixture("missing-scope");
  const beforeMissingScope = treeDigest(path.join(missingScope.root, "Skills"));
  const missingScopeResult = invoke(missingScope, ["--apply", "--install"]);
  assert.notEqual(missingScopeResult.status, 0);
  assert.match(missingScopeResult.stderr, /scope user or --scope project/);
  assert.equal(treeDigest(path.join(missingScope.root, "Skills")), beforeMissingScope, "missing install scope must reject before upstream writes");

  const invalidScope = createFixture("invalid-scope");
  const beforeInvalidScope = treeDigest(path.join(invalidScope.root, "Skills"));
  const invalidScopeResult = invoke(invalidScope, ["--apply", "--install", "--scope", "machine"]);
  assert.notEqual(invalidScopeResult.status, 0);
  assert.match(invalidScopeResult.stderr, /--scope must be user or project/);
  assert.equal(treeDigest(path.join(invalidScope.root, "Skills")), beforeInvalidScope, "invalid install scope must reject before upstream writes");

  const invalidApply = createFixture("invalid-apply", { invalidOverlay: true });
  const applyBefore = treeDigest(path.join(invalidApply.root, "Skills"));
  const lockBefore = fs.readFileSync(path.join(invalidApply.root, "upstreams.lock.json"), "utf8");
  const licenseBefore = fs.readFileSync(path.join(invalidApply.root, "Licenses", "mattpocock-skills-LICENSE"), "utf8");
  const invalidApplyResult = invoke(invalidApply, ["--apply"]);
  assert.notEqual(invalidApplyResult.status, 0);
  assert.match(invalidApplyResult.stderr, /zz-invalid-overlay/);
  assert.equal(treeDigest(path.join(invalidApply.root, "Skills")), applyBefore, "failed overlay preflight must not partially update Skills");
  assert.equal(fs.readFileSync(path.join(invalidApply.root, "upstreams.lock.json"), "utf8"), lockBefore, "failed overlay preflight must not update the lock");
  assert.equal(fs.readFileSync(path.join(invalidApply.root, "Licenses", "mattpocock-skills-LICENSE"), "utf8"), licenseBefore, "failed overlay preflight must not update licenses");
  const invalidStagedSkill = createFixture("invalid-staged-skill", { invalidSkillOverlay: true });
  const stagedSkillBefore = treeDigest(path.join(invalidStagedSkill.root, "Skills"));
  const invalidStagedSkillResult = invoke(invalidStagedSkill, ["--apply"]);
  assert.notEqual(invalidStagedSkillResult.status, 0);
  assert.match(invalidStagedSkillResult.stderr, /needs YAML frontmatter/);
  assert.equal(treeDigest(path.join(invalidStagedSkill.root, "Skills")), stagedSkillBefore, "failed staged skill validation must not partially update Skills");

  const invalidOverlaysOnly = createFixture("invalid-overlays-only", { invalidOverlay: true });
  const overlaysBefore = treeDigest(path.join(invalidOverlaysOnly.root, "Skills"));
  const invalidOverlaysOnlyResult = invoke(invalidOverlaysOnly, ["--overlays-only"]);
  assert.notEqual(invalidOverlaysOnlyResult.status, 0);
  assert.match(invalidOverlaysOnlyResult.stderr, /zz-invalid-overlay/);
  assert.equal(treeDigest(path.join(invalidOverlaysOnly.root, "Skills")), overlaysBefore, "failed overlays-only preflight must not modify Skills");

  const protectedConflict = createFixture("protected-conflict", { protectedCandidate: "security-review" });
  const protectedResult = invoke(protectedConflict, ["--apply"]);
  assert.notEqual(protectedResult.status, 0);
  assert.match(protectedResult.stderr, /security-review.*locally maintained skill/);

  const invalidInstall = createFixture("invalid-install");
  const invalidProject = path.join(invalidInstall.root, "project");
  fs.mkdirSync(invalidProject);
  fs.writeFileSync(path.join(invalidProject, ".mcp.json"), "{ invalid");
  const beforeInvalidInstall = fs.readFileSync(path.join(invalidInstall.root, "upstreams.lock.json"), "utf8");
  const invalidInstallResult = invoke(invalidInstall, ["--apply", "--install", "--scope", "project", "--project", invalidProject]);
  assert.equal(invalidInstallResult.status, 1);
  assert.equal(fs.readFileSync(path.join(invalidInstall.root, "upstreams.lock.json"), "utf8"), beforeInvalidInstall, "invalid install target must reject before authority promotion");

  const successfulApply = createFixture("successful-apply");
  const projectRoot = path.join(successfulApply.root, "project");
  const homeRoot = path.join(successfulApply.root, "home");
  const successfulResult = invoke(successfulApply, ["--apply", "--install", "--scope", "project", "--project", projectRoot, "--home", homeRoot]);
  assert.equal(successfulResult.status, 0, `${successfulResult.stdout}\n${successfulResult.stderr}`);
  assert.equal(fs.readFileSync(path.join(successfulApply.root, "Licenses", "mattpocock-skills-LICENSE"), "utf8"), "fixture matt license\n");
  assert.equal(JSON.parse(fs.readFileSync(path.join(projectRoot, ".ai-agent-config", "state.json"), "utf8")).scope, "project");
  assert.equal(fs.existsSync(path.join(projectRoot, ".agents", "skills", "ask-matt", "SKILL.md")), true);

  console.log("Upstream regression tests passed: explicit scope, protected locals, staged validation, and scoped install.");
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
