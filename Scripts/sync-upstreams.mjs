#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { applyOverlays } from "./overlays.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDirectory, "..");
const skillsRoot = path.join(packageRoot, "Skills");
const lockPath = path.join(packageRoot, "upstreams.lock.json");
const protectedLocalNames = new Set([
  "ed-brainstorm",
  "manage-ai-agent-config",
  "security-review",
  "verification-before-completion",
]);

function fail(message) {
  throw new Error(message);
}

function parseArguments(argv) {
  const options = {
    apply: false,
    install: false,
    overlaysOnly: false,
    mattRef: "main",
    compoundRef: "main",
    scope: null,
    home: os.homedir(),
    project: process.cwd(),
  };
  while (argv.length > 0) {
    const argument = argv.shift();
    if (argument === "--apply") options.apply = true;
    else if (argument === "--install") options.install = true;
    else if (argument === "--overlays-only") options.overlaysOnly = true;
    else if (argument === "--matt-ref") options.mattRef = argv.shift() ?? fail("--matt-ref requires a value");
    else if (argument === "--compound-ref") options.compoundRef = argv.shift() ?? fail("--compound-ref requires a value");
    else if (argument === "--scope") options.scope = argv.shift() ?? fail("--scope requires user or project");
    else if (argument === "--home") options.home = path.resolve(argv.shift() ?? fail("--home requires a path"));
    else if (argument === "--project") options.project = path.resolve(argv.shift() ?? fail("--project requires a path"));
    else fail(`Unknown option: ${argument}`);
  }
  if (options.install && !options.apply) fail("--install requires --apply");
  if (options.overlaysOnly && (options.apply || options.install)) {
    fail("--overlays-only cannot be combined with --apply or --install");
  }
  if (options.scope !== null && !new Set(["user", "project"]).has(options.scope)) {
    fail("--scope must be user or project");
  }
  if (options.apply && options.install && options.scope === null) {
    fail("--apply --install requires --scope user or --scope project");
  }
  return options;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", stdio: options.capture ? "pipe" : "inherit", ...options });
  if (result.status !== 0) fail(`${command} ${args.join(" ")} failed${result.stderr ? `: ${result.stderr.trim()}` : ""}`);
  return options.capture ? result.stdout.trim() : "";
}

function cloneAtRef(repository, ref, destination) {
  run("git", ["clone", "--quiet", "--depth", "1", "--branch", ref, repository, destination]);
  return run("git", ["-C", destination, "rev-parse", "HEAD"], { capture: true });
}

function findSkillDirectories(root) {
  const found = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const directory = path.join(root, entry.name);
    if (fs.existsSync(path.join(directory, "SKILL.md"))) found.push(directory);
    else found.push(...findSkillDirectories(directory));
  }
  return found;
}

/**
 * Portability policy for upstream frontmatter:
 * - Pass through `disable-model-invocation` (clients that ignore unknown keys stay safe;
 *   Claude Code honors it). Local overlays may also re-assert the key after sync.
 * - Strip `argument-hint` (Claude-Code UI metadata; not portable across clients).
 */
function convertToPortableSkill(directory) {
  const skillFile = path.join(directory, "SKILL.md");
  if (!fs.existsSync(skillFile)) fail(`Missing SKILL.md in ${directory}`);
  const contents = fs.readFileSync(skillFile, "utf8").replace(/^argument-hint:.*\r?\n/gm, "");
  fs.writeFileSync(skillFile, contents, "utf8");
}

function differs(source, destination) {
  if (!fs.existsSync(destination)) return true;
  const result = spawnSync("git", ["diff", "--no-index", "--quiet", "--", source, destination], { stdio: "ignore" });
  if (result.status === 0) return false;
  if (result.status === 1) return true;
  fail(`Could not compare ${source} and ${destination}`);
}

function safeSkillPath(root, name) {
  if (!/^[a-z0-9-]+$/.test(name)) fail(`Unsafe skill name: ${name}`);
  const destination = path.resolve(root, name);
  if (path.dirname(destination) !== path.resolve(root)) fail(`Unsafe skill destination: ${destination}`);
  return destination;
}

function copySkill(source, root, name) {
  const destination = safeSkillPath(root, name);
  fs.rmSync(destination, { recursive: true, force: true });
  fs.cpSync(source, destination, { recursive: true });
}

function readLock(root = packageRoot) {
  return JSON.parse(fs.readFileSync(path.join(root, "upstreams.lock.json"), "utf8"));
}

function writeLock(root, lock) {
  fs.writeFileSync(path.join(root, "upstreams.lock.json"), `${JSON.stringify(lock, null, 2)}\n`, "utf8");
}

function runOverlays(root, label) {
  const result = applyOverlays(root);
  if (result.skills.length === 0) {
    console.log(`${label}: no overlays present.`);
  } else {
    console.log(
      `${label}: applied overlays for ${result.skills.length} skill(s) (${result.frontmatterMerges} frontmatter merge(s), ${result.filesCopied} file copies).`,
    );
    for (const name of result.skills) console.log(`  overlay  ${name}`);
  }
  return result;
}

function createStagingRoot() {
  return fs.mkdtempSync(path.join(packageRoot, ".sync-upstreams-stage-"));
}

function stageRepository(stagingRoot) {
  for (const entry of ["Skills", "overlays", "Scripts", "Config", "Licenses"]) {
    fs.cpSync(path.join(packageRoot, entry), path.join(stagingRoot, entry), { recursive: true });
  }
  fs.copyFileSync(lockPath, path.join(stagingRoot, "upstreams.lock.json"));
  fs.copyFileSync(path.join(packageRoot, "package.json"), path.join(stagingRoot, "package.json"));
}

function validateStagedSkills(stagingRoot) {
  run(process.execPath, [path.join(stagingRoot, "Scripts", "sync.mjs"), "check"]);
}

function promoteStagedFiles(stagingRoot, paths) {
  const promoted = [];
  try {
    for (const relativePath of paths) {
      const stagedPath = path.join(stagingRoot, relativePath);
      const livePath = path.join(packageRoot, relativePath);
      const backupPath = path.join(stagingRoot, ".backup", relativePath);
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });
      fs.renameSync(livePath, backupPath);
      try {
        fs.renameSync(stagedPath, livePath);
      } catch (error) {
        fs.renameSync(backupPath, livePath);
        throw error;
      }
      promoted.push({ livePath, backupPath });
    }
  } catch (error) {
    for (const { livePath, backupPath } of promoted.reverse()) {
      fs.rmSync(livePath, { recursive: true, force: true });
      fs.renameSync(backupPath, livePath);
    }
    throw error;
  }
}

function stageAndValidateOverlays(stagingRoot, label) {
  stageRepository(stagingRoot);
  runOverlays(stagingRoot, label);
  validateStagedSkills(stagingRoot);
}

const options = parseArguments(process.argv.slice(2));

if (options.overlaysOnly) {
  const stagingRoot = createStagingRoot();
  try {
    stageAndValidateOverlays(stagingRoot, "Overlays-only");
    promoteStagedFiles(stagingRoot, ["Skills"]);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  } finally {
    fs.rmSync(stagingRoot, { recursive: true, force: true });
  }
} else {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ai-agent-config-upstreams-"));
  try {
    const mattRoot = path.join(temporaryRoot, "mattpocock-skills");
    const compoundRoot = path.join(temporaryRoot, "compound-engineering");
    const mattCommit = cloneAtRef("https://github.com/mattpocock/skills.git", options.mattRef, mattRoot);
    const compoundCommit = cloneAtRef("https://github.com/everyinc/compound-engineering-plugin.git", options.compoundRef, compoundRoot);

    const mattDirectories = findSkillDirectories(path.join(mattRoot, "skills"));
    const seen = new Set();
    const candidates = [];
    for (const source of mattDirectories) {
      const name = path.basename(source);
      if (protectedLocalNames.has(name) || name === "ce-commit") fail(`Upstream skill '${name}' conflicts with a locally maintained skill`);
      if (seen.has(name)) fail(`Matt Pocock's repository contains duplicate skill name '${name}'`);
      seen.add(name);
      convertToPortableSkill(source);
      candidates.push({ source: "mattpocock/skills", name, path: source });
    }

    const commitSource = path.join(compoundRoot, "skills", "ce-commit");
    convertToPortableSkill(commitSource);
    candidates.push({ source: "everyinc/compound-engineering-plugin", name: "ce-commit", path: commitSource });

    const lock = readLock();
    const previousMattSkills = lock.sources["mattpocock-skills"].skills ?? [];
    const currentMattSkills = [...seen].sort();
    const removed = previousMattSkills.filter((name) => !seen.has(name));
    const changed = candidates.filter((candidate) => differs(candidate.path, safeSkillPath(skillsRoot, candidate.name)));

    if (changed.length === 0 && removed.length === 0) console.log("Imported skills already match the requested upstream refs.");
    else {
      console.log("Upstream changes detected:");
      for (const candidate of changed) console.log(`  update  ${candidate.name} (${candidate.source})`);
      for (const name of removed) console.log(`  remove  ${name} (removed from mattpocock/skills)`);
    }
    console.log("Durable local skills are protected and are never overwritten.");
    console.log("disable-model-invocation is passed through from upstream; overlays/ may re-assert local keys after apply.");

    if (!options.apply) {
      console.log("Preview only. Re-run with --apply to update the authoritative repository.");
      console.log("After apply, overlays under overlays/<skill>/ are re-applied automatically.");
    } else {
      const installArgs = ["install", "--prune", "--scope", options.scope, "--home", options.home, "--project", options.project];
      const stagingRoot = createStagingRoot();
      try {
        stageRepository(stagingRoot);
        const stagedSkillsRoot = path.join(stagingRoot, "Skills");
        for (const candidate of changed) copySkill(candidate.path, stagedSkillsRoot, candidate.name);
        for (const name of removed) fs.rmSync(safeSkillPath(stagedSkillsRoot, name), { recursive: true, force: true });
        fs.copyFileSync(path.join(mattRoot, "LICENSE"), path.join(stagingRoot, "Licenses", "mattpocock-skills-LICENSE"));
        fs.copyFileSync(path.join(compoundRoot, "LICENSE"), path.join(stagingRoot, "Licenses", "compound-engineering-LICENSE"));

        lock.updatedAt = new Date().toISOString().slice(0, 10);
        lock.sources["mattpocock-skills"].commit = mattCommit;
        lock.sources["mattpocock-skills"].skills = currentMattSkills;
        lock.sources["compound-engineering-plugin"].commit = compoundCommit;
        lock.sources["compound-engineering-plugin"].skills = ["ce-commit"];
        writeLock(stagingRoot, lock);

        runOverlays(stagingRoot, "Post-upstream");
        validateStagedSkills(stagingRoot);
        if (options.install) run(process.execPath, [path.join(stagingRoot, "Scripts", "sync.mjs"), ...installArgs, "--dry-run"]);
        promoteStagedFiles(stagingRoot, [
          "Skills",
          path.join("Licenses", "mattpocock-skills-LICENSE"),
          path.join("Licenses", "compound-engineering-LICENSE"),
          "upstreams.lock.json",
        ]);
      } finally {
        fs.rmSync(stagingRoot, { recursive: true, force: true });
      }

      if (options.install) run(process.execPath, [path.join(scriptDirectory, "sync.mjs"), ...installArgs]);
      console.log(`Updated upstream lock to mattpocock/skills@${mattCommit} and compound-engineering-plugin@${compoundCommit}.`);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
}
