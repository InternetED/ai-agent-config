# AI Agent Config

Maintain MCP servers and Agent Skills once, then install the same definitions
for Claude Code and Codex. The repository is also a Unity Package Manager
package that can be distributed through OpenUPM.

## Source of truth

- `Skills/` contains portable Agent Skills. Each direct child is one skill.
- `Config/mcp.servers.json` contains vendor-neutral MCP definitions.
- `Scripts/sync.mjs` validates, generates, and installs both platform formats.

Generated files and files under your user profile are outputs, not authoring
locations.

## Install from OpenUPM

After the package is listed on OpenUPM:

```sh
openupm add com.interneted.ai-agent-config
```

Node.js 18 or newer is required for synchronization. In Unity, select:

```text
Tools > AI Agent Config > Install or Update
```

The installer copies managed skills into both user-level skill directories and
merges managed MCP entries without replacing unrelated settings:

- Codex skills: `~/.agents/skills/`
- Claude Code skills: `~/.claude/skills/`
- Codex MCP: `~/.codex/config.toml`
- Claude Code MCP: `~/.claude.json`

You can also run the package script directly:

```sh
node Scripts/sync.mjs check
node Scripts/sync.mjs generate
node Scripts/sync.mjs install --prune
```

Use `node Scripts/sync.mjs help` for options. Installation creates backups
before changing MCP configuration. It never stores credentials; manifests
refer to environment-variable names instead.

## Maintain the repository

Read [Documentation~/Maintaining.md](Documentation~/Maintaining.md) before
adding a skill or MCP server. Then run:

```sh
npm run check
npm test
npm pack --dry-run
```

OpenUPM releases use semantic-version tags. The tag version must match the
`version` field in `package.json`.
