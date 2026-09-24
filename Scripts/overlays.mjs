#!/usr/bin/env node

/**
 * Local overlay layer for upstream-synced skills.
 *
 * Layout (repo root):
 *   overlays/<skill-name>/frontmatter.yaml  — shallow-merge into SKILL.md frontmatter
 *   overlays/<skill-name>/<any-other-path>  — full-file replace into Skills/<skill-name>/
 *
 * `frontmatter.yaml` is never copied as a skill file. Apply fails loudly on missing
 * skills, unsafe paths, invalid YAML-ish frontmatter files, or missing SKILL.md when
 * a frontmatter overlay is present.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const FRONTMATTER_FILE = "frontmatter.yaml";

export function fail(message) {
  throw new Error(message);
}

function parseSimpleYamlObject(text, location) {
  const fields = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const field = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!field) fail(`${location} has an unsupported line: ${rawLine}`);
    const key = field[1];
    let value = field[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    fields[key] = value;
  }
  return fields;
}

function splitSkillDocument(contents, filePath) {
  const match = contents.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/);
  if (!match) fail(`${filePath} needs YAML frontmatter before overlays can merge`);
  return {
    frontmatterText: match[1],
    body: contents.slice(match[0].length),
  };
}

function parseFrontmatterFields(frontmatterText) {
  const fields = {};
  const order = [];
  for (const line of frontmatterText.split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!field) continue;
    if (!(field[1] in fields)) order.push(field[1]);
    fields[field[1]] = field[2];
  }
  return { fields, order };
}

function formatFrontmatterValue(value) {
  const text = String(value);
  if (text === "") return '""';
  if (/[:#{}[\],&*?|>!%@`]/.test(text) || /\s/.test(text) || text !== text.trim()) {
    return JSON.stringify(text);
  }
  return text;
}

export function mergeFrontmatter(contents, overlayFields, filePath) {
  const { frontmatterText, body } = splitSkillDocument(contents, filePath);
  const { fields, order } = parseFrontmatterFields(frontmatterText);
  for (const [key, value] of Object.entries(overlayFields)) {
    if (!(key in fields)) order.push(key);
    fields[key] = formatFrontmatterValue(value);
  }
  const rendered = order.map((key) => `${key}: ${fields[key]}`).join("\n");
  return `---\n${rendered}\n---\n${body}`;
}

function assertInside(root, target) {
  const resolvedRoot = path.resolve(root);
  const resolvedTarget = path.resolve(target);
  const relative = path.relative(resolvedRoot, resolvedTarget);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    fail(`Overlay path escapes skill directory: ${target}`);
  }
  return relative;
}

function listOverlayFiles(overlayDir) {
  const files = [];
  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) files.push(full);
    }
  }
  walk(overlayDir);
  return files;
}

/**
 * Apply every overlay under overlays/ onto Skills/.
 * @returns {{ skills: string[], frontmatterMerges: number, filesCopied: number }}
 */
export function applyOverlays(packageRoot, options = {}) {
  const overlaysRoot = options.overlaysRoot ?? path.join(packageRoot, "overlays");
  const skillsRoot = options.skillsRoot ?? path.join(packageRoot, "Skills");
  const dryRun = Boolean(options.dryRun);

  if (!fs.existsSync(overlaysRoot)) {
    return { skills: [], frontmatterMerges: 0, filesCopied: 0 };
  }

  const skillNames = fs
    .readdirSync(overlaysRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  let frontmatterMerges = 0;
  let filesCopied = 0;
  const applied = [];

  for (const skillName of skillNames) {
    if (!/^[a-z0-9-]+$/.test(skillName)) fail(`Unsafe overlay skill name: ${skillName}`);
    const overlayDir = path.join(overlaysRoot, skillName);
    const skillDir = path.join(skillsRoot, skillName);
    if (!fs.existsSync(skillDir)) fail(`Overlay targets missing skill: ${skillName}`);
    if (!fs.existsSync(path.join(skillDir, "SKILL.md"))) {
      fail(`Overlay skill is missing SKILL.md: ${skillName}`);
    }

    const overlayFiles = listOverlayFiles(overlayDir);
    const frontmatterPath = path.join(overlayDir, FRONTMATTER_FILE);
    const hasFrontmatter = fs.existsSync(frontmatterPath);

    if (hasFrontmatter) {
      const overlayFields = parseSimpleYamlObject(
        fs.readFileSync(frontmatterPath, "utf8"),
        frontmatterPath,
      );
      const skillFile = path.join(skillDir, "SKILL.md");
      const current = fs.readFileSync(skillFile, "utf8");
      const next = mergeFrontmatter(current, overlayFields, skillFile);
      if (next !== current) {
        if (!dryRun) fs.writeFileSync(skillFile, next, "utf8");
        frontmatterMerges += 1;
      }
    }

    for (const source of overlayFiles) {
      const relative = path.relative(overlayDir, source);
      if (relative === FRONTMATTER_FILE) continue;
      const destination = path.join(skillDir, relative);
      assertInside(skillDir, destination);
      if (!dryRun) {
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.copyFileSync(source, destination);
      }
      filesCopied += 1;
    }

    applied.push(skillName);
    if (options.onSkill) options.onSkill(skillName);
  }

  return { skills: applied, frontmatterMerges, filesCopied };
}

function isMain() {
  const self = fileURLToPath(import.meta.url);
  const invoked = process.argv[1] ? path.resolve(process.argv[1]) : "";
  return invoked === self;
}

if (isMain()) {
  const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const dryRun = process.argv.includes("--dry-run");
  try {
    const result = applyOverlays(packageRoot, { dryRun });
    if (result.skills.length === 0) {
      console.log(dryRun ? "No overlays to apply (dry-run)." : "No overlays to apply.");
    } else {
      console.log(
        `${dryRun ? "[dry-run] Would apply" : "Applied"} overlays for ${result.skills.length} skill(s): ${result.skills.join(", ")}`,
      );
      console.log(
        `  frontmatter merges: ${result.frontmatterMerges}; file copies: ${result.filesCopied}`,
      );
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}
