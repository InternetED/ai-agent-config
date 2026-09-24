# Maintaining AI Agent Config

## Authority boundaries

Edit only these authoritative inputs:

- Add and update shared skills under `Skills/<skill-name>/`.
- Add and update MCP servers in `Config/mcp.servers.json`.
- Change translation behavior in `Scripts/sync.mjs` only when a client format
  changes.
- Treat `upstreams.lock.json` as the record of imported Skill provenance.
- Put durable local edits to upstream-synced skills under `overlays/<skill>/`
  (see Local overlays below). Do not rely on hand-edits inside `Skills/` alone
  if the next `npm run upstreams -- --apply` should keep them.

Do not hand-edit generated output or installed files. Run the installer again
with an explicit `--scope user` or `--scope project` instead. Never choose a
scope on a user's behalf.

## Add a skill

Create `Skills/<skill-name>/SKILL.md`. Use lowercase letters, digits, and
hyphens for the directory and `name`. Include concise `name` and `description`
frontmatter. Keep the shared workflow portable; place Codex-only UI metadata in
`agents/openai.yaml` only when it adds value.

Run `node Scripts/sync.mjs check`. Completion means every direct child of
`Skills/` has a valid `SKILL.md`, every skill name matches its directory, and
the integration tests pass.

## Update imported Skills

Run `npm run upstreams` to clone the current upstream defaults into a temporary
directory and preview added, changed, and removed Skills. Nothing in the
repository changes during preview.

Run `npm run upstreams -- --apply` to apply the preview, refresh third-party
license copies and commit pins, **re-apply local overlays**, and validate the
result. Add `--install` to also synchronize the result to both clients. You may
test a specific branch or tag with `--matt-ref <ref>` or `--compound-ref <ref>`.

The updater owns the Skill names recorded under each source in
`upstreams.lock.json`. It must never overwrite the local `ed-brainstorm`
Skill. Review the resulting Git diff before release.

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
- Apply **fails loudly** if the skill is missing, `SKILL.md` is missing when a
  frontmatter overlay exists, a path would escape the skill directory, or
  `frontmatter.yaml` has an unsupported line.
- Prefer overlays over forking an upstream skill into `protectedLocalNames`
  unless the skill is intentionally local-only (today: `ed-brainstorm`).

### When to overlay vs fork

| Situation | Mechanism |
| --- | --- |
| Keep receiving upstream file updates, but re-assert a few keys or files | `overlays/<skill>/…` |
| Skill is rewritten for this package and must never be overwritten | Keep out of the upstream lock set / use `protectedLocalNames` (`ed-brainstorm`) |
| One-off experiment you do not care about after the next apply | Edit `Skills/` only (will be wiped on apply) |

## Post-upstream re-audit (event-driven)

Run this checklist **when** an upstream apply lands (or when you intentionally
change overlays) — not on a noisy cron.

1. **Apply path:** `npm run upstreams -- --apply` (overlays run automatically).
2. **If you only need to refresh overlays:** `npm run upstreams -- --overlays-only`.
3. **Validate:** `node Scripts/sync.mjs check` and `npm test`.
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

## Add an MCP server

Add one entry to `Config/mcp.servers.json`. Use `stdio` for a local process and
`http` for a streamable HTTP endpoint. Put credential names in `envVars`,
`bearerTokenEnv`, or `headersFromEnv`; keep credential values out of Git.

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

## Release

Update `package.json` and `CHANGELOG.md`, commit the change, and tag the same
semantic version. The public Git tag can be executed directly with `npx`; the
optional OpenUPM listing reads the same tags and requires the tag version to
match `package.json`.
