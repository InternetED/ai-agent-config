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

## Deferred P1 (not in this PR)

- Upstream skill refresh (`npm run upstreams`) — re-audit changed descriptions only; never overwrite `ed-brainstorm`.
- Fat skill progressive disclosure (extract refs): `wayfinder`, `to-tickets`, `scaffold-exercises`, `migrate-to-shoehorn`, `setup-ts-deep-modules` — deferred; no huge refactors in P0.
- Optional: `disable-model-invocation` for niche `wait-what` / `loop-me`; openai.yaml policy note in Maintaining; empty MCP `servers: {}` intent doc.

## Top 5 (from audit) — status

1. implement vs implement-spec exclusive descriptions — **done**
2. grill wrappers + handoff/claude-handoff — **done**
3. code-review escape + normalize — **done**
4. fat-skill progressive disclose — **deferred P1** (noted above)
5. weak-trigger batch + ed-workflow removal — **done**
