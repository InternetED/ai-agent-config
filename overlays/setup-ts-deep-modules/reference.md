# TypeScript deep-modules reference

## Full directory shape

```text
src/packages/
  <name>/
    index.ts        ← an entry point (public). Import this from outside.
    client.ts       ← another entry point. Packages may expose SEVERAL.
    lib/            ← implementation: hidden from outside, free to import each other.
    tests/          ← co-located tests + fixtures (a subfolder, so private).
```

The public surface is the package's **root files**, not one designated `index.ts`. By convention implementation lives in `lib/` and tests in `tests/`, giving every package the same two-folder shape. The rule itself is general: *anything* in *any* subfolder is private, so you never extend the config to add a folder.

**Entry points, not a barrel.** Because the public surface is *every* root file, a package can expose several small entry points (`index.ts`, `client.ts`, `server.ts`) instead of funnelling everything through one giant `index.ts`. Barrel files that re-export a whole subtree are discouraged; keep entry points small and hide implementation in subfolders.

Layering—which packages may depend on which—is a different concern and is left as a commented stub in the config for the repo to fill in.

## The four rules

All four are `error` rules:

1. **Entry-point boundary:** code outside a package—app code or another package—may import only that package's entry points (its root files), never anything in its subfolders.
2. **Intra-package freedom:** a package's own files import each other freely.
3. **Tests through the entry points:** files under `<pkg>/tests/` may import any package's entry points and their own `tests/` fixtures, but never any package's subfolder internals, not even their own. Integration tests across packages are fine; deep imports are not.
4. **No cycles:** no dependency cycles.

## Notes

- The config's `$1` back-references—dependency-cruiser's group matching—let a package reach its own internals while outsiders cannot. Don't flatten them into separate per-package rules.
- Public versus private is decided by **depth**: a package's root files are entry points; anything in a subfolder is private. The conventional subfolders are `lib/` (implementation) and `tests/`, but the rule doesn't hardcode them: any subfolder is private, so a new folder never needs a config change. Adding an entry point means adding a root file, not a barrel.
- Packages are **flat**: one tier of immediate children under the root. A package's internals may nest as deep as needed; a package may not contain another package.
- Use `.cjs`, not `.js`, so the config's `module.exports` works even in `"type": "module"` repos.
