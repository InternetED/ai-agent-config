#!/usr/bin/env node

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const syncScript = path.join(scriptDirectory, "sync.mjs");
const cliScript = path.join(scriptDirectory, "cli.mjs");
const temporaryHome = fs.mkdtempSync(path.join(os.tmpdir(), "ai-agent-config-test-"));

try {
  fs.mkdirSync(path.join(temporaryHome, ".codex"), { recursive: true });
  fs.writeFileSync(path.join(temporaryHome, ".codex", "config.toml"), 'model = "keep-me"\n', "utf8");
  fs.writeFileSync(path.join(temporaryHome, ".claude.json"), `${JSON.stringify({ theme: "dark", mcpServers: { existing: { type: "http", url: "https://existing.example/mcp" } } }, null, 2)}\n`, "utf8");

  const manifestPath = path.join(temporaryHome, "fixture.json");
  fs.writeFileSync(manifestPath, `${JSON.stringify({
    schemaVersion: 1,
    servers: {
      local_docs: {
        transport: "stdio",
        command: "npx",
        args: ["-y", "example-mcp"],
        envVars: ["DOCS_TOKEN"]
      },
      remote_docs: {
        transport: "http",
        url: "https://docs.example/mcp",
        bearerTokenEnv: "REMOTE_TOKEN",
        headersFromEnv: { "X-Team": "TEAM_NAME" }
      },
      disabled_server: {
        enabled: false,
        transport: "http",
        url: "https://disabled.example/mcp"
      }
    }
  }, null, 2)}\n`, "utf8");

  const result = spawnSync(process.execPath, [syncScript, "install", "--scope", "user", "--home", temporaryHome, "--manifest", manifestPath, "--prune"], {
    encoding: "utf8"
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);

  const codex = fs.readFileSync(path.join(temporaryHome, ".codex", "config.toml"), "utf8");
  assert.match(codex, /model = "keep-me"/);
  assert.match(codex, /mcp_servers\."local_docs"/);
  assert.match(codex, /bearer_token_env_var = "REMOTE_TOKEN"/);
  assert.doesNotMatch(codex, /disabled_server/);

  const claude = JSON.parse(fs.readFileSync(path.join(temporaryHome, ".claude.json"), "utf8"));
  assert.equal(claude.theme, "dark");
  assert.equal(claude.mcpServers.existing.url, "https://existing.example/mcp");
  assert.equal(claude.mcpServers.local_docs.env.DOCS_TOKEN, "${DOCS_TOKEN}");
  assert.equal(claude.mcpServers.remote_docs.headers.Authorization, "Bearer ${REMOTE_TOKEN}");
  assert.equal(claude.mcpServers.disabled_server, undefined);

  const sourceSkillNames = fs.readdirSync(path.join(scriptDirectory, "..", "Skills"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  for (const skillRoot of [path.join(temporaryHome, ".agents", "skills"), path.join(temporaryHome, ".claude", "skills")]) {
    for (const name of sourceSkillNames) {
      assert.equal(fs.existsSync(path.join(skillRoot, name, "SKILL.md")), true, `${name} was not installed`);
      assert.equal(fs.existsSync(path.join(skillRoot, name, ".ai-agent-config-owner.json")), true, `${name} is missing ownership metadata`);
    }
  }

  const projectRoot = path.join(temporaryHome, "sample-project");
  fs.mkdirSync(path.join(projectRoot, ".codex"), { recursive: true });
  fs.writeFileSync(path.join(projectRoot, ".codex", "config.toml"), 'model = "project-model"\n', "utf8");
  fs.writeFileSync(path.join(projectRoot, ".mcp.json"), `${JSON.stringify({ projectSetting: true, mcpServers: {} }, null, 2)}\n`, "utf8");

  const projectResult = spawnSync(process.execPath, [syncScript, "install", "--scope", "project", "--project", projectRoot, "--manifest", manifestPath, "--prune"], {
    encoding: "utf8"
  });
  assert.equal(projectResult.status, 0, `${projectResult.stdout}\n${projectResult.stderr}`);
  assert.match(fs.readFileSync(path.join(projectRoot, ".codex", "config.toml"), "utf8"), /model = "project-model"/);
  assert.match(fs.readFileSync(path.join(projectRoot, ".codex", "config.toml"), "utf8"), /mcp_servers\."local_docs"/);
  const projectClaude = JSON.parse(fs.readFileSync(path.join(projectRoot, ".mcp.json"), "utf8"));
  assert.equal(projectClaude.projectSetting, true);
  assert.equal(projectClaude.mcpServers.local_docs.env.DOCS_TOKEN, "${DOCS_TOKEN}");
  const projectState = JSON.parse(fs.readFileSync(path.join(projectRoot, ".ai-agent-config", "state.json"), "utf8"));
  assert.equal(projectState.scope, "project");
  assert.equal(projectState.targetRoot, projectRoot);
  for (const skillRoot of [path.join(projectRoot, ".agents", "skills"), path.join(projectRoot, ".claude", "skills")]) {
    for (const name of sourceSkillNames) {
      assert.equal(fs.existsSync(path.join(skillRoot, name, "SKILL.md")), true, `${name} was not installed at project scope`);
    }
  }

  const cliResult = spawnSync(process.execPath, [cliScript, "--scope", "project", "--project", projectRoot, "--dry-run"], { encoding: "utf8" });
  assert.equal(cliResult.status, 0, `${cliResult.stdout}\n${cliResult.stderr}`);
  const nonInteractiveResult = spawnSync(process.execPath, [cliScript], { encoding: "utf8" });
  assert.notEqual(nonInteractiveResult.status, 0);
  assert.match(nonInteractiveResult.stderr, /requires --scope user or --scope project/);

  const collisionRoot = path.join(temporaryHome, "codex-collision");
  fs.mkdirSync(path.join(collisionRoot, ".codex"), { recursive: true });
  const unmanagedCodex = '[mcp_servers."local_docs"]\ncommand = "my-docs"\n';
  fs.writeFileSync(path.join(collisionRoot, ".codex", "config.toml"), unmanagedCodex);
  const collisionResult = spawnSync(process.execPath, [syncScript, "install", "--scope", "project", "--project", collisionRoot, "--manifest", manifestPath], { encoding: "utf8" });
  assert.equal(collisionResult.status, 1, "An unmanaged Codex server must not be redefined");
  assert.equal(fs.readFileSync(path.join(collisionRoot, ".codex", "config.toml"), "utf8"), unmanagedCodex);
  assert.equal(fs.existsSync(path.join(collisionRoot, ".agents")), false, "A rejected installation must not copy Skills");

  const invalidEnabledPath = path.join(temporaryHome, "invalid-enabled.json");
  fs.writeFileSync(invalidEnabledPath, JSON.stringify({ schemaVersion: 1, servers: { disabled: { enabled: "false", transport: "http", url: "https://disabled.example/mcp" } } }));
  const invalidEnabledResult = spawnSync(process.execPath, [syncScript, "check", "--manifest", invalidEnabledPath], { encoding: "utf8" });
  assert.equal(invalidEnabledResult.status, 1, "A non-boolean enabled value must not activate a server");
  const snapshot = (root) => {
    if (!fs.existsSync(root)) return [];
    const files = [];
    const visit = (directory) => {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        const file = path.join(directory, entry.name);
        files.push([path.relative(root, file), entry.isDirectory() ? null : fs.readFileSync(file).toString("base64")]);
        if (entry.isDirectory()) visit(file);
      }
    };
    visit(root);
    return files;
  };
  const expectRejectedInstall = (root) => {
    const before = snapshot(root);
    const result = spawnSync(process.execPath, [syncScript, "install", "--scope", "project", "--project", root, "--manifest", manifestPath, "--prune"], { encoding: "utf8" });
    assert.equal(result.status, 1, result.stdout);
    assert.deepEqual(snapshot(root), before, "Rejected installation must preserve every destination file");
  };

  const tomlConflicts = [
    '[mcp_servers.local_docs]\ncommand = "my-docs"\n',
    "[ 'mcp_servers' . 'local_docs' . env ]\nTOKEN = 'keep-me'\n",
    '["mcp_servers"."local_\\u0064ocs"]\ncommand = "my-docs"\n',
    '[mcp_servers]\nlocal_docs = { command = "my-docs" }\n',
    'mcp_servers.local_docs.command = "my-docs"\n',
    'mcp_servers = { local_docs = { command = "my-docs" } }\n',
  ];
  for (const [index, toml] of tomlConflicts.entries()) {
    const root = path.join(temporaryHome, `toml-conflict-${index}`);
    fs.mkdirSync(path.join(root, ".codex"), { recursive: true });
    fs.writeFileSync(path.join(root, ".codex", "config.toml"), toml);
    expectRejectedInstall(root);
  }

  const claudeCollisionRoot = path.join(temporaryHome, "claude-collision");
  fs.mkdirSync(claudeCollisionRoot);
  fs.writeFileSync(path.join(claudeCollisionRoot, ".mcp.json"), JSON.stringify({ mcpServers: { local_docs: { command: "my-docs" } } }));
  expectRejectedInstall(claudeCollisionRoot);

  const invalidClaudeRoot = path.join(temporaryHome, "invalid-claude");
  fs.mkdirSync(path.join(invalidClaudeRoot, ".codex"), { recursive: true });
  fs.writeFileSync(path.join(invalidClaudeRoot, ".codex", "config.toml"), 'model = "keep-me"\n');
  fs.writeFileSync(path.join(invalidClaudeRoot, ".mcp.json"), "{ invalid");
  expectRejectedInstall(invalidClaudeRoot);

  const skillCollisionRoot = path.join(temporaryHome, "skill-collision");
  const firstSkill = path.join(skillCollisionRoot, ".agents", "skills", sourceSkillNames[0]);
  const lastSkill = path.join(skillCollisionRoot, ".claude", "skills", sourceSkillNames.at(-1));
  fs.mkdirSync(firstSkill, { recursive: true });
  fs.writeFileSync(path.join(firstSkill, ".ai-agent-config-owner.json"), JSON.stringify({ package: "com.interneted.ai-agent-config", skill: sourceSkillNames[0] }));
  fs.writeFileSync(path.join(firstSkill, "SKILL.md"), "User's existing managed Skill");
  fs.mkdirSync(lastSkill, { recursive: true });
  fs.writeFileSync(path.join(lastSkill, "SKILL.md"), "User's unmanaged Skill");
  expectRejectedInstall(skillCollisionRoot);

  const beforeRetryCodex = fs.readFileSync(path.join(projectRoot, ".codex", "config.toml"), "utf8");
  const retryResult = spawnSync(process.execPath, [syncScript, "install", "--scope", "project", "--project", projectRoot, "--manifest", manifestPath, "--prune"], { encoding: "utf8" });
  assert.equal(retryResult.status, 0, retryResult.stderr);
  assert.equal(fs.readFileSync(path.join(projectRoot, ".codex", "config.toml"), "utf8"), beforeRetryCodex);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(projectRoot, ".mcp.json"), "utf8")), projectClaude);

  const unrelatedRoot = path.join(temporaryHome, "toml-string");
  fs.mkdirSync(path.join(unrelatedRoot, ".codex"), { recursive: true });
  const unrelatedToml = `note = """
[mcp_servers.local_docs]
"""
list = [
  "[mcp_servers.local_docs]",
]
[mcp_servers.unrelated]
command = "keep-me"
["odd\\U00000022table"]
mcp_servers.local_docs.command = "keep-me"
`;
  fs.writeFileSync(path.join(unrelatedRoot, ".codex", "config.toml"), unrelatedToml);
  const unrelatedResult = spawnSync(process.execPath, [syncScript, "install", "--scope", "project", "--project", unrelatedRoot, "--manifest", manifestPath], { encoding: "utf8" });
  assert.equal(unrelatedResult.status, 0, unrelatedResult.stderr);
  assert.ok(fs.readFileSync(path.join(unrelatedRoot, ".codex", "config.toml"), "utf8").startsWith(unrelatedToml));

  console.log("Integration tests passed: scoped installation, managed updates, conflict rejection, and preflight preservation.");
} finally {
  const resolvedTemporaryHome = path.resolve(temporaryHome);
  if (resolvedTemporaryHome.startsWith(path.resolve(os.tmpdir()) + path.sep)) {
    fs.rmSync(resolvedTemporaryHome, { recursive: true, force: true });
  }
}
