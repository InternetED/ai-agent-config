# Changelog

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
- Tighten code-review / diagnosing-bugs / resolving-merge-conflicts / to-spec / to-tickets guidance
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
