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
const protectedLocalNames = new Set(["ed-brainstorm"]);

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
  };
  while (argv.length > 0) {
    const argument = argv.shift();
    if (argument === "--apply") options.apply = true;
    else if (argument === "--install") options.install = true;
    else if (argument === "--overlays-only") options.overlaysOnly = true;
    else if (argument === "--matt-ref") options.mattRef = argv.shift() ?? fail("--matt-ref requires a value");
    else if (argument === "--compound-ref") options.compoundRef = argv.shift() ?? fail("--compound-ref requires a value");
    else fail(`Unknown option: ${argument}`);
  }
  if (options.install && !options.apply) fail("--install requires --apply");
  if (options.overlaysOnly && (options.apply || options.install)) {
    fail("--overlays-only cannot be combined with --apply or --install");
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

function safeSkillPath(name) {
  if (!/^[a-z0-9-]+$/.test(name)) fail(`Unsafe skill name: ${name}`);
  const destination = path.resolve(skillsRoot, name);
  if (path.dirname(destination) !== path.resolve(skillsRoot)) fail(`Unsafe skill destination: ${destination}`);
  return destination;
}

function copySkill(source, name) {
  const destination = safeSkillPath(name);
  fs.rmSync(destination, { recursive: true, force: true });
  fs.cpSync(source, destination, { recursive: true });
}

function readLock() {
  return JSON.parse(fs.readFileSync(lockPath, "utf8"));
}

function writeLock(lock) {
  fs.writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`, "utf8");
}

function runOverlays(label) {
  const result = applyOverlays(packageRoot);
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

const options = parseArguments(process.argv.slice(2));

if (options.overlaysOnly) {
  try {
    runOverlays("Overlays-only");
    run(process.execPath, [path.join(scriptDirectory, "sync.mjs"), "check"]);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
  process.exit(process.exitCode ?? 0);
}

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
  const changed = candidates.filter((candidate) => differs(candidate.path, safeSkillPath(candidate.name)));

  if (changed.length === 0 && removed.length === 0) console.log("Imported skills already match the requested upstream refs.");
  else {
    console.log("Upstream changes detected:");
    for (const candidate of changed) console.log(`  update  ${candidate.name} (${candidate.source})`);
    for (const name of removed) console.log(`  remove  ${name} (removed from mattpocock/skills)`);
  }
  console.log("ed-brainstorm is a protected local skill and is never overwritten.");
  console.log("disable-model-invocation is passed through from upstream; overlays/ may re-assert local keys after apply.");

  if (!options.apply) {
    console.log("Preview only. Re-run with --apply to update the authoritative repository.");
    console.log("After apply, overlays under overlays/<skill>/ are re-applied automatically.");
    process.exit(0);
  }

  for (const candidate of changed) copySkill(candidate.path, candidate.name);
  for (const name of removed) fs.rmSync(safeSkillPath(name), { recursive: true, force: true });
  fs.copyFileSync(path.join(mattRoot, "LICENSE"), path.join(packageRoot, "Licenses", "mattpocock-skills-LICENSE"));
  fs.copyFileSync(path.join(compoundRoot, "LICENSE"), path.join(packageRoot, "Licenses", "compound-engineering-LICENSE"));

  lock.updatedAt = new Date().toISOString().slice(0, 10);
  lock.sources["mattpocock-skills"].commit = mattCommit;
  lock.sources["mattpocock-skills"].skills = currentMattSkills;
  lock.sources["compound-engineering-plugin"].commit = compoundCommit;
  lock.sources["compound-engineering-plugin"].skills = ["ce-commit"];
  writeLock(lock);

  runOverlays("Post-upstream");

  run(process.execPath, [path.join(scriptDirectory, "sync.mjs"), "check"]);
  if (options.install) run(process.execPath, [path.join(scriptDirectory, "sync.mjs"), "install", "--prune"]);
  console.log(`Updated upstream lock to mattpocock/skills@${mattCommit} and compound-engineering-plugin@${compoundCommit}.`);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
