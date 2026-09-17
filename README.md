# AI Agent Config

Maintain MCP servers and Agent Skills once, then install the same definitions
for Claude Code and Codex. The public Git repository is the source of truth and
can be run directly with Node.js on Windows, macOS, and Linux.

## Install

Run this command from any terminal with Node.js 18 or newer:

```sh
npx --yes github:InternetED/ai-agent-config
```

Like the `skills` installer, this asks where the files should live instead of
silently choosing for you:

| Scope | Skills | Codex MCP | Claude Code MCP |
| --- | --- | --- | --- |
| User | `~/.agents/skills`, `~/.claude/skills` | `~/.codex/config.toml` | `~/.claude.json` |
| Project | `.agents/skills`, `.claude/skills` | `.codex/config.toml` | `.mcp.json` |

For scripts or CI, choose the scope explicitly:

```sh
npx --yes github:InternetED/ai-agent-config --scope user
npx --yes github:InternetED/ai-agent-config --scope project
```

Project scope defaults to the current directory. Use `--project PATH` to target
another project. Restart an agent session that was already open if it does not
detect new Skills immediately.

The installer copies managed Skills and merges managed MCP entries without
replacing unrelated settings. It creates backups before changing MCP
configuration and stores environment-variable names, never credentials.

## Source of truth

- `Skills/` contains portable Agent Skills. Each direct child is one Skill.
- `Config/mcp.servers.json` contains vendor-neutral MCP definitions.
- `Scripts/sync.mjs` validates, generates, and installs both client formats.

The package includes 43 Skills: engineering workflows migrated from the former
`ed-engineering` plugin, plus the package-management Skill. It does not use a
Codex plugin manifest or plugin installation lifecycle.

### Recent skill updates (on main)

- **tdd** — Targeted tests only each red→green cycle (path/`-t`); never default
  to the full suite. Full suite only before commit/PR or when asked. Unit every
  cycle; integration/e2e when that seam changes or at wrap-up. Read
  `CONTEXT.md` / test config first.
- **implement** — Targeted tests every cycle; full suite only at end / before
  commit/PR.
- **implement-spec** — Subagent failure: max 2 retries (3 attempts), then mark
  failed and continue the frontier. Per-ticket targeted test gate (self-report
  insufficient). Merger conflicts: preserve intents or stop and ask.
- **verification-before-completion** (new) — No completion / fixed / passing
  claims without fresh command evidence; prefer targeted verification.
- **security-review** (new) — OWASP-oriented pass: secrets, authz, injection,
  validation, sensitive data, dependency CVEs; severity-ranked findings.
- **code-review** — For tiny diffs (one or two files, or a handful of hunks),
  review both axes in-session; do not spawn two sub-agents.
- **diagnosing-bugs** — Phases may be skipped when justified; Phase 1 (feedback
  loop) is never optional.
- **resolving-merge-conflicts** — Run checks relevant to conflicted files, not
  the full suite by default.
- **to-spec** / **to-tickets** — Skip the confirmation quiz when the
  conversation already made requirements / breakdown unambiguous.

## Update

Run the installation command again to use the current `main` branch. Pin a
release when reproducibility matters:

```sh
npx --yes github:InternetED/ai-agent-config#v0.4.0
```

Imported upstream versions are pinned in `upstreams.lock.json`. Maintainers can
preview or apply upstream changes with:

```sh
npm run upstreams
npm run upstreams -- --apply
```

`ed-brainstorm` and `ed-workflow` are local Skills and are never overwritten by
the upstream updater.

## Optional Unity installation

The repository remains compatible with Unity Package Manager and OpenUPM. After
adding `com.interneted.ai-agent-config`, choose one of these Unity menu actions:

```text
Tools > AI Agent Config > Install > User Scope
Tools > AI Agent Config > Install > Project Scope
```

Unity never selects or installs a scope automatically. See
[Documentation~/OpenUPM.md](Documentation~/OpenUPM.md) for publishing details.

## Maintain the repository

Read [Documentation~/Maintaining.md](Documentation~/Maintaining.md) before
adding a Skill or MCP server. Then run:

```sh
npm run check
npm test
npm pack --dry-run
```

Release tags use semantic versions and must match `package.json`.
