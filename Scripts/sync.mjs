#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const PACKAGE_ID = "com.interneted.ai-agent-config";
const START_MARKER = `# >>> ${PACKAGE_ID}:mcp (generated; do not edit)`;
const END_MARKER = `# <<< ${PACKAGE_ID}:mcp`;
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDirectory, "..");

function fail(message) {
  throw new Error(message);
}

function parseArguments(argv) {
  const options = {
    command: "help",
    home: os.homedir(),
    scope: null,
    project: process.cwd(),
    manifest: path.join(packageRoot, "Config", "mcp.servers.json"),
    output: null,
    prune: false,
    force: false,
    dryRun: false,
  };

  if (argv[0] && !argv[0].startsWith("--")) options.command = argv.shift();

  while (argv.length > 0) {
    const argument = argv.shift();
    if (argument === "--home") options.home = path.resolve(argv.shift() ?? fail("--home requires a path"));
    else if (argument === "--scope") options.scope = argv.shift() ?? fail("--scope requires user or project");
    else if (argument === "--project") options.project = path.resolve(argv.shift() ?? fail("--project requires a path"));
    else if (argument === "--manifest") options.manifest = path.resolve(argv.shift() ?? fail("--manifest requires a path"));
    else if (argument === "--output") options.output = path.resolve(argv.shift() ?? fail("--output requires a path"));
    else if (argument === "--prune") options.prune = true;
    else if (argument === "--force") options.force = true;
    else if (argument === "--dry-run") options.dryRun = true;
    else fail(`Unknown option: ${argument}`);
  }

  if (!new Set(["help", "check", "generate", "install"]).has(options.command)) {
    fail(`Unknown command: ${options.command}`);
  }
  if (options.scope !== null && !new Set(["user", "project"]).has(options.scope)) {
    fail("--scope must be user or project");
  }
  if (options.command === "install" && options.scope === null) {
    fail("install requires --scope user or --scope project");
  }
  return options;
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`Cannot read JSON ${filePath}: ${error.message}`);
  }
}

function validateEnvironmentName(value, location) {
  if (typeof value !== "string" || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
    fail(`${location} must be an environment-variable name`);
  }
}

function validateManifest(manifest) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) fail("MCP manifest must be an object");
  if (manifest.schemaVersion !== 1) fail("MCP manifest schemaVersion must be 1");
  if (!manifest.servers || typeof manifest.servers !== "object" || Array.isArray(manifest.servers)) {
    fail("MCP manifest servers must be an object");
  }

  for (const [name, server] of Object.entries(manifest.servers)) {
    if (!/^[A-Za-z0-9_-]+$/.test(name)) fail(`Invalid MCP server name: ${name}`);
    if (!server || typeof server !== "object" || Array.isArray(server)) fail(`MCP server ${name} must be an object`);
    if (!new Set(["stdio", "http"]).has(server.transport)) fail(`MCP server ${name} has unsupported transport`);
    if (server.enabled !== undefined && typeof server.enabled !== "boolean") fail(`MCP server ${name}.enabled must be a boolean`);

    if (server.transport === "stdio") {
      if (typeof server.command !== "string" || server.command.length === 0) fail(`MCP server ${name} needs command`);
      if (server.args !== undefined && (!Array.isArray(server.args) || server.args.some((item) => typeof item !== "string"))) {
        fail(`MCP server ${name}.args must be an array of strings`);
      }
      if (server.env !== undefined && (!server.env || typeof server.env !== "object" || Array.isArray(server.env))) {
        fail(`MCP server ${name}.env must be an object`);
      }
      for (const [key, value] of Object.entries(server.env ?? {})) {
        validateEnvironmentName(key, `MCP server ${name}.env key`);
        if (typeof value !== "string") fail(`MCP server ${name}.env.${key} must be a string`);
      }
      if (server.envVars !== undefined && !Array.isArray(server.envVars)) fail(`MCP server ${name}.envVars must be an array`);
      for (const envName of server.envVars ?? []) validateEnvironmentName(envName, `MCP server ${name}.envVars`);
    }

    if (server.transport === "http") {
      if (typeof server.url !== "string" || !/^https?:\/\//.test(server.url)) fail(`MCP server ${name} needs an HTTP(S) URL`);
      if (server.bearerTokenEnv !== undefined) validateEnvironmentName(server.bearerTokenEnv, `MCP server ${name}.bearerTokenEnv`);
      if (server.headersFromEnv !== undefined && (!server.headersFromEnv || typeof server.headersFromEnv !== "object" || Array.isArray(server.headersFromEnv))) {
        fail(`MCP server ${name}.headersFromEnv must be an object`);
      }
      for (const envName of Object.values(server.headersFromEnv ?? {})) {
        validateEnvironmentName(envName, `MCP server ${name}.headersFromEnv`);
      }
    }
  }

  return Object.fromEntries(Object.entries(manifest.servers).filter(([, server]) => server.enabled !== false));
}

function parseSkillFrontmatter(contents, filePath) {
  const match = contents.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) fail(`${filePath} needs YAML frontmatter`);
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z0-9_-]+):\s*(.+)$/);
    if (field) fields[field[1]] = field[2].trim().replace(/^['"]|['"]$/g, "");
  }
  if (!fields.name) fail(`${filePath} needs a name`);
  if (!fields.description) fail(`${filePath} needs a description`);
  return fields;
}

function validateSkills() {
  const skillsRoot = path.join(packageRoot, "Skills");
  const entries = fs.readdirSync(skillsRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  const skills = [];
  for (const entry of entries) {
    if (!/^[a-z0-9-]+$/.test(entry.name)) fail(`Invalid skill directory name: ${entry.name}`);
    const skillPath = path.join(skillsRoot, entry.name);
    const skillFile = path.join(skillPath, "SKILL.md");
    if (!fs.existsSync(skillFile)) fail(`${skillPath} is missing SKILL.md`);
    const fields = parseSkillFrontmatter(fs.readFileSync(skillFile, "utf8"), skillFile);
    if (fields.name !== entry.name) fail(`${skillFile} name must match its directory (${entry.name})`);
    skills.push({ name: entry.name, source: skillPath });
  }
  return skills.sort((left, right) => left.name.localeCompare(right.name));
}

const tomlString = (value) => JSON.stringify(value);
const tomlArray = (values) => `[${values.map(tomlString).join(", ")}]`;

function renderCodex(servers) {
  const lines = [];
  for (const [name, server] of Object.entries(servers).sort(([a], [b]) => a.localeCompare(b))) {
    const table = `mcp_servers.${tomlString(name)}`;
    lines.push(`[${table}]`);
    if (server.transport === "stdio") {
      lines.push(`command = ${tomlString(server.command)}`);
      if ((server.args ?? []).length > 0) lines.push(`args = ${tomlArray(server.args)}`);
      if ((server.envVars ?? []).length > 0) lines.push(`env_vars = ${tomlArray(server.envVars)}`);
      const envEntries = Object.entries(server.env ?? {});
      if (envEntries.length > 0) {
        lines.push("", `[${table}.env]`);
        for (const [key, value] of envEntries.sort(([a], [b]) => a.localeCompare(b))) lines.push(`${key} = ${tomlString(value)}`);
      }
    } else {
      lines.push(`url = ${tomlString(server.url)}`);
      if (server.bearerTokenEnv) lines.push(`bearer_token_env_var = ${tomlString(server.bearerTokenEnv)}`);
      const headerEntries = Object.entries(server.headersFromEnv ?? {});
      if (headerEntries.length > 0) {
        lines.push("", `[${table}.env_http_headers]`);
        for (const [header, envName] of headerEntries.sort(([a], [b]) => a.localeCompare(b))) {
          lines.push(`${tomlString(header)} = ${tomlString(envName)}`);
        }
      }
    }
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}

function renderClaudeObject(servers) {
  const mcpServers = {};
  for (const [name, server] of Object.entries(servers).sort(([a], [b]) => a.localeCompare(b))) {
    if (server.transport === "stdio") {
      const entry = { type: "stdio", command: server.command };
      if ((server.args ?? []).length > 0) entry.args = server.args;
      const env = { ...(server.env ?? {}) };
      for (const envName of server.envVars ?? []) env[envName] = `\${${envName}}`;
      if (Object.keys(env).length > 0) entry.env = env;
      mcpServers[name] = entry;
    } else {
      const entry = { type: "http", url: server.url };
      const headers = {};
      if (server.bearerTokenEnv) headers.Authorization = `Bearer \${${server.bearerTokenEnv}}`;
      for (const [header, envName] of Object.entries(server.headersFromEnv ?? {})) headers[header] = `\${${envName}}`;
      if (Object.keys(headers).length > 0) entry.headers = headers;
      mcpServers[name] = entry;
    }
  }
  return { mcpServers };
}

function removeManagedCodexBlock(contents) {
  const start = contents.indexOf(START_MARKER);
  if (start < 0) return contents.trimEnd();
  const end = contents.indexOf(END_MARKER, start);
  if (end < 0) fail("Codex config contains an unterminated AI Agent Config block");
  return `${contents.slice(0, start)}${contents.slice(end + END_MARKER.length)}`.trimEnd();
}

// Inspect TOML declarations, not values: quoted keys and multiline strings must
// not hide a collision or make an unrelated string look like an MCP table.
function assertNoCodexCollisions(contents, serverNames) {
  if (serverNames.length === 0) return;
  const names = new Set(serverNames);
  const tokens = contents.match(/"""(?:\\[\s\S]|(?!""")[\s\S])*"""|'''[\s\S]*?'''|"(?:\\[^\r\n]|[^"\\\r\n])*"|'[^'\r\n]*'|#[^\r\n]*|\r?\n|[A-Za-z0-9_-]+|[^\s]/g) ?? [];
  let index = 0;
  let table = [];
  const key = () => {
    const parts = [];
    while (index < tokens.length) {
      const token = tokens[index];
      if (token.startsWith('"""') || token.startsWith("'''")) break;
      if (token.startsWith('"')) {
        const escapes = { b: "\b", t: "\t", n: "\n", f: "\f", r: "\r", '"': '"', "\\": "\\" };
        parts.push(token.slice(1, -1).replace(/\\(?:u([0-9A-Fa-f]{4})|U([0-9A-Fa-f]{8})|([btnfr"\\]))/g, (_, short, long, escaped) =>
          escaped === undefined ? String.fromCodePoint(Number.parseInt(short ?? long, 16)) : escapes[escaped],
        ));
      } else if (token.startsWith("'")) parts.push(token.slice(1, -1));
      else if (/^[A-Za-z0-9_-]+$/.test(token)) parts.push(token);
      else break;
      index += 1;
      if (tokens[index] !== ".") break;
      index += 1;
    }
    return parts;
  };
  const check = (parts) => {
    if (parts[0] === "mcp_servers" && names.has(parts[1])) {
      fail(`MCP server ${parts[1]} already exists outside the managed Codex block`);
    }
  };
  while (index < tokens.length) {
    if (tokens[index].startsWith("#") || tokens[index].includes("\n")) { index += 1; continue; }
    if (tokens[index] === "[") {
      index += 1;
      const arrayTable = tokens[index] === "[";
      if (arrayTable) index += 1;
      table = key();
      check(table);
      if (arrayTable && table.length === 1 && table[0] === "mcp_servers") fail("Cannot extend an MCP array table; use standard MCP tables");
      while (index < tokens.length && tokens[index] !== "\n" && tokens[index] !== "\r\n") index += 1;
      continue;
    }
    const parts = [...table, ...key()];
    if (tokens[index] === "=") {
      check(parts);
      if (parts.length === 1 && parts[0] === "mcp_servers") {
        fail("Cannot extend an inline MCP namespace; use standard [mcp_servers.NAME] tables");
      }
    }
    // Arrays/inline tables may span lines. Strings are single tokens.
    let depth = 0;
    do {
      const token = tokens[index++];
      if (token === "[" || token === "{") depth += 1;
      else if (token === "]" || token === "}") depth -= 1;
      else if ((token === "\n" || token === "\r\n") && depth === 0) break;
    } while (index < tokens.length);
  }
}


function writeFile(filePath, contents, options) {
  if (options.dryRun) {
    console.log(`[dry-run] write ${filePath}`);
    return;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents, "utf8");
}

function backupFile(filePath, backupRoot, options) {
  if (!fs.existsSync(filePath) || options.dryRun) return;
  fs.mkdirSync(backupRoot, { recursive: true });
  fs.copyFileSync(filePath, path.join(backupRoot, path.basename(filePath)));
}

function assertDirectChild(root, target) {
  const relative = path.relative(path.resolve(root), path.resolve(target));
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative) || relative.includes(path.sep)) {
    fail(`Refusing to manage unsafe path: ${target}`);
  }
}

function validateSkillDestination(skill, destinationRoot, options) {
  const destination = path.join(destinationRoot, skill.name);
  assertDirectChild(destinationRoot, destination);
  const ownerFile = path.join(destination, ".ai-agent-config-owner.json");
  if (fs.existsSync(destination) && !fs.existsSync(ownerFile) && !options.force) {
    fail(`Skill destination already exists and is not managed: ${destination}. Use --force to replace it.`);
  }
}

function installSkill(skill, destinationRoot, options) {
  const destination = path.join(destinationRoot, skill.name);
  const ownerFile = path.join(destination, ".ai-agent-config-owner.json");
  if (options.dryRun) {
    console.log(`[dry-run] install skill ${skill.name} -> ${destination}`);
    return;
  }
  fs.mkdirSync(destinationRoot, { recursive: true });
  fs.rmSync(destination, { recursive: true, force: true });
  fs.cpSync(skill.source, destination, { recursive: true });
  fs.writeFileSync(ownerFile, `${JSON.stringify({ package: PACKAGE_ID, skill: skill.name }, null, 2)}\n`, "utf8");
}

function pruneSkills(previousNames, currentNames, destinationRoot, options) {
  if (!options.prune) return;
  for (const name of previousNames.filter((item) => !currentNames.includes(item))) {
    const destination = path.join(destinationRoot, name);
    assertDirectChild(destinationRoot, destination);
    const ownerFile = path.join(destination, ".ai-agent-config-owner.json");
    if (!fs.existsSync(ownerFile)) continue;
    if (options.dryRun) console.log(`[dry-run] prune skill ${destination}`);
    else fs.rmSync(destination, { recursive: true, force: true });
  }
}

function generate(servers, options) {
  const outputRoot = options.output ?? path.join(options.home, ".ai-agent-config", "generated");
  writeFile(path.join(outputRoot, "codex-mcp.toml"), `${renderCodex(servers)}\n`, options);
  writeFile(path.join(outputRoot, "claude-mcp.json"), `${JSON.stringify(renderClaudeObject(servers), null, 2)}\n`, options);
  console.log(`Generated Claude and Codex MCP configurations in ${outputRoot}`);
}

function install(servers, skills, options) {
  const targetRoot = options.scope === "project" ? options.project : options.home;
  const stateRoot = path.join(targetRoot, ".ai-agent-config");
  const statePath = path.join(stateRoot, "state.json");
  const previousState = fs.existsSync(statePath) ? readJson(statePath) : { skillNames: [], mcpNames: [] };
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupRoot = path.join(stateRoot, "backups", timestamp);
  const codexSkills = path.join(targetRoot, ".agents", "skills");
  const claudeSkills = path.join(targetRoot, ".claude", "skills");
  const skillNames = skills.map((skill) => skill.name);
  const serverNames = Object.keys(servers);

  const codexPath = path.join(targetRoot, ".codex", "config.toml");
  const existingCodex = fs.existsSync(codexPath) ? fs.readFileSync(codexPath, "utf8") : "";
  let nextCodex = removeManagedCodexBlock(existingCodex);
  assertNoCodexCollisions(nextCodex, serverNames);
  const renderedCodex = renderCodex(servers);
  if (renderedCodex) nextCodex = `${nextCodex}${nextCodex ? "\n\n" : ""}${START_MARKER}\n${renderedCodex}\n${END_MARKER}`;
  nextCodex = `${nextCodex.trimEnd()}\n`;

  const claudePath = options.scope === "project"
    ? path.join(targetRoot, ".mcp.json")
    : path.join(targetRoot, ".claude.json");
  const existingClaudeText = fs.existsSync(claudePath) ? fs.readFileSync(claudePath, "utf8") : "{}";
  let existingClaude;
  try {
    existingClaude = JSON.parse(existingClaudeText);
  } catch (error) {
    fail(`Cannot update ${claudePath}: ${error.message}`);
  }
  if (!existingClaude || typeof existingClaude !== "object" || Array.isArray(existingClaude)) fail(`${claudePath} must contain a JSON object`);
  if (existingClaude.mcpServers !== undefined && (!existingClaude.mcpServers || typeof existingClaude.mcpServers !== "object" || Array.isArray(existingClaude.mcpServers))) {
    fail(`${claudePath}.mcpServers must contain a JSON object`);
  }
  existingClaude.mcpServers ??= {};
  for (const name of serverNames) {
    if (Object.hasOwn(existingClaude.mcpServers, name) && !(previousState.mcpNames ?? []).includes(name)) {
      fail(`MCP server ${name} already exists and is not managed in ${claudePath}`);
    }
  }
  if (options.prune) {
    for (const previousName of previousState.mcpNames ?? []) {
      if (!Object.hasOwn(servers, previousName)) delete existingClaude.mcpServers[previousName];
    }
  }
  Object.assign(existingClaude.mcpServers, renderClaudeObject(servers).mcpServers);
  const nextClaudeText = `${JSON.stringify(existingClaude, null, 2)}\n`;
  const state = {
    package: PACKAGE_ID,
    version: readJson(path.join(packageRoot, "package.json")).version,
    scope: options.scope,
    targetRoot,
    installedAt: new Date().toISOString(),
    skillNames,
    mcpNames: serverNames.sort(),
  };

  // Validate every destination before copying, pruning, backing up, or writing.
  for (const destinationRoot of [codexSkills, claudeSkills]) {
    for (const skill of skills) validateSkillDestination(skill, destinationRoot, options);
    if (options.prune) {
      for (const name of (previousState.skillNames ?? []).filter((name) => !skillNames.includes(name))) {
        assertDirectChild(destinationRoot, path.join(destinationRoot, name));
      }
    }
  }
  for (const skill of skills) {
    installSkill(skill, codexSkills, options);
    installSkill(skill, claudeSkills, options);
  }
  pruneSkills(previousState.skillNames ?? [], skillNames, codexSkills, options);
  pruneSkills(previousState.skillNames ?? [], skillNames, claudeSkills, options);
  if (nextCodex !== existingCodex) {
    backupFile(codexPath, backupRoot, options);
    writeFile(codexPath, nextCodex, options);
  }
  if (nextClaudeText !== existingClaudeText) {
    backupFile(claudePath, backupRoot, options);
    writeFile(claudePath, nextClaudeText, options);
  }
  writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, options);
  console.log(`Installed ${skills.length} skill(s) and ${serverNames.length} MCP server(s) at ${options.scope} scope: ${targetRoot}`);
}

function showHelp() {
  console.log(`AI Agent Config synchronizer

Usage:
  node Scripts/sync.mjs check
  node Scripts/sync.mjs generate [--output PATH]
  node Scripts/sync.mjs install --scope user [--prune] [--force] [--dry-run]
  node Scripts/sync.mjs install --scope project [--project PATH] [--prune] [--force] [--dry-run]

Options:
  --home PATH      Override the user profile (primarily for testing)
  --scope SCOPE    Required install scope: user or project
  --project PATH   Project root (defaults to the current directory)
  --manifest PATH  Use a different MCP manifest
  --output PATH    Choose generated-output directory
  --prune          Remove previously managed entries no longer in the source
  --force          Replace colliding skill folders not owned by this package
  --dry-run        Report writes without changing files`);
}

try {
  const majorVersion = Number(process.versions.node.split(".")[0]);
  if (majorVersion < 18) fail("Node.js 18 or newer is required");
  const options = parseArguments(process.argv.slice(2));
  if (options.command === "help") {
    showHelp();
  } else {
    const servers = validateManifest(readJson(options.manifest));
    const skills = validateSkills();
    if (options.command === "check") console.log(`Valid: ${skills.length} skill(s), ${Object.keys(servers).length} enabled MCP server(s)`);
    else if (options.command === "generate") generate(servers, options);
    else install(servers, skills, options);
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
