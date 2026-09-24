---
name: manage-ai-agent-config
description: Maintain Skills/ and MCP server definitions in this authority repo. Use when editing Skills/ or Config/mcp.servers.json; Not for installed ~/.claude or ~/.codex copies.
---

# Manage AI Agent Config

Read `Documentation~/Maintaining.md` before changing the repository.

Treat `Skills/` and `Config/mcp.servers.json` as authoritative inputs. Change
installed or generated files only by running `node Scripts/sync.mjs`; never use
them as the source of a change.

## Use when / Not for

- **Use when:** adding, updating, removing, or validating shared skills or MCP definitions in this repo.
- **Not for:** hand-editing installed client copies under `~/.claude` or `~/.codex`, inventing scopes beyond `user`/`project`, or recreating deleted skills such as `ed-workflow`.

When installing, preserve the user's choice of scope. Use `--scope user` for
user-level configuration or `--scope project` for repository-local
configuration. Never install or update without an explicit scope, and never
silently promote a project installation to user scope. Never invent scopes
beyond `user` and `project`.

For a skill change, keep the skill portable across Claude Code and Codex unless
the request explicitly requires a platform extension. For an MCP change, store
environment-variable names rather than credential values.

Do not change `upstreams.lock.json` unless the task is an upstream refresh.
Local skill `ed-brainstorm` must never be overwritten by the upstream updater.
Durable edits to upstream-synced skills belong under `overlays/` (see Maintaining ownership split + correction-driven growth);
do not expect bare `Skills/` edits alone to survive `npm run upstreams -- --apply`. Local-only skills (`ed-brainstorm`, this skill, `security-review`, `verification-before-completion`) stay in `Skills/` without overlays.

**Human gate:** open a **Draft** PR for skill/MCP authority changes; do not merge yourself. Do not push destructive git operations without an explicit user request.

## Verification

Run `node Scripts/sync.mjs check` and `npm test` after changes. The task is
complete when both pass, every `Skills/*/SKILL.md` validates, generated Claude and Codex
configurations represent the same enabled servers, and unrelated user
configuration remains preserved by the integration test.
