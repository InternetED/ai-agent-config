# Matt Pocock upstream review

## Imported

All 37 directories in the pinned repository that contain `SKILL.md` are imported:

- `skills/engineering`: 18 skills
- `skills/productivity`: 7 skills
- `skills/in-progress`: 8 skills
- `skills/misc`: 4 skills

The updater discovers this set from `SKILL.md` files instead of maintaining a hand-written allowlist, so newly added Agent-readable skills will be detected automatically.

## Not imported

These items do not contain a `SKILL.md` and are not independently discoverable as Agent skills:

| Path | Reason |
| --- | --- |
| `skills/deprecated/README.md` | Documentation only; the directory contains no skill. |
| `.out-of-scope/` | Maintainer policy notes, not Agent skills. |
| `docs/` | Repository documentation, not individual skills. |
| `scripts/` | Repository maintenance/build scripts, not skill resources referenced by a selected `SKILL.md`. |
| `.agents/`, `.claude-plugin/`, `.changeset/`, `.github/` | Packaging, release, and repository metadata. |
| Root `AGENTS.md`, `CLAUDE.md`, `CONTEXT.md`, `README.md`, `CHANGELOG.md` | Instructions and documentation for maintaining the upstream repository, not reusable skill entry points. |
| `package.json`, `package-lock.json`, `.gitignore` | Tooling metadata. |

Supporting files inside an imported skill directory—such as its `agents/`, `scripts/`, and references—are copied with that skill.
