# Pre-commit configuration reference

Read this file when writing hook or configuration files, or adapting commands to the repository's package manager.

## `.husky/pre-commit`

For npm, write:

```text
npx lint-staged
npm run typecheck
npm run test
```

Husky v9 and newer do not need a shebang. Replace `npx` and `npm run` with the detected package manager's equivalents. If `package.json` lacks `typecheck` or `test`, omit only the missing script's line and tell the user.

Run lint-staged first because it is fast and limited to staged files; then run the full typecheck and tests.

## `.lintstagedrc`

```json
{
  "*": "prettier --ignore-unknown --write"
}
```

`--ignore-unknown` skips files such as images that Prettier cannot parse.

## `.prettierrc`

Create a Prettier configuration only when none exists. Defaults:

```json
{
  "useTabs": false,
  "tabWidth": 2,
  "printWidth": 80,
  "singleQuote": false,
  "trailingComma": "es5",
  "semi": true,
  "arrowParens": "always"
}
```

Respect any existing Prettier configuration rather than replacing it.

## Package-manager adaptation

Detect `package-lock.json` for npm, `pnpm-lock.yaml` for pnpm, `yarn.lock` for Yarn, or `bun.lockb` for Bun. Use that manager consistently for dependency installation, Husky initialization where applicable, hook commands, and verification. Default to npm only when the repository is genuinely ambiguous.