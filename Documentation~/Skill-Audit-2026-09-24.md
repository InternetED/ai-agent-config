# Skill Audit — 2026-09-24

- **Repo:** InternetED/ai-agent-config (P0 Draft on `draft/skill-p0-field-notes-align`)
- **Inventory:** **42** skills under `Skills/`
- **OMP:** Original audit used Grok box; this removal follow-up used OMP.
- **Authority:**
  1. `grokbot-field-notes` → `agents/SKILLS-AND-ROUTINES.md` (when applies / when not; inputs; steps; how checked; output; approval; no session overfit)
  2. In-repo `Skills/writing-for-agents` (description = context pointer with trigger branches; progressive disclosure; completion criteria)
  3. Maintainer rules: edit `Skills/` only; `node Scripts/sync.mjs check` + `npm test`; Draft PR not merge; no Cursor Cloud Agent; never overwrite `ed-brainstorm` via upstream updater; do not change `upstreams.lock.json`

Full read-only audit source (pre-PR): see also `/workspace/ai-agent-config-skill-audit.md` on the box if present. This file is the PR-facing summary.

## Inventory note

42 skills (ask-matt … writing-shape). Thin wrappers: `grill-me`, `grill-with-docs`, `wait-what`. Size outliers (≥100 lines): diagnosing-bugs, teach, wayfinder, migrate-to-shoehorn, setup-matt-pocock-skills, codebase-design, triage, scaffold-exercises, to-tickets, setup-ts-deep-modules.

## P0 changes in this Draft

| Area | Change |
| --- | --- |
| `ed-brainstorm` | Dropped obsolete `$` skill prefixes in next-step recommendations (`to-spec`, `grill-with-docs`, `to-tickets`). |
| `ed-workflow` | Removed entirely per Ed decision 2026-09-24. The skill directory was deleted; routing now uses `ask-matt` or direct named skills, with no replacement mega-router. |
| `implement` / `implement-spec` | Exclusive Use when / Not for; verification-before-completion before success claims; `implement` does **not** auto-commit (propose via `ce-commit` and wait unless user already asked). |
| `grill-me` / `grill-with-docs` | Descriptions: Use when / when not (stateless vs docs trail); one-line completion criterion; keep thin wrappers. |
| `handoff` / `claude-handoff` | Disambiguated (handoff file vs Claude `--bg` agent); handoff completion = absolute path reported. |
| `code-review` | Fixed frontmatter `\\"` escape glitch; normalized description; When not. |
| `verification-before-completion` | Description leads with verify/complete/fixed/passing triggers; When not. |
| `manage-ai-agent-config` | Paths match repo (`Documentation~/Maintaining.md`); scopes only `user`/`project`; never invent scopes. |
| Weak-trigger batch | `retro`, `teach`, writing triad (`writing-fragments` / `writing-beats` / `writing-shape`), `ask-matt` — Use when + Not for. |

## Deferred follow-up

- Upstream skill refresh (`npm run upstreams`) — re-audit changed descriptions only; never overwrite `ed-brainstorm`.
- Fat-skill progressive disclosure for the focused five is complete in the P1 section below; this does not claim every size outlier is resolved.
- Optional: `disable-model-invocation` for niche `wait-what` / `loop-me`; openai.yaml policy note in Maintaining; empty MCP `servers: {}` intent doc.

## Top 5 (from audit) — status

1. implement vs implement-spec exclusive descriptions — **done**
2. grill wrappers + handoff/claude-handoff — **done**
3. code-review escape + normalize — **done**
4. fat-skill progressive disclose — **done for the focused five** (not all outliers)
5. weak-trigger batch + ed-workflow removal — **done**

## P1 progressive disclosure (Draft)

**Date:** 2026-09-24

- Restructured `wayfinder`, `to-tickets`, `scaffold-exercises`, `migrate-to-shoehorn`, and `setup-ts-deep-modules` as thin `SKILL.md` routers with explicit Use when / Not for, workflows, human gates where applicable, verification, and load-on-demand pointers.
- Split `wayfinder/reference.md` and `wayfinder/fog-and-scope.md`; `to-tickets/reference.md`; `scaffold-exercises/reference.md`; `migrate-to-shoehorn/examples.md`; and `setup-ts-deep-modules/reference.md`.
- Sync expectation remains **Valid skills: 42**; no skill was added or removed.
- These five skills are upstream-synced from `mattpocock-skills`. Their description and body edits may be overwritten by the next `npm run upstreams -- --apply`; re-audit and reapply intentional local progressive-disclosure changes after an upstream refresh.
- Focused fat-skill progressive disclosure is **done** for these five, not for all size outliers.

### Residual P2 backlog

- `teach` remains fat despite its format files.
- `diagnosing-bugs`.
- `triage`.
- `setup-matt-pocock-skills`.
- Optional `disable-model-invocation` review for niche skills.
- Re-audit descriptions and progressive disclosure after the upstream refresh.
