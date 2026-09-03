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

  const unityInstaller = fs.readFileSync(path.join(scriptDirectory, "..", "Editor", "AIAgentConfigInstaller.cs"), "utf8");
  assert.doesNotMatch(unityInstaller, /\[InitializeOnLoad\]/, "OpenUPM must not silently choose an installation scope");
  assert.match(unityInstaller, /install --scope user --prune/, "Unity must offer user-scope installation");
  assert.match(unityInstaller, /install --scope project/, "Unity must offer project-scope installation");

  console.log("Integration test passed: user and project scopes install shared inputs for Claude Code and Codex without replacing unrelated configuration.");
} finally {
  const resolvedTemporaryHome = path.resolve(temporaryHome);
  if (resolvedTemporaryHome.startsWith(path.resolve(os.tmpdir()) + path.sep)) {
    fs.rmSync(resolvedTemporaryHome, { recursive: true, force: true });
  }
}
