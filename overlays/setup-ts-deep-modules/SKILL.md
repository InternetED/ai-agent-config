---
name: setup-ts-deep-modules
description: Enforce deep TypeScript package boundaries with dependency-cruiser. Use when package entry points must hide subfolder internals; not for non-TypeScript repos or layering design alone.
---

# Setup TS Deep Modules

## Use when / Not for

- **Use when:** a TypeScript repo needs dependency-cruiser rules that make package root files public entry points and hide all subfolder implementation.
- **Not for:** non-TypeScript repositories, package-layering design by itself, or merely documenting boundaries without enforcing them.

A **deep module** places substantial behaviour behind a small interface. Here, every root file in a package is a public entry point and every subfolder is private. For the vocabulary—deep module, interface, seam, and depth—call the Skill tool with "codebase-design" and use its language throughout.

The enforced shape is:

- One flat package tier under `src/packages/` or `packages/`.
- Root files such as `index.ts` and `client.ts` are public entry points; several are allowed.
- `lib/` conventionally holds private implementation and `tests/` holds co-located tests and fixtures.
- Any subfolder is private, regardless of its name; entry points stay small and do not barrel-export a subtree.

Read [reference.md](reference.md) when writing or merging dependency-cruiser config or explaining the package shape.

## Steps

### 1. Detect the environment

- **Package manager:** `pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, `bun.lockb` → bun, otherwise npm. Use it for every command below.
- **Packages root:** if `src/` exists, use `src/packages`; otherwise use `packages`. Confirm with the user if the repo has a different obvious convention.
- **Existing config:** check for `.dependency-cruiser.*`. If one exists, do not overwrite it; merge the four rules and options and report what was added.

**Done when:** package manager, packages root, and existing-config status are all known.

### 2. Install dependency-cruiser

Install `dependency-cruiser` as a dev dependency with the detected package manager.

**Done when:** `dependency-cruiser` is in `devDependencies`.

### 3. Write the config

Copy [`dependency-cruiser.config.cjs`](dependency-cruiser.config.cjs) to the repo root as `.dependency-cruiser.cjs`. Set `PACKAGES_ROOT` to the root detected in step 1. The rules are path-depth based and extension-agnostic, so nothing else needs adapting. When merging an existing config, use `reference.md` for the complete four-rule semantics and config notes.

**Done when:** `.dependency-cruiser.cjs` exists with the correct `PACKAGES_ROOT`, and the four forbidden rules are present.

### 4. Wire it into the checks

- Add `lint:boundaries`: `depcruise <packages-root>` or `depcruise src`.
- Fold it into the umbrella command that already runs typecheck, such as `check`, `ci`, or `validate`. Do not touch `tsconfig` or add path aliases.
- If there is no umbrella script, add `lint:boundaries` and tell the user to include it in CI.

**Done when:** `lint:boundaries` exists and runs as part of the same command as typecheck.

### 5. Scaffold the example package

Create a committed `<packages-root>/example/` copy-me template:

- `index.ts` is an entry point and exports one function that delegates to an internal file, making the package visibly deep rather than a pass-through.
- `lib/impl.ts` is internal, imported by `index.ts`, and unreachable from outside.
- `tests/example.test.ts` imports only `../index` and asserts against the public function.

Tell the user this is a starter template to copy or delete.

**Done when:** the example package exists, exposes behaviour through a root entry point, and hides `impl` in a subfolder.

### 6. Prove the rules bite

This is the completion criterion for the whole skill; a config that does not fail on a violation is worthless.

1. Run `lint:boundaries`; it must pass on the clean example.
2. Temporarily add a deep import to `tests/example.test.ts`, such as `import { thing } from "../lib/impl"`. Run `lint:boundaries` again; it must fail with `tests-through-entrypoints`.
3. Revert the deep import and run once more; it must pass.

**Done when:** you observed pass, fail on the deep import, then pass again. If step 2 does not fail, fix the rules before finishing.

### 7. Document the convention

Write `<packages-root>/README.md` beside the packages. Cover the package layout, root-file entry points, `lib/`, `tests/`, "import only through a package's entry points", and how to run `lint:boundaries`. Explicitly discourage barrel files in favour of several small entry points. Keep it to the copy-me snippet plus one paragraph for each of the four rules.

Add a one-line context pointer from the repo's agent-instructions file: `CLAUDE.md` if present, otherwise `AGENTS.md`, creating `AGENTS.md` only if neither exists. Example: `Packages are deep modules: see [src/packages/README.md](./src/packages/README.md) before adding or importing one.`

**Done when:** `<packages-root>/README.md` exists and discourages barrels, and the repo's `CLAUDE.md` or `AGENTS.md` links to it.

## Verification

Step 6 is mandatory: the boundary check must pass cleanly, reject a temporary deep import with the expected rule, and pass again after the violation is removed.
