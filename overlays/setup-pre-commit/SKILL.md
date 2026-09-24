---
name: setup-pre-commit
description: Configure Husky pre-commit checks with lint-staged, Prettier, type checking, and tests in a JavaScript repository.
---

# Setup Pre-Commit Hooks

Set up Husky so commits format staged files first, then run the repository's available typecheck and test scripts.

## Use when / Not for

- **Use when:** a JavaScript or TypeScript repository needs Husky-based commit-time formatting, type checking, and tests.
- **Not for:** non-JavaScript repositories, or adding one ad-hoc git hook without Husky.

This setup adds Husky, lint-staged, Prettier configuration when missing, and available `typecheck` and `test` scripts to the pre-commit path.

Read [reference.md](reference.md) only when writing hook or configuration files, or adapting commands to the repository's package manager.

## Steps

1. **Detect the package manager.** Check npm, pnpm, Yarn, and Bun lockfiles; use the matching manager consistently and default to npm only if unclear.
2. **Install dependencies.** Add `husky`, `lint-staged`, and `prettier` as development dependencies.
3. **Initialize Husky.** Run the manager-appropriate equivalent of `npx husky init`; confirm it creates `.husky/` and sets `prepare` to `husky`.
4. **Write `.husky/pre-commit`.** Run lint-staged, then each existing `typecheck` and `test` script. Omit absent scripts and tell the user; Husky v9 needs no shebang.
5. **Write `.lintstagedrc`.** Format every staged file with `prettier --ignore-unknown --write`.
6. **Configure Prettier.** Preserve existing configuration; create `.prettierrc` with the reference defaults only when none exists.
7. **Verify.** Check hook executability, both configurations, the `prepare` script, and run the manager-appropriate lint-staged command.
8. **Commit.** Stage the setup and commit as `Add pre-commit hooks (husky + lint-staged + prettier)` so the new hook receives an end-to-end smoke test.

## Verification

Before finishing:

- [ ] `.husky/pre-commit` exists and is executable.
- [ ] `.lintstagedrc` exists and runs Prettier with `--ignore-unknown`.
- [ ] `package.json` has `"prepare": "husky"`.
- [ ] A Prettier configuration exists and any prior configuration was preserved.
- [ ] The package-manager-specific lint-staged command succeeds.
- [ ] The setup commit passes the new pre-commit hook, including each available typecheck and test script.
