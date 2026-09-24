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

## Authority gap pass (Draft)

**Date:** 2026-09-24 (Asia/Taipei)
**Branch:** `draft/skill-authority-align`
**Base HEAD:** `3a361ee` (post #14)
**Authorities:** `unicodef1wn/grokbot-field-notes` @ `02780c0` → `agents/SKILLS-AND-ROUTINES.md` (+ `VERIFICATION.md`); in-repo `Skills/writing-for-agents` (+ `SKILL-MECHANICS.md`); `Documentation~/Maintaining.md`; Cursor skill-authoring principles (reusable, trigger description, progressive disclosure).

### Inventory vs checklist (gap table)

| Skill | Gap class before | Action | Authority rule |
| --- | --- | --- | --- |
| `ce-commit` | Missing Not for; broken `ce-commit-push-pr` link; weak push gate | **Edit** | SKILLS-AND-ROUTINES “when / when not”; “approval”; no broken peer refs |
| `ed-brainstorm` | Missing Use when / Not for body; `ce-plan` wording | **Edit** | when/when-not; human confirm gate; prefer local durable fix |
| `grill-me` | Not for only in description | **Edit** | when/when-not in skill body |
| `grilling` | Missing Not for | **Edit** | when/when-not; stay interviewer (approval before act) |
| `handoff` | Not for only in description | **Edit** | when/when-not; completion = path reported |
| `loop-me` | Weak description; missing Use/Not | **Edit** | description as trigger; when/when-not; how checked |
| `manage-ai-agent-config` | Desc long; weak Draft/merge gate | **Edit** | local durable; Maintaining Draft not merge; verification = check+test |
| `prototype` | Missing Not for + verification | **Edit** | when/when-not; how result checked |
| `research` | Desc long; missing Not for + verification | **Edit** | when/when-not; how checked (cited file) |
| `resolving-merge-conflicts` | Thin; missing Not for/verif/gate | **Edit** | when/when-not; error+approval not happy path only; how checked |
| `security-review` | Missing Not for/verif/Critical gate | **Edit** | local durable; VERIFICATION + approval on Critical/High |
| `to-questionnaire` | Weak description; missing Use/Not | **Edit** | when/when-not; how checked |
| `to-spec` | Missing publish verification / gate polish | **Edit** | how checked; human gate on seams |
| `wait-what` | Niche trigger only | **Edit** | when/when-not (still model-invoked; disable-model deferred) |
| `wizard` | Desc too long; Not for implicit | **Edit** | description as trigger pointer; when/when-not; human confirm |
| `writing-for-agents` | Missing Not for | **Edit** | when/when-not |
| `writing-beats` / `writing-shape` | Desc long | **Edit** | writing-for-agents pointer pruning |
| `implement-spec` | Desc long | **Edit** | pointer pruning |
| `ask-matt` | Local skills undiscoverable | **Edit** | router skill (SKILL-MECHANICS); keep map, add local pointers — not a mega-router |

### CRUD summary

| Op | Items | Rationale |
| --- | --- | --- |
| **Add** | _(none)_ | No missing capability: verification, handoff, grilling, manage-config already exist. Prefer improve over invent. |
| **Edit** | 19 skills listed above | Clear field-notes / writing-for-agents violations remaining after P0–P2. |
| **Delete** | _(none)_ | No redundant/harmful skill safe to remove; thin wrappers kept; `ed-workflow` stays gone. |

### Overwrite risks

Upstream-synced (`mattpocock-skills` / `compound-engineering-plugin`) skills edited here may be overwritten by `npm run upstreams -- --apply`: `ce-commit`, `grill-me`, `grilling`, `handoff`, `loop-me`, `prototype`, `research`, `resolving-merge-conflicts`, `to-questionnaire`, `to-spec`, `wait-what`, `wizard`, `writing-for-agents`, `writing-beats`, `writing-shape`, `implement-spec`, `ask-matt`. Re-apply intentional local fixes after refresh.

**Local-only (durable):** `ed-brainstorm`, `manage-ai-agent-config`, `security-review`, `verification-before-completion` (unchanged this pass except cross-links via ask-matt).

### Intentionally deferred (justified)

- `disable-model-invocation` for `wait-what` / `loop-me`: `Scripts/sync-upstreams.mjs` strips the key on import; no safe sync-policy fix in this PR.
- Empty MCP `servers: {}` packaging note in Maintaining: docs polish, not an authority violation in Skills/.
- Post-upstream re-audit after next `upstreams --apply`.

### Residual backlog for “authority violations” class

**Empty.** Remaining items are packaging/policy deferrals only (above).

## Near-term: overlay layer + sync policy + re-audit (Draft)

**Date:** 2026-09-24 (Asia/Taipei)
**Branch:** `draft/skill-overlay-sync-policy`
**Base HEAD:** `961906b` (post #15)
**Goal:** Make intentional local authority edits to upstream-synced skills durable across `npm run upstreams -- --apply`, with an explicit `disable-model-invocation` policy and a lightweight post-apply re-audit.

### Shipped

| Item | What |
| --- | --- |
| Overlay mechanism | `overlays/<skill>/frontmatter.yaml` (merge) + other files (full replace); `Scripts/overlays.mjs`; hooked after `--apply`; `--overlays-only` / `npm run overlays` |
| Sync policy | Pass through `disable-model-invocation`; keep stripping `argument-hint`; documented in Maintaining |
| Seed overlays | `wait-what`, `loop-me` re-assert `disable-model-invocation: true` |
| Re-audit docs | Event-driven checklist in `Documentation~/Maintaining.md` (apply → overlays → check/test → short authority skim → promote survivors) |
| Tests | `Scripts/test-overlays.mjs` wired into `npm test` |

### Not in this PR (deferred / mid-term)

- Migrating every P1/P2/authority progressive-disclosure rewrite into full-file overlays (large copy set; do opportunistically when an apply would wipe a specific skill).
- Forking upstream skills into `protectedLocalNames` beyond `ed-brainstorm`.
- Recreating `ed-workflow`, another mass progressive-disclose pass, or inventing a mega-router.
- Empty MCP catalog packaging note.

### Process reflection

| Question | Answer |
| --- | --- |
| Is overlay the right durability mechanism vs forking upstream skills locally? | **Yes for near-term.** Forking (`protectedLocalNames`) stops upstream file updates entirely and is right only for intentionally local skills (`ed-brainstorm`). Overlays keep receiving upstream copies, then re-assert local keys/files and fail loudly on missing targets. If mid-flight we had found that almost every synced skill was fully rewritten, forking or dropping upstream for those names would be simpler — that is not the case today. |
| Does the chosen patch format survive real sync? | **Frontmatter merge + optional full-file replace**, not unified diffs. Diffs are brittle against upstream churn and hard for maintainers to edit. Full-file replace is honest about divergence; frontmatter merge covers the `disable-model-invocation` case without blocking upstream body updates. Proven by unit test + `--overlays-only` on the live tree. |
| Is disable-model-invocation policy safe (won't break clients that ignore unknown keys)? | **Pass-through is safe.** `Scripts/sync.mjs` only requires `name` + `description`; unknown keys are ignored by the installer. Codex and other clients that do not understand the key leave it unused. Claude Code honors it. We still strip `argument-hint` (UI-only). Overlay re-injection makes the policy real for `wait-what` / `loop-me` even before the next full upstream refresh. |
| Is the re-audit process lightweight enough people will run it? | **Event-driven, not cron.** Six short steps tied to `--apply` / overlay edits; no scheduled noise. If it grows past a skim + promote-survivors habit, trim the checklist rather than automate nagging. |

### Residual near-term class

**Empty** after this Draft lands (mechanism + policy + docs + seed overlays). Remaining durability work is opportunistic promotion of specific skill files into `overlays/` when an apply would otherwise drop them.

## Mid-term: promote durable overlays + ownership docs (Draft)

**Date:** 2026-09-24 (Asia/Taipei)
**Branch:** `draft/skill-overlay-promote-mid`
**Base HEAD:** `b902191` (post #16, verified)
**Goal:** Promote #12–#15 durable edits on upstream-synced skills into `overlays/`, document correction-driven growth and the three-layer ownership split, keep far-term events light.

### Inventory → promote table (concrete)

Upstream-synced skills edited in #12–#15 that were **only in `Skills/`** before this Draft (except `wait-what` / `loop-me` frontmatter seeds from #16):

| Skill | #12–#15 class | Overlay action | Files under `overlays/<skill>/` |
| --- | --- | --- | --- |
| `ask-matt` | P0/P15 local pointers | Full `SKILL.md` | `SKILL.md` |
| `ce-commit` | P15 broken link + gates | Full `SKILL.md` | `SKILL.md` |
| `claude-handoff` | P0 disambiguation | Full `SKILL.md` | `SKILL.md` |
| `code-review` | P2 + smells | `SKILL.md` + sibling | `SKILL.md`, `smells.md` |
| `codebase-design` | P2 | `SKILL.md` + sibling | `SKILL.md`, `reference.md` |
| `diagnosing-bugs` | P2 | `SKILL.md` + sibling | `SKILL.md`, `phases.md` |
| `domain-modeling` | P2/P15 Use when | Full `SKILL.md` | `SKILL.md` |
| `git-guardrails-claude-code` | P2 | `SKILL.md` + sibling | `SKILL.md`, `reference.md` |
| `grill-me` | P0/P15 | Full `SKILL.md` | `SKILL.md` |
| `grill-with-docs` | P0 | Full `SKILL.md` | `SKILL.md` |
| `grilling` | P15 | Full `SKILL.md` | `SKILL.md` |
| `handoff` | P0/P15 | Full `SKILL.md` | `SKILL.md` |
| `implement` | P0 exclusive | Full `SKILL.md` | `SKILL.md` |
| `implement-spec` | P0/P15 | Full `SKILL.md` | `SKILL.md` |
| `improve-codebase-architecture` | P2/P15 | Full `SKILL.md` | `SKILL.md` |
| `loop-me` | P15 + #16 key | `SKILL.md` + `frontmatter.yaml` | `SKILL.md`, `frontmatter.yaml` |
| `migrate-to-shoehorn` | P1 | `SKILL.md` + sibling | `SKILL.md`, `examples.md` |
| `prototype` | P15 | Full `SKILL.md` | `SKILL.md` |
| `research` | P15 | Full `SKILL.md` | `SKILL.md` |
| `resolving-merge-conflicts` | P15 | Full `SKILL.md` | `SKILL.md` |
| `retro` | P0 When not | Reconciled `SKILL.md` + `frontmatter.yaml` | `SKILL.md`, `frontmatter.yaml` |
| `scaffold-exercises` | P1 | `SKILL.md` + sibling | `SKILL.md`, `reference.md` |
| `setup-matt-pocock-skills` | P2 | `SKILL.md` + sibling | `SKILL.md`, `reference.md` |
| `setup-pre-commit` | P2 | `SKILL.md` + sibling | `SKILL.md`, `reference.md` |
| `setup-ts-deep-modules` | P1 | `SKILL.md` + sibling | `SKILL.md`, `reference.md` |
| `tdd` | P2 Use when | Full `SKILL.md` | `SKILL.md` |
| `teach` | P2 | `SKILL.md` + siblings | `SKILL.md`, `lessons.md`, `philosophy.md` |
| `to-questionnaire` | P15 | Full `SKILL.md` | `SKILL.md` |
| `to-spec` | P2/P15 | Full `SKILL.md` | `SKILL.md` |
| `to-tickets` | P1 | `SKILL.md` + sibling | `SKILL.md`, `reference.md` |
| `triage` | P2 | `SKILL.md` + sibling | `SKILL.md`, `reference.md` |
| `wait-what` | P15 + #16 key | `SKILL.md` + `frontmatter.yaml` | `SKILL.md`, `frontmatter.yaml` |
| `wayfinder` | P1 | `SKILL.md` + siblings | `SKILL.md`, `reference.md`, `fog-and-scope.md` |
| `wizard` | P15 | Full `SKILL.md` | `SKILL.md` |
| `writing-beats` | P0/P15 | Full `SKILL.md` | `SKILL.md` |
| `writing-for-agents` | P15 | Full `SKILL.md` | `SKILL.md` |
| `writing-fragments` | P0 | Full `SKILL.md` | `SKILL.md` |
| `writing-shape` | P0/P15 | Full `SKILL.md` | `SKILL.md` |

**Local durable (no overlay):** `ed-brainstorm`, `manage-ai-agent-config`, `security-review`, `verification-before-completion` — edit `Skills/` only.

**Not promoted / unnecessary:**
- No upstream-synced #12–#15 skill already matched upstream `SKILL.md` (preview showed updates on all edited names).
- Deleted `ed-workflow` stays gone (nothing to overlay).
- New upstream-only skill `pr` (seen in preview, not in lock yet) — out of scope; do not invent import without an explicit apply decision.

### Mechanism tweak (mid-flight)

`Scripts/overlays.mjs` apply order is now **full-file copies first, then `frontmatter.yaml` merge**, so keys in `frontmatter.yaml` win over keys inside an overlaid `SKILL.md`. Needed once mid-term started promoting full `SKILL.md` alongside the #16 `disable-model-invocation` seeds.

### Process reflection

| Question | Answer |
| --- | --- |
| Is promoting full `SKILL.md` into overlays sustainable, or only frontmatter + small patches? | **Hybrid, prefer thin.** Frontmatter-only for keys; sibling full-file for new reference files; **full `SKILL.md` only when body/structure must diverge** (progressive-disclosure routers, Use when/gates woven into body). Mass full-body overlays are honest but block upstream body upgrades until a manual reconcile — acceptable for the #12–#15 intentional localization set, not the default for every future tweak. A `LOCAL.md` appendix without auto-wiring is invisible; wiring would be a new merge mode — **not** added this pass. |
| Skills where promotion is unnecessary (upstream already matches)? | **None** among #12–#15 upstream edits at promote time. Closest caution: `retro` had locally thinned upstream “Automated checks” / “Coding standards” wording — **reconciled** to upstream body + local `When not` before promote. Thin writing-* Completion / Use when blocks still promoted because next apply would wipe them and re-audit cost is real. |
| Any process change mid-flight? | **Yes (small):** (1) overlay apply order files→frontmatter; (2) `retro` reconcile-before-promote rule when local removes upstream richness; (3) documented ownership split + correction-driven growth in Maintaining. No mega-router, no `ed-workflow`, no mass re-disclose, no noisy cron. |

### Far-term (light)

Documented optional **skill health check** and **overlay reconcile** as quiet event candidates in Maintaining. Post-upstream re-audit already exists. No scheduled routines created.

### Residual mid-term class

**Empty** for promote + docs. Later reconcile passes may refresh overlaid `SKILL.md` bodies when upstream preview shows valuable churn.

## Far-term: quiet health + prune criteria (Draft)

**Date:** 2026-09-24 (Asia/Taipei)
**Branch:** `draft/skill-far-health-prune`
**Base HEAD:** `102b517` (post #17 mid-term, verified)
**Goal:** Close the far-term roadmap slice with a quiet skill-health script, prune criteria, refined event checklists (no cron), and the deferred empty-MCP packaging note — keep thin.

### What shipped

| Item | Detail |
| --- | --- |
| Quiet skill-health | `Scripts/skill-health.mjs` + `npm run skill-health`; wired into `npm test` via `Scripts/test-skill-health.mjs`. Silent/success on healthy tree; fails on orphan/missing overlay targets, overlay/skill name mismatch, empty Use when, `$ed-workflow` / resurrected `ed-workflow`. |
| Prune criteria | Maintaining table: narrow Not-for → stop promoting → lock removal → delete local-only; never delete upstream-synced skills lightly. |
| Far-term routines | Maintaining: event checklists (re-audit, skill-health, overlay reconcile, prune). Explicitly **not** Grok Bot cron — this is a GitHub skills pack. |
| Empty MCP note | Maintaining: `"servers": {}` is intentional packaging; `0 enabled MCP server(s)` is healthy. |

### CRUD

| Op | Count | Notes |
| --- | ---: | --- |
| **Add skill** | 0 | No mega-router; no `ed-workflow`. |
| **Edit skill** | 1 | `manage-ai-agent-config` verification points at skill-health + empty MCP note. |
| **Delete** | 0 | — |
| **Overlay expand** | 0 | No new overlays without need. |

### Process reflection (mandatory)

| Question | Answer |
| --- | --- |
| Was far-term worth a PR? | **Yes, thinly.** Mid-term left skill-health as “documented only”; without a script + prune criteria the library lacks a quiet gate after overlays grow to 38. A docs-only PR would leave the residual open. |
| Did you cut scope? | **Yes.** No cron, no box automation, no mass progressive disclose, no mega-router, no overlay footprint growth, no Use-when scoring / Not-for lint beyond presence. Health checks only real breakages. MCP note is one paragraph. |
| Routines = npm scripts + docs? | **Yes.** Confirmed: prefer `npm run skill-health` / checklists over external schedulers. This pack is not 沙皇 box automation. |
| Anything invented that should have waited? | No. Empty MCP note was deferred thrice and is one accurate paragraph — cheap enough to close. |

### Residual far-term / roadmap class

**Empty** for the planned far-term slice. Ongoing (not blockers): opportunistic overlay reconcile when upstream preview shows valuable churn; explicit apply decision before importing new upstream skills (e.g. `pr`). Roadmap near → mid → far for this audit arc is **complete** pending Ed merge of this Draft.

