#!/usr/bin/env node

import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const syncScript = path.join(scriptDirectory, "sync.mjs");

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function parseArguments(argv) {
  const options = { scope: null, project: process.cwd(), force: false, dryRun: false, rtk: null };
  while (argv.length > 0) {
    const argument = argv.shift();
    if (argument === "install") continue;
    if (argument === "--scope") options.scope = argv.shift() ?? fail("--scope requires user or project");
    else if (argument === "--project") options.project = path.resolve(argv.shift() ?? fail("--project requires a path"));
    else if (argument === "--force") options.force = true;
    else if (argument === "--dry-run") options.dryRun = true;
    else if (argument === "--rtk") options.rtk = argv.shift() ?? fail("--rtk requires claude, codex, or both");
    else if (argument === "--help" || argument === "-h") options.help = true;
    else fail(`Unknown option: ${argument}`);
  }
  if (options.scope !== null && !new Set(["user", "project"]).has(options.scope)) fail("--scope must be user or project");
  if (options.rtk !== null && !["claude", "codex", "both"].includes(options.rtk)) fail("--rtk must be claude, codex, or both");
  return options;
}

function showHelp() {
  console.log(`AI Agent Config installer

Usage:
  ai-agent-config
  ai-agent-config --scope user
  ai-agent-config --scope project [--project PATH]

Without --scope, an interactive terminal asks where to install.

Options:
  --scope SCOPE   Install for the current user or current project
  --project PATH  Project root (defaults to the current directory)
  --force         Replace colliding unmanaged Skill directories
  --dry-run       Preview writes without changing files
  --rtk TARGET    Opt in to RTK for claude, codex, or both (requires rtk on PATH)
                 Project: instructions; user Claude: automatic Bash hook`);
}

async function chooseScope(options) {
  if (options.scope) return options.scope;
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    fail("A non-interactive install requires --scope user or --scope project");
  }

  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  try {
    console.log("Where should AI Agent Config be installed?\n");
    console.log("  1. User     Available in every project on this computer");
    console.log(`  2. Project  Available only in ${options.project}\n`);
    const answer = (await prompt.question("Choose 1 or 2: ")).trim().toLowerCase();
    if (answer === "1" || answer === "user" || answer === "u") return "user";
    if (answer === "2" || answer === "project" || answer === "p") return "project";
    fail("Please choose 1 (user) or 2 (project)");
  } finally {
    prompt.close();
  }
}

const options = parseArguments(process.argv.slice(2));
if (options.help) {
  showHelp();
  process.exit(0);
}

const scope = await chooseScope(options);
const rtkOptions = { cwd: scope === "project" ? options.project : undefined };
if (options.rtk) {
  for (const command of [["--version"], ["gain"], ["init", "--help"]]) {
    const check = spawnSync("rtk", command, { encoding: "utf8" });
    if (check.error || check.status !== 0) fail("RTK opt-in requires rtk-ai/rtk on PATH. Install it first: https://github.com/rtk-ai/rtk/blob/develop/INSTALL.md");
    if (command[0] === "init" && !["--codex", "--auto-patch", "--no-trust-filters", "--dry-run"].every((flag) => check.stdout.includes(flag))) fail("Installed RTK lacks required init options; upgrade rtk-ai/rtk first.");
  }
}
const args = [syncScript, "install", "--scope", scope, "--prune"];
if (scope === "project") args.push("--project", options.project);
if (options.force) args.push("--force");
if (options.dryRun) args.push("--dry-run");

const result = spawnSync(process.execPath, args, { stdio: "inherit" });
if (result.error) fail(result.error.message);
if (result.status !== 0) process.exit(result.status ?? 1);
if (options.rtk) {
  const targets = options.rtk === "both" ? ["claude", "codex"] : [options.rtk];
  for (const target of targets) {
    const initArgs = ["init", "--no-trust-filters"];
    if (scope === "user") initArgs.push("--global");
    if (target === "codex") initArgs.push("--codex");
    else initArgs.push("--auto-patch");
    if (options.dryRun) initArgs.push("--dry-run");
    console.log(`RTK ${target} integration (${scope} scope): delegated to rtk init`);
    const init = spawnSync("rtk", initArgs, { ...rtkOptions, stdio: "inherit" });
    if (init.error || init.status !== 0) fail(`Skills/MCP installation succeeded, but RTK ${target} initialization failed. ${init.error?.message ?? "Review RTK output and rerun after resolving the error."}`);
  }
  console.log(options.dryRun ? "RTK preview finished; nothing enabled." : "RTK initialization finished. Restart the selected agents. Hook availability depends on RTK version and agent; project Claude is prompt-based.");
}
