---
name: rtk
description: "Set up, inspect, or remove the optional rtk-ai/rtk command-output integration when explicitly requested; not for silently enabling it during ordinary coding."
disable-model-invocation: true
---

# Optional RTK integration

RTK compresses CLI output. Installing this Skill does not install its binary,
register hooks, or authorize activation. Never enable RTK without the user's
explicit request and choice of agent and user/project scope.

## Use when / Not for

Use when explicitly asked to configure, inspect, or remove RTK. Not for routine
coding or automatic activation just because the Skill is installed.

## Setup

1. Run `rtk --version`, `rtk gain`, and `rtk init --help`. `gain` distinguishes
   rtk-ai/rtk from the unrelated Rust Type Kit. If missing or incompatible,
   follow https://github.com/rtk-ai/rtk/blob/develop/INSTALL.md; do not uninstall
   an existing executable or pipe a remote installer into a shell automatically.
2. Use this package's installer with `--rtk claude`, `--rtk codex`, or
   `--rtk both` and an explicit `--scope user` or `--scope project`.
   Add `--dry-run` to preview. Without `--rtk`, installation never initializes RTK.
3. Restart the selected agents. Verify a supported command such as `rtk ls .`.
   For user-level Claude hooks, also inspect `rtk init --show` and exercise an
   actual Bash tool call after restarting Claude Code.

The installer delegates to the installed RTK's native initialization, preserving
its configuration merge/backup behavior. It does not auto-install or upgrade RTK,
trust custom filters, or use Skills as a substitute for executable installation.

## Scope and behavior

- Project Claude setup is prompt-based (`CLAUDE.md`), not a global Bash hook.
- User Claude setup registers the upstream automatic Bash hook. Built-in
  Read/Grep/Glob tools do not pass through that hook.
- Codex initialization uses `--codex`; hook availability depends on the installed
  RTK and Codex versions. RTK 0.49.0 uses `AGENTS.md` plus `RTK.md`, without a hook.
- Honor the runtime's specialized-tool requirements. RTK does not authorize
  replacing file, search, or code-intelligence tools with shell equivalents.
- Use original commands when unfiltered output is needed; compressed output can
  omit details relevant to diagnosis. Do not add RTK prefixes when a hook already
  rewrites commands automatically.

## Removal

From the selected project, use `rtk init --uninstall` for Claude or
`rtk init --codex --uninstall` for Codex. Add `--global` only for user scope.
Review `rtk init --help` first: uninstall support and artifacts depend on version.
Removing this Skill or rerunning the installer without `--rtk` does not undo
previously enabled RTK integration. Never restore an entire old settings backup
blindly over newer unrelated settings.
