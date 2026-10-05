# Maintaining AI Agent Config

## Authority boundaries

Edit only these authoritative inputs:

- Add and update shared skills under `Skills/<skill-name>/`.
- Add and update MCP servers in `Config/mcp.servers.json`.
- Change translation behavior in `Scripts/sync.mjs` only when a client format
  changes.
- Treat `upstreams.lock.json` as the source/path/revision and update-policy registry for every Skill, including local Skills.
- Put durable local edits to upstream-synced skills under `overlays/<skill>/`
  (see Local overlays below). Do not rely on hand-edits inside `Skills/` alone
  if the next `npm run upstreams -- --apply` should keep them.

Do not hand-edit generated output or installed files. Run the installer again
with an explicit `--scope user` or `--scope project` instead. Never choose a
scope on a user's behalf.

### Ownership split (three layers)

| Layer | What lives here | Survives `upstreams --apply`? |
| --- | --- | --- |
| **Upstream** | Imported Skills recorded in `sources` of `upstreams.lock.json`; `automatic` selects the two supported upstream adapters, `manual` marks standalone imports. | Automatic sources are refreshed and overlays re-apply; manual sources are unchanged. |
| **Local durable** | Original/rewritten Skills recorded in `localSkills`, including `rtk`. | Yes — edit `Skills/` directly; no overlay needed. |
| **Overlay** | Durable local deltas on upstream-synced skills under `overlays/<skill>/`. | Yes — re-applied after every `--apply` and via `npm run overlays`. |

Do **not** invent a mega-router skill. Do **not** recreate `ed-workflow`. Prefer improving an existing skill over adding a new one.

## Add a skill

Create `Skills/<skill-name>/SKILL.md`. Use lowercase letters, digits, and
hyphens for the directory and `name`. Include concise `name` and `description`
frontmatter. Keep the shared workflow portable; place Codex-only UI metadata in
`agents/openai.yaml` only when it adds value.

Register its provenance in `upstreams.lock.json` and attribution/license in
`THIRD_PARTY_NOTICES.md` when imported. Run `node Scripts/sync.mjs check` and
`npm run skill-health`; run the affected integration tests.

## Skill provenance registry

Every direct child of `Skills/` must have exactly one owner in
`upstreams.lock.json`: an entry in `sources.<id>.skills` or `localSkills.<name>`.
`npm run skill-health` rejects missing/duplicate/orphan records, missing pins,
and missing or unsafe upstream paths. Upstream apply validates this in staging.

For imported Skills, record `repository`, full 40-character `commit`, `skills`,
per-Skill directory `skillPaths`, license/location, and `updatePolicy`:

- `automatic`: currently only Matt Pocock and compound-engineering imports.
  `npm run upstreams -- --apply` refreshes their commit, selection, and exact
  upstream paths from the fetched tree. Overlays re-apply afterward.
- `manual`: Vercel, Anthropic, and HumanLayer standalone imports. They are
  recorded but not fetched by `npm run upstreams`. Compare the pinned directory
  against the desired upstream revision; review local adaptations and license
  changes, update the selected files/pin/path together, and re-apply overlays.
  Keep full-file local overlays and other intentional rewrites during review;
  do not blindly overwrite them with upstream content.

For original/local rewrites, record this repository, `Skills/<name>`, and
`updatePolicy: local`. `ed-brainstorm` retains `derivedFrom` information, with
the exact original derivation revision explicitly unknown (`commit: null`).
`rtk` is local integration guidance; its external tool URL is a reference, not
an imported Skill source. Local history is tracked by this repository, not a
self-referential commit pin inside its own lock file.

`THIRD_PARTY_NOTICES.md` points to lock pins instead of duplicating them.
`skills-lock.json` belongs to the external Skills CLI installations, not the
authoritative `Skills/` library. Do not use it as provenance for package updates.

## Update imported Skills

Run `npm run upstreams` to clone the current upstream defaults into a temporary
directory and preview added, changed, and removed Skills. Nothing in the
repository changes during preview.

Run `npm run upstreams -- --apply` to apply the preview, refresh third-party
license copies and commit pins, **re-apply local overlays**, and validate the
result. To also synchronize both clients, explicitly choose a scope:

```sh
npm run upstreams -- --apply --install --scope user
npm run upstreams -- --apply --install --scope project --project /path/to/project
```

`--home PATH` overrides the user profile for isolated testing. Missing or invalid
install scope is rejected before fetching or updating. You may test a specific
branch or tag with `--matt-ref <ref>` or `--compound-ref <ref>`.

Both apply and overlays-only build a staged Skills tree and validate its overlays
and Skill metadata before replacing repository inputs. Combined apply/install
also dry-runs the chosen client destinations before promotion. Validation errors
leave live Skills, licenses, lock pins, and client files unchanged. Promotion
rolls back synchronous rename failures; this is not a crash-safe transaction
across repository and client files.

The updater owns only the Skill selections for its two automatic source adapters.
It rejects upstream collisions with every local Skill and other registered source
selection. Review the resulting Git diff before release.

### Frontmatter portability policy

During upstream import, `Scripts/sync-upstreams.mjs` applies this policy:

| Key | Policy |
| --- | --- |
| `disable-model-invocation` | **Pass through** when present upstream. Clients that ignore unknown frontmatter keys remain safe; Claude Code honors the key. Local overlays may re-assert it after apply. |
| `argument-hint` | **Strip** on import (Claude Code UI metadata; not portable). |

Do not put `disable-model-invocation` only in `Skills/<skill>/SKILL.md` for an
upstream-synced skill and expect it to survive a future strip experiment —
record it under `overlays/<skill>/frontmatter.yaml` as well when the key is a
local durability requirement. Live examples: `wait-what`, `loop-me`.

## Local overlays

Authority edits to upstream-synced skills belong in `overlays/`, not only in
`Skills/`. After every `--apply`, the updater runs the overlay layer. You can
also re-apply without fetching upstream:

```sh
npm run upstreams -- --overlays-only
# or
npm run overlays
```

### Layout

```
overlays/
  <skill-name>/
    frontmatter.yaml    # optional: shallow-merge keys into SKILL.md frontmatter
    <relative-path>     # optional: full-file replace into Skills/<skill-name>/
```

Rules:

- Overlay directory names must match an existing `Skills/<skill-name>/`.
- `frontmatter.yaml` is never copied into the skill tree; it only merges keys.
- Any other file is copied over the matching path under `Skills/<skill-name>/`.
- Apply **fails loudly** if the skill or target `SKILL.md` is missing, a path would
  escape the skill directory, `frontmatter.yaml` has an unsupported line, or the
  effective replacement document lacks valid name/description metadata.
- All overlay plans are validated before files are copied. `--dry-run` merges
  against the planned replacement `SKILL.md`, not the old target, without writes.
- Skill health requires full-file `SKILL.md` overlays to have frontmatter and an
  effective name matching the directory; `frontmatter.yaml` may supply that name.
- Prefer overlays for automatically synced Skills. Move a Skill into `localSkills`
  only when it is intentionally rewritten and must no longer receive upstream replacements.

### When to overlay vs fork

| Situation | Mechanism |
| --- | --- |
| Keep receiving upstream file updates, but re-assert a few keys or files | `overlays/<skill>/…` |
| Skill is rewritten for this package and must never be overwritten | Record it in `localSkills`, not an imported source selection (`ed-brainstorm`). |
| One-off experiment you do not care about after the next apply | Edit `Skills/` only (will be wiped on apply) |

### What to put in an overlay (prefer thin)

| Local change | Overlay shape |
| --- | --- |
| Frontmatter keys only (`disable-model-invocation`, …) | `frontmatter.yaml` merge |
| New sibling reference file (progressive disclosure) | Full-file replace of that sibling only, **plus** `SKILL.md` if the router must point at it |
| Body / structure must diverge from upstream (thin router, Use when blocks, gates) | Full-file replace of `SKILL.md` (honest divergence) |
| Key-only durability on top of an overlaid `SKILL.md` | Keep both: copy `SKILL.md`, then `frontmatter.yaml` (apply order: files first, merge second) |

Do **not** duplicate an entire upstream skill body into `overlays/` when a frontmatter merge or a small sibling file would preserve the intent. Full `SKILL.md` overlays are reserved for intentional localization; they stop receiving upstream body edits until you manually reconcile.

### Correction-driven growth

Grow the skill set from **real failure modes**, not from speculative completeness:

1. **Principle, not story.** Encode the reusable rule (when / when not, verification, human gate). Leave the incident narrative out of `SKILL.md`.
2. **Prefer improve over invent.** Patch an existing skill or overlay before adding a new skill directory.
3. **Choose the layer:**
   - Failure is about a **local-only** concern → edit `Skills/<local-skill>/` (`ed-brainstorm`, `manage-ai-agent-config`, `security-review`, `verification-before-completion`).
   - Failure is about an **upstream-synced** skill that must keep the fix → edit `Skills/` **and** promote the durable files into `overlays/<skill>/` in the same change.
   - Failure is one-off / exploratory → edit `Skills/` only; accept wipe on next apply.
4. **Validate:** `node Scripts/sync.mjs check`, `npm test` (includes quiet skill-health), and `npm run overlays` (idempotent).
5. **Draft PR; do not merge** authority changes unless Ed asks.

Record non-trivial promotions and layer choices in `Documentation~/Skill-Audit-*.md` when an audit pass lands.

## Post-upstream re-audit (event-driven)

Run this checklist **when** an upstream apply lands (or when you intentionally
change overlays) — not on a noisy cron.

1. **Apply path:** `npm run upstreams -- --apply` (overlays run automatically).
2. **If you only need to refresh overlays:** `npm run upstreams -- --overlays-only`.
3. **Validate:** `node Scripts/sync.mjs check`, `npm run skill-health`, and `npm test`.
4. **Short authority checklist** (skim the Git diff + touched skills):
   - Use when / Not for still present where we rely on them
   - Verification / human-gate lines not wiped for high-traffic skills
   - `disable-model-invocation` still present on `wait-what` and `loop-me`
   - Progressive-disclosure sibling files still linked from `SKILL.md` if those
     skills were intentionally localized (promote missing durable edits into
     `overlays/` rather than re-hand-editing `Skills/` alone)
   - No route back to deleted `ed-workflow`; no new mega-router
5. **Promote survivors:** any intentional diff that `--apply` would otherwise
   drop forever → move into `overlays/<skill>/` in the same change set.
6. **Stop when quiet:** if the diff is empty of authority regressions, do not
   invent follow-up work.

## Far-term maintainer routines (event checklists, not cron)

This repository is a **GitHub skills pack**, not a box-automation host. Prefer
`npm` scripts + short checklists over external schedulers (no Grok Bot cron).
Stay quiet when there is nothing to fix.

| Routine | When to run | Commands / steps |
| --- | --- | --- |
| **Post-upstream re-audit** | After `upstreams --apply` or intentional overlay edits | Checklist above. |
| **Quiet skill-health** | After upstreams apply, after overlay edits, and alongside `npm test` on skill/authority Drafts | `npm run skill-health` (also wired into `npm test`). Silent exit 0 when healthy; prints real problems only (orphan/missing overlay targets, name mismatches, empty Use when, `$ed-workflow` / resurrected `ed-workflow`). |
| **Overlay reconcile** | When `npm run upstreams` preview shows valuable body churn on an overlaid `SKILL.md` | Manually merge upstream improvements into `overlays/<skill>/SKILL.md`; re-run `npm run overlays`, `npm run check`, `npm test`. Do not auto-cron. |
| **Prune / narrow** | When a skill is noisy, redundant, or repeatedly misfires | See **Prune criteria** below. Prefer thinner Not-for / stop promoting over deleting upstream-synced skills. |

### Quiet skill-health

```sh
npm run skill-health          # quiet when ok
npm run skill-health -- --verbose
# included in:
npm test
```

Run after `npm run upstreams -- --apply` (or `--overlays-only`) and before opening
or updating a skill-authority Draft. Do not schedule it as a noisy chat job.

### Prune criteria

Goal: keep the library **stable or thinner**, not endlessly larger.

| Action | When | Evidence needed | Notes |
| --- | --- | --- | --- |
| **Narrow Not-for / Use when** | Skill is useful but misfires or overlaps peers | Repeated wrong trigger, or audit note naming the overlap | Prefer overlay (upstream-synced) or direct `Skills/` edit (local durable). |
| **Stop promoting** | Local overlay divergence was experimental or upstream caught up | Overlay no longer differs meaningfully, or maintainers agree local delta is obsolete | Delete `overlays/<skill>/…` (or thin it); do **not** delete the upstream skill. |
| **Remove from upstream lock** | We no longer want that upstream skill in this pack | Explicit Ed / maintainer decision + lock preview | Next `--apply` drops it from `Skills/`; remove any overlay in the same change. |
| **Delete local-only skill** | Local skill is unused, superseded, or harmful | Ed decision (as with `ed-workflow`) + no live routes | Never delete an upstream-synced skill lightly just to “clean up” — the next apply can resurrect it from the lock. |

Never mass-delete. Prefer improve → overlay Not-for → stop promoting → lock removal → delete local-only.

## Empty MCP catalog (packaging note)

`Config/mcp.servers.json` may ship with `"servers": {}`. That is intentional: this
package is primarily a **skills** distribution. `npm run check` reporting
`0 enabled MCP server(s)` is healthy, not a defect. Add servers when a consumer
needs them; keep credential **names** in the manifest and credential **values**
out of Git. Do not invent placeholder MCP entries to make the catalog look full.

## Add an MCP server

Add one entry to `Config/mcp.servers.json`. Use `stdio` for a local process and
`http` for a streamable HTTP endpoint. Put credential names in `envVars`,
`bearerTokenEnv`, or `headersFromEnv`; keep credential values out of Git.

`enabled`, when present, must be a JSON boolean; use `false`, not `"false"`.
Installation rejects names already present outside the managed Codex block or
absent from Claude managed-name state. `--force` only replaces unmanaged Skill
directories, not MCP servers. Rename or explicitly remove a conflicting MCP
entry before retrying. A Codex inline `mcp_servers = { ... }` namespace cannot be
extended by generated tables; convert it to `[mcp_servers.NAME]` tables first.
Configuration parsing and destination checks precede all install writes; they do
not guarantee rollback on later filesystem errors or process interruption.

For example:

```json
{
  "servers": {
    "context7": {
      "transport": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    },
    "internal-docs": {
      "transport": "http",
      "url": "https://docs.example.com/mcp",
      "bearerTokenEnv": "INTERNAL_DOCS_TOKEN"
    }
  }
}
```

Run `node Scripts/sync.mjs generate` and inspect both generated formats before
installation. If a local installation is requested, use
`node Scripts/sync.mjs install --scope user` or
`node Scripts/sync.mjs install --scope project`. Completion means `check`,
`test`, and `npm pack --dry-run` pass.

The upstream regression tests require Git on PATH and use isolated local Git
repositories and URL rewrites; they do not fetch from the network.

## Release

Update `package.json`, add a dated version section to `CHANGELOG.md`, and update
the pinned npx example in `README.md`. Merge these changes into `main`; do not
manually create a tag or GitHub Release.

`.github/workflows/validate.yml` runs the existing checks, tests, and packaging
validation. Only a successful `push` to `main` can run the release job. It uses
the built-in `GITHUB_TOKEN` with job-scoped `contents: write`; no npm token or
registry publishing is involved.

For a new stable version, `.github/scripts/release.cjs` creates `v<VERSION>` at
the validated commit and publishes a GitHub Release using that version
section's changelog notes. An already published stable release is skipped, so
ordinary merges without a version bump do not republish. Draft/prerelease
collisions fail for manual resolution.

If publication fails, re-run the failed workflow at the same commit. An
existing lightweight or annotated tag can complete publication only if it
resolves to that commit; a tag pointing elsewhere is never moved. Corrections
to a published release require a new version.

The public Git tag can be executed directly with `npx`; the optional OpenUPM
listing reads the same tags and requires the tag version to match
`package.json`.
