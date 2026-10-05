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

Record every added/removed Skill in `upstreams.lock.json`: source repository,
exact upstream directory and commit for imports, or `localSkills` for originals.
Preserve existing pins unless intentionally refreshing that source. Keep
attribution/licenses in `THIRD_PARTY_NOTICES.md`; do not duplicate revision pins.
Local Skills must never be overwritten by the upstream updater.
Durable edits to automatically synced Skills belong under `overlays/`; for manual
imports, reconcile local adaptations before replacing files. Original/local
Skills stay in `Skills/` without overlays. Read Maintaining for update policies.

**Human gate:** open a **Draft** PR for skill/MCP authority changes; do not merge yourself. Do not push destructive git operations without an explicit user request.

## Verification

Run `node Scripts/sync.mjs check`, `npm run skill-health`, and `npm test` after
changes. The task is complete when those pass, every `Skills/*/SKILL.md`
validates, overlays are healthy (no orphans/mismatches), generated Claude and Codex
configurations represent the same enabled servers, and unrelated user
configuration remains preserved by the integration test. Empty MCP `servers: {}`
is a valid packaging state — see Maintaining.
