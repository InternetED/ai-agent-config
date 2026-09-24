---
name: manage-ai-agent-config
description: Add, update, remove, or validate shared MCP definitions and Agent Skills in this authority repo. Use when changing Skills/ or Config/mcp.servers.json here; Not for editing installed client copies under ~/.claude or ~/.codex.
---

# Manage AI Agent Config

Read `Documentation~/Maintaining.md` before changing the repository.

Treat `Skills/` and `Config/mcp.servers.json` as authoritative inputs. Change
installed or generated files only by running `node Scripts/sync.mjs`; never use
them as the source of a change.

When installing, preserve the user's choice of scope. Use `--scope user` for
user-level configuration or `--scope project` for repository-local
configuration. Never install or update without an explicit scope, and never
silently promote a project installation to user scope. Never invent scopes
beyond `user` and `project`.

For a skill change, keep the skill portable across Claude Code and Codex unless
the request explicitly requires a platform extension. For an MCP change, store
environment-variable names rather than credential values.

Do not change `upstreams.lock.json` unless the task is an upstream refresh.
Local skills `ed-brainstorm` and `ed-workflow` must never be overwritten by the
upstream updater.

Run `node Scripts/sync.mjs check` and `npm test` after changes. The task is
complete when all authoritative inputs validate, generated Claude and Codex
configurations represent the same enabled servers, and unrelated user
configuration remains preserved by the integration test.
