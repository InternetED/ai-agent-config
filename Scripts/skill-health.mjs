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

function hasUseWhen(contents) {
  // Trigger may live in description frontmatter and/or body.
  return /use\s+when/i.test(contents);
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
      const overlayName = parseFrontmatterName(fs.readFileSync(overlaySkill, "utf8"));
      if (overlayName !== null && overlayName !== name) {
        problems.push(
          `overlay skill mismatch: overlays/${name}/SKILL.md name="${overlayName}" (expected "${name}")`,
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
