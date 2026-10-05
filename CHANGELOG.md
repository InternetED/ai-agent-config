# Changelog

## [Unreleased]

## [0.8.0] - 2026-10-05

- Refresh the automatic Matt Pocock imports from upstream main, retaining durable overlays, standalone/manual provenance, and locally maintained Skills; compound-engineering remains at its existing upstream revision.
- Record provenance for all 48 Skills in the upstream lock: repository, exact import paths/pins, local origins, and explicit update policies. Enforce complete unique ownership, preserve standalone/local records during refresh, update moved upstream paths, and use one revision source of truth in third-party notices. Include RTK upstream/documentation links and its verified CLI version in the bundled Skill.
- Add opt-in RTK initialization via `--rtk claude|codex|both`, preserving explicit user/project scope, checking the separately installed binary before package writes, and delegating configuration to native RTK. Bundle setup/removal guidance without enabling RTK by default; ignore local RTK command-history databases and SQLite sidecars.
- Add HumanLayer’s `show-me` visual-explanation Skill with pinned MIT provenance, explicit-invocation metadata for Claude Code and Codex, portable HTML opening, and bundled license.
- Automate stable GitHub tags and Releases after successful main validation; skip published versions, preserve existing tags, and use version-specific changelog notes with job-scoped permissions.

## [0.7.0] - 2026-10-02

- Add selected Anthropic `frontend-design` and `mcp-builder` Skills with complete supporting resources, pinned provenance, and Apache-2.0 licenses; preserve scoped frontend routing in a durable overlay and exclude `skill-creator` after confirming a review-page script-injection risk.
- Add Vercel’s `agent-browser` Skill with pinned source attribution and Apache-2.0 license; document its separately installed CLI/browser runtime.
- Add Vercel’s `find-skills` discovery workflow, scoped routing metadata, pinned source attribution, and MIT license; preserve project-level Skills CLI installation metadata.
- Reject unmanaged MCP name collisions and non-boolean `enabled` values; preflight configuration and all Skill destinations before installation writes.
- Protect all durable local Skills from upstream imports and require explicit scope for upstream apply/install.
- Validate staged upstream updates and optional install destinations before promoting Skills, licenses, and lock pins.
- Fix overlay dry-run replacement/merge parity, validate all overlay plans before writes, and reject full-file overlays without effective name metadata in skill health.
- Add isolated installation and upstream regression coverage, using local Git fixtures without network access.

- Reconcile mattpocock/skills v1.3: import `pr` with a thin authority overlay, remove `resolving-merge-conflicts`, and pin upstream provenance to `d81f3a1`.
- Rename domain glossary files from CONTEXT to GLOSSARY across imported skills, durable overlays, and supporting references.
- Selectively absorb `implement-spec` integration-branch orchestration and `ask-matt` routing for `implement-spec`, `pr`, and `retro` while retaining Draft, verification, local-skill, and human gates.
- Preserve intentional Ed differences: `ce-commit` wording, overlay-preview noise, local-only skills, and the deletion of `ed-workflow`.

## [0.6.0] - 2026-09-24

- Align skill guidance with authority boundaries, including Use when / Not for, verification, and human gates
- Remove ed-workflow; reduce the skill count from 43 to 42
- Add progressive disclosure with thin SKILL.md routers and sibling reference files for larger skills
- Add local overlays with frontmatter merging, file replacement, and disable-model-invocation pass-through
- Promote durable edits to upstream-synced skills into overlays
- Add a quiet skill-health gate, prune criteria, and maintainer event checklists for npm and documentation
- README documents 42 skills; pin example points at v0.6.0

## [0.5.0] - 2026-09-18

- New skills: verification-before-completion, security-review
- Harden implement-spec (retry, per-ticket test gate, merger conflict handling)
- TDD/implement: prefer targeted tests
- Tighten code-review / diagnosing-bugs / to-spec / to-tickets guidance
- Improve grill-me / grilling from Matt Pocock feedback
- README documents 43 skills

## [0.4.0] - 2026-09-03

- Add a cross-platform interactive installer that runs directly from the public GitHub repository.
- Let users choose user-level or project-level Skills and MCP configuration.
- Require an explicit scope for non-interactive installation.
- Stop automatically modifying user configuration when Unity imports the OpenUPM package.
- Keep OpenUPM as an optional Unity-specific installation entry point.

## [0.3.0] - 2026-09-03

- Automatically synchronize Skills and MCP configuration when Unity loads a newly installed or upgraded OpenUPM package version.
- Keep manual Unity menu commands only as validation and repair actions.
- Verify the automatic-install entry point in integration tests.

## [0.2.0] - 2026-09-03

- Import 40 engineering workflow skills from the former `ed-engineering` plugin.
- Preserve pinned upstream source commits and third-party license notices.
- Add a cross-platform updater that previews or applies current upstream Skills.
- Keep the OpenUPM package as the sole distribution and synchronization format.

## [0.1.0] - 2026-09-03

- Add shared Agent Skills installation for Claude Code and Codex.
- Add vendor-neutral MCP manifest generation and safe user-config merging.
- Add Unity Editor commands for validation and installation.
- Add cross-platform validation and integration tests.
