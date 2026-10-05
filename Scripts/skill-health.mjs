#!/usr/bin/env node

/**
 * Quiet skill-health check for the Skills/ + overlays/ library.
 *
 * Exit 0 with no stdout when healthy (field-notes: quiet on nothing to report).
 * Print problems and exit 1 when something is wrong.
 *
 * Checks (real problems only):
 *   - overlay targets a missing skill / missing SKILL.md
 *   - overlay SKILL.md name ≠ overlay directory (mismatch)
 *   - skill SKILL.md has empty/missing Use when (description + body)
 *   - Skills/ed-workflow or overlays/ed-workflow resurrected; or $ed-workflow routes
 *
 * Usage:
 *   node Scripts/skill-health.mjs
 *   node Scripts/skill-health.mjs --root /path/to/package
 *   npm run skill-health
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const defaultPackageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function resolveRoots(packageRoot) {
  return {
    packageRoot,
    skillsRoot: path.join(packageRoot, "Skills"),
    overlaysRoot: path.join(packageRoot, "overlays"),
  };
}

function listSkillDirs(root) {
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function parseFrontmatterName(contents) {
  const match = contents.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return null;
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^name:\s*(.+)$/);
    if (field) return field[1].trim().replace(/^['"]|['"]$/g, "");
  }
  return null;
}

function hasYamlFrontmatter(contents) {
  return /^---\s*\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.test(contents);
}

function parseOverlayFrontmatterName(contents) {
  let name;
  for (const rawLine of contents.split(/\r?\n/)) {
    const field = rawLine.trim().match(/^name:\s*(.*)$/);
    if (field) name = field[1].trim().replace(/^['"]|['"]$/g, "");
  }
  return name;
}

function hasUseWhen(contents) {
  // Trigger may live in description frontmatter and/or body.
  return /use\s+when/i.test(contents);
}
function collectSourceProblems(packageRoot, skillNames) {
  const problems = [];
  let lock;
  try {
    lock = JSON.parse(fs.readFileSync(path.join(packageRoot, "upstreams.lock.json"), "utf8"));
  } catch (error) {
    return [`skill provenance unavailable: ${error.message}`];
  }
  const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  if (!isObject(lock) || lock.schemaVersion !== 1 || !isObject(lock.sources) || !isObject(lock.localSkills)) {
    return ["skill provenance requires schemaVersion 1, sources, and localSkills"];
  }
  const owners = new Set();
  const register = (name) => {
    if (owners.has(name)) problems.push(`duplicate skill provenance: ${name}`);
    owners.add(name);
    if (!skillNames.has(name)) problems.push(`orphan skill provenance: ${name}`);
  };
  const validPath = (value) => typeof value === "string" && value.split("/").every((part) => /^[a-zA-Z0-9_.-]+$/.test(part) && part !== "." && part !== "..");
  for (const [id, source] of Object.entries(lock.sources)) {
    if (!isObject(source) || !Array.isArray(source.skills) || !isObject(source.skillPaths)) {
      problems.push(`invalid source provenance: ${id}`);
      continue;
    }
    if (typeof source.repository !== "string" || !source.repository.startsWith("https://github.com/") || !/^[a-f0-9]{40}$/.test(source.commit ?? "")) {
      problems.push(`source requires repository and pinned commit: ${id}`);
    }
    if (!["automatic", "manual"].includes(source.updatePolicy)) problems.push(`invalid source update policy: ${id}`);
    for (const name of source.skills) {
      register(name);
      if (!validPath(source.skillPaths[name])) problems.push(`source path missing or unsafe: ${id}/${name}`);
    }
    for (const name of Object.keys(source.skillPaths)) {
      if (!source.skills.includes(name)) problems.push(`unowned source path: ${id}/${name}`);
    }
  }
  for (const [name, source] of Object.entries(lock.localSkills)) {
    register(name);
    if (!isObject(source) || typeof source.repository !== "string" || !source.repository.startsWith("https://github.com/") || source.path !== `Skills/${name}` || source.updatePolicy !== "local") {
      problems.push(`invalid local skill provenance: ${name}`);
    }
  }
  for (const name of skillNames) {
    if (!owners.has(name)) problems.push(`skill provenance missing: ${name}`);
  }
  return problems;
}


function collectProblems(packageRoot) {
  const { skillsRoot, overlaysRoot } = resolveRoots(packageRoot);
  const problems = [];
  const skillNames = new Set(listSkillDirs(skillsRoot));
  const overlayNames = listSkillDirs(overlaysRoot);

  for (const name of overlayNames) {
    const skillDir = path.join(skillsRoot, name);
    const skillFile = path.join(skillDir, "SKILL.md");
    if (!skillNames.has(name) || !fs.existsSync(skillDir)) {
      problems.push(`orphan overlay: overlays/${name}/ has no Skills/${name}/`);
      continue;
    }
    if (!fs.existsSync(skillFile)) {
      problems.push(`overlay target missing SKILL.md: Skills/${name}/SKILL.md`);
    }

    const overlaySkill = path.join(overlaysRoot, name, "SKILL.md");
    if (fs.existsSync(overlaySkill)) {
      const contents = fs.readFileSync(overlaySkill, "utf8");
      if (!hasYamlFrontmatter(contents)) {
        problems.push(`overlay skill missing frontmatter: overlays/${name}/SKILL.md`);
        continue;
      }
      const overlayName = parseFrontmatterName(contents);
      const frontmatterPath = path.join(overlaysRoot, name, "frontmatter.yaml");
      const effectiveName = fs.existsSync(frontmatterPath)
        ? parseOverlayFrontmatterName(fs.readFileSync(frontmatterPath, "utf8")) ?? overlayName
        : overlayName;
      if (!effectiveName) {
        problems.push(`overlay skill missing name: overlays/${name}/SKILL.md`);
      } else if (effectiveName !== name) {
        problems.push(
          `overlay skill mismatch: overlays/${name}/SKILL.md name="${effectiveName}" (expected "${name}")`,
        );
      }
    }
  }

  for (const name of skillNames) {
    const skillFile = path.join(skillsRoot, name, "SKILL.md");
    if (!fs.existsSync(skillFile)) {
      problems.push(`skill missing SKILL.md: Skills/${name}/`);
      continue;
    }
    const contents = fs.readFileSync(skillFile, "utf8");
    const fmName = parseFrontmatterName(contents);
    if (fmName !== null && fmName !== name) {
      problems.push(`skill name mismatch: Skills/${name}/SKILL.md name="${fmName}"`);
    }
    if (!hasUseWhen(contents)) {
      problems.push(`empty Use when: Skills/${name}/SKILL.md (neither description nor body)`);
    }
    // Invocation-style routes only ($ed-workflow). Mentions in Not-for / "do not recreate" are fine.
    if (/\$ed-workflow\b/.test(contents)) {
      problems.push(`deleted skill still routed: Skills/${name}/SKILL.md contains $ed-workflow`);
    }
  }

  // Resurrection checks (directory present = problem).
  if (skillNames.has("ed-workflow")) {
    problems.push("deleted skill resurrected: Skills/ed-workflow/ exists");
  }
  if (overlayNames.includes("ed-workflow")) {
    problems.push("deleted skill overlay present: overlays/ed-workflow/ exists");
  }

  problems.push(...collectSourceProblems(packageRoot, skillNames));
  return problems;
}

function isMain() {
  const self = fileURLToPath(import.meta.url);
  const invoked = process.argv[1] ? path.resolve(process.argv[1]) : "";
  return invoked === self;
}

export function runSkillHealth(options = {}) {
  const packageRoot = options.packageRoot ?? defaultPackageRoot;
  const problems = collectProblems(packageRoot);
  if (problems.length === 0) {
    if (options.verbose) console.log("skill-health: ok");
    return { ok: true, problems: [] };
  }
  for (const problem of problems) console.error(problem);
  return { ok: false, problems };
}

function parseRootArg(argv) {
  const index = argv.indexOf("--root");
  if (index === -1) return defaultPackageRoot;
  const value = argv[index + 1];
  if (!value || value.startsWith("-")) {
    console.error("skill-health: --root requires a path");
    process.exit(2);
  }
  return path.resolve(value);
}

if (isMain()) {
  const verbose = process.argv.includes("--verbose");
  const packageRoot = parseRootArg(process.argv.slice(2));
  const result = runSkillHealth({ verbose, packageRoot });
  if (!result.ok) process.exitCode = 1;
}
