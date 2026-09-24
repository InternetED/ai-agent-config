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

- `ask-matt` remains intentionally unsplit: it is a router whose body is the discoverable map/index, and thinning it would hide the routes it exists to expose.
- `disable-model-invocation` remains intentionally deferred. `Scripts/sync-upstreams.mjs` strips that upstream key and no live skill uses it, so `wait-what` and `loop-me` remain model-reachable until the repository defines both a local convention and sync policy.
- A post-upstream-refresh audit remains a future re-check only; the structural work below is complete and not blocked on that refresh.

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

## P2 progressive disclosure (Draft)

**Date:** 2026-09-24

Restructured the remaining clear, low-risk fat-skill candidates as thin workflow routers. Must-run steps, human gates, and verification remain in each `SKILL.md`; detailed reference material loads only when its pointer condition applies.

| Skill | SKILL.md lines | New sibling files |
| --- | ---: | --- |
| `teach` | 144 → 59 | `philosophy.md`, `lessons.md` |
| `diagnosing-bugs` | 138 → 51 | `phases.md` |
| `triage` | 111 → 66 | `reference.md` |
| `setup-matt-pocock-skills` | 115 → 53 | `reference.md` |
| `codebase-design` | 114 → 55 | `reference.md` |
| `code-review` | 95 → 46 | `smells.md` |
| `git-guardrails-claude-code` | 95 → 45 | `reference.md` |
| `setup-pre-commit` | 91 → 39 | `reference.md` |

### Done

- Added explicit Use when / Not for guidance to all eight restructured skills and, as a small high-traffic residual, to `to-spec`, `improve-codebase-architecture`, `tdd`, and `domain-modeling`.
- Preserved the `triage` AI-posting disclaimer and sequential workflow, the diagnosing Phase 1 gate, and the code-review requirement to paste the complete smell baseline into the Standards prompt.
- Confirmed live skills contain no route to `ed-workflow`. Historical audit discussion remains only in this document.
- Skill inventory remains **Valid skills: 42**; no skill was added or removed.

All P2-touched skill directories are synchronized from `mattpocock-skills`. A later `npm run upstreams -- --apply` may overwrite descriptions, routers, sibling references, and trigger polish; review that diff and reapply intentional local progressive-disclosure changes after refresh.

### Intentionally deferred

- `ask-matt`: its body is the router map/index, so further thinning would harm discoverability.
- `disable-model-invocation`: deferred until a local convention and `Scripts/sync-upstreams.mjs` policy exist; upstream sync currently strips the key, so `wait-what` and `loop-me` remain model-reachable.
- Post-upstream re-audit: future re-check only, not a blocker for completed structural work.
