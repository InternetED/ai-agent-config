#!/usr/bin/env node

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const syncScript = path.join(scriptDirectory, "sync.mjs");
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

  const result = spawnSync(process.execPath, [syncScript, "install", "--home", temporaryHome, "--manifest", manifestPath, "--prune"], {
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

  for (const skillRoot of [path.join(temporaryHome, ".agents", "skills"), path.join(temporaryHome, ".claude", "skills")]) {
    assert.equal(fs.existsSync(path.join(skillRoot, "manage-ai-agent-config", "SKILL.md")), true);
    assert.equal(fs.existsSync(path.join(skillRoot, "manage-ai-agent-config", ".ai-agent-config-owner.json")), true);
  }

  console.log("Integration test passed: shared inputs installed for Claude Code and Codex without replacing unrelated configuration.");
} finally {
  const resolvedTemporaryHome = path.resolve(temporaryHome);
  if (resolvedTemporaryHome.startsWith(path.resolve(os.tmpdir()) + path.sep)) {
    fs.rmSync(resolvedTemporaryHome, { recursive: true, force: true });
  }
}
