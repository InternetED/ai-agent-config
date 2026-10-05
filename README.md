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
replacing unrelated settings. It rejects unmanaged MCP name collisions and
validates configuration and Skill destinations before writing. It creates
backups before changing MCP configuration and stores environment-variable names,
never credentials.

## Source of truth

- `Skills/` contains portable Agent Skills. Each direct child is one Skill.
- `Config/mcp.servers.json` contains vendor-neutral MCP definitions.
- `Scripts/sync.mjs` validates, generates, and installs both client formats.

The package includes 48 Skills: engineering workflows migrated from the former
`ed-engineering` plugin, package management, Vercel discovery/browser automation,
selected Anthropic visual-design and MCP-development workflows, and HumanLayer's
`show-me` visual explanations, plus optional RTK integration guidance.
It does not use a Codex plugin manifest or plugin installation lifecycle.

All 48 Skills have provenance in `upstreams.lock.json`: source repository, exact
upstream directory and commit for imports, or local origin for original Skills.
Update policy distinguishes automatic refresh, manual reconciliation, and local
maintenance. `npm run skill-health` enforces complete, unique source coverage.
See `Documentation~/Maintaining.md` for the source registry and update procedure.

`find-skills` searches for additional skills; use `ask-matt` to select workflows
already bundled here. Its source pin is recorded in `upstreams.lock.json`; MIT
attribution is in `THIRD_PARTY_NOTICES.md` and local routing metadata lives in
`overlays/find-skills/frontmatter.yaml`. The standalone Vercel and Anthropic
imports are not refreshed by `npm run upstreams`; their pins and update policies
are recorded in `upstreams.lock.json`. Project installs made with `npx skills add` live
in ignored `.agents/skills/` and `.claude/skills/` directories; `skills-lock.json`
records the CLI installation for restoration with `npx skills experimental_install`.

`agent-browser` points to version-matched workflows served by the separate
agent-browser CLI (`agent-browser skills get core`). Adding this Skill does not
install that CLI or its browser runtime; see the upstream installation instructions
at https://github.com/vercel-labs/agent-browser before using browser commands.

### Optional RTK integration

RTK is disabled by default. The bundled, explicitly invoked `rtk` Skill provides
setup/removal guidance; copying it does not install a binary or activate hooks.
Install [rtk-ai/rtk](https://github.com/rtk-ai/rtk/blob/develop/INSTALL.md)
separately, then choose the agent and scope:

```sh
# Preview first
npx --yes github:InternetED/ai-agent-config --scope project --rtk both --dry-run
# Enable for this project
npx --yes github:InternetED/ai-agent-config --scope project --rtk both
# Automatic Claude Code Bash integration across projects
npx --yes github:InternetED/ai-agent-config --scope user --rtk claude
```

Use `--rtk codex` for Codex alone. The installer checks the binary and required
init options before package writes, then delegates to native RTK initialization.
It does not download/upgrade RTK or trust custom filters. Restart selected agents.

With verified RTK 0.49.0, project Claude setup adds prompt instructions without a
global hook; Codex uses `AGENTS.md` plus `RTK.md` without a hook. User Claude setup
registers a native Bash rewrite hook and preserves unrelated settings/hooks.
Hook behavior can change with upstream versions. Built-in Read/Grep/Glob tools
are not routed through a Bash hook. User Claude config respects RTK's
`CLAUDE_CONFIG_DIR` override; other locations are determined by native RTK.

RTK initialization is separate from Skills/MCP installation: a later RTK failure
returns nonzero but does not roll back an already successful package install.
Without `--rtk`, RTK is neither checked nor initialized. Omitting the flag on a
later install does **not** disable an existing integration. To remove it, use
`rtk init --uninstall` (Claude) or `rtk init --codex --uninstall` from the project;
add `--global` for user scope. Review the installed version's `init --help` first.
Unity menu and direct `sync.mjs` installs do not initialize RTK; use the CLI opt-in.

### Visual explanations with show-me

Ask `Use show-me to explain this flow visually` in Claude Code or Codex.
The Skill chooses a compact tree, pseudocode, Mermaid diagram, diff, or a focused
HTML artifact rather than a long prose explanation. It is explicitly invoked,
not automatically selected; it complements `frontend-design` and `prototype`
rather than implementing a product UI.

HTML artifacts use the available browser tool or a Windows/macOS/Linux launcher.
Remote/headless sessions receive a path or supported preview link when opening
is unavailable. The MIT license travels with the installed Skill. This standalone
HumanLayer import is not refreshed by `npm run upstreams`; its source pin is in
`upstreams.lock.json`, with local adaptations described in `THIRD_PARTY_NOTICES.md`.

### Selected Anthropic skills

| Skill | Gap filled | Existing workflow boundary |
| --- | --- | --- |
| `frontend-design` | Visual direction, typography, layout, and UI critique | `prototype` explores UI/state; `agent-browser` automates browser interaction. |
| `mcp-builder` | Implement MCP servers with TypeScript/Python SDKs and evaluations | `manage-ai-agent-config` manages definitions and installation, not server implementation. |

The complete MCP scripts/references and per-skill Apache-2.0 licenses are bundled.
Durable frontend routing adaptations live under `overlays/frontend-design/`.
Public upstream CLI installs/restores do not apply that local overlay; use this
package’s installer for its adapted Skills. MCP model-backed evaluations require
the dependencies in `Skills/mcp-builder/scripts/requirements.txt` and Anthropic
API access. Adding the Skills does not install those dependencies.

`skill-creator` was evaluated but is not included: its review generator embeds
unescaped JSON in a script element. A harmless browser smoke confirmed that
`</script><script>…` in eval metadata executes JavaScript in the review page
at the pinned upstream revision. Existing authoring guidance remains in
`writing-for-agents`; adopting this evaluator requires a separately reviewed fix.

Selection excludes `webapp-testing` (overlaps the browser workflow),
`doc-coauthoring` (overlaps existing specification/writing workflows),
Claude-specific onboarding/API guidance, brand/communications/art presets, and
document-format Skills (`docx`, `pdf`, `pptx`, `xlsx`) with proprietary licenses.
The document-format Skills are not bundled or redistributed.

### Recent skill updates (on main)

- **pr** (imported) — Shapes PR bodies around a compact visual summary,
  before/after evidence, and an explicit merge-danger call while retaining Draft
  and human gates.
- **GLOSSARY convention** — Domain vocabulary files now use `GLOSSARY.md`,
  `GLOSSARY-MAP.md`, and `GLOSSARY-FORMAT.md` across imported skills and
  durable overlays.
- **implement-spec** / **ask-matt** — Selectively absorb upstream integration-
  branch orchestration and `pr` / `retro` routing while preserving Ed retry,
  verification, Draft, local-skill, and human gates.
- **upstream provenance** — Pin mattpocock/skills v1.3 at `d81f3a1`; retain
  intentional overlay differences and local-only skills.
- **tdd** — Targeted tests only each red→green cycle (path/`-t`); never default
  to the full suite. Full suite only before commit/PR or when asked. Unit every
  cycle; integration/e2e when that seam changes or at wrap-up. Read
  `GLOSSARY.md` / test config first.
- **implement** — Targeted tests every cycle; full suite only at end / before
  commit/PR. Does not auto-commit: propose via `ce-commit` and wait unless asked.
  Exclusive vs `implement-spec` (multi-ticket PR factory).
- **verification-before-completion** (new) — No completion / fixed / passing
  claims without fresh command evidence; prefer targeted verification.
- **security-review** (new) — OWASP-oriented pass: secrets, authz, injection,
  validation, sensitive data, dependency CVEs; severity-ranked findings.
- **code-review** — For tiny diffs (one or two files, or a handful of hunks),
  review both axes in-session; do not spawn two sub-agents.
- **diagnosing-bugs** — Phases may be skipped when justified; Phase 1 (feedback
  loop) is never optional.
- **to-spec** / **to-tickets** — Skip the confirmation quiz when the
  conversation already made requirements / breakdown unambiguous.

## Update

Run the installation command again to use the current `main` branch. Pin a
release when reproducibility matters:

```sh
npx --yes github:InternetED/ai-agent-config#v0.8.0
```

Releases are automated by GitHub Actions: after a `main` merge passes validation,
a new stable `package.json` version creates a matching Git tag and GitHub Release
from its changelog section. Already published versions are skipped. This is
GitHub-backed npx distribution, not npm registry publishing.

Imported upstream versions are pinned in `upstreams.lock.json`. Maintainers can
preview or apply upstream changes with:

```sh
npm run upstreams
npm run upstreams -- --apply
```

Local Skills `ed-brainstorm`, `manage-ai-agent-config`, `security-review`, and
`verification-before-completion` are protected from upstream overwrites. Durable
edits to upstream-synced skills live under `overlays/` and are re-applied after
`--apply`. Updates validate the staged result before replacing repository inputs.
To also install, pass `--apply --install --scope user` or
`--apply --install --scope project [--project PATH]`; scope is never implicit.
Ownership and correction-driven growth are in Maintaining.

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
npm run skill-health   # quiet when healthy; also part of npm test
npm test
npm pack --dry-run
```

Maintainer event checklists (post-upstream re-audit, prune criteria, empty MCP
catalog note) live in [Documentation~/Maintaining.md](Documentation~/Maintaining.md).

Release tags use semantic versions and must match `package.json`.
