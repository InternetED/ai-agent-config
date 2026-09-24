---
name: migrate-to-shoehorn
description: Replace test-only `as` assertions with @total-typescript/shoehorn. Use for partial or intentionally invalid test data; not for production code.
---

# Migrate to Shoehorn

## Use when / Not for

- **Use when:** tests use `as` or `as unknown as` to construct partial data or deliberately invalid data.
- **Not for:** production code. Never introduce shoehorn outside tests.

## Why shoehorn

`shoehorn` passes partial data in tests while keeping TypeScript useful. It removes manually specified target assertions and double assertions while preserving checking or autocomplete appropriate to the scenario.

## Install

```bash
npm i @total-typescript/shoehorn
```

Use the repository's package manager when it is not npm.

## When to use each

| Function | Use case |
| --- | --- |
| `fromPartial()` | Pass partial data that still type-checks |
| `fromAny()` | Pass intentionally wrong data while keeping autocomplete |
| `fromExact()` | Force a full object that can later swap to `fromPartial()` |

Read [examples.md](examples.md) when applying a specific `as` → shoehorn replacement.

## Workflow

1. Identify test files whose `as` assertions construct large partial objects or intentionally invalid data.
2. Install `@total-typescript/shoehorn` as a development dependency if it is absent.
3. Find assertions in `*.test.ts` and `*.spec.ts` files, including both `as Type` and `as unknown as Type`.
4. Replace partial but type-correct data with `fromPartial()`.
5. Replace intentionally wrong data used for error testing with `fromAny()`.
6. Add the needed imports from `@total-typescript/shoehorn` and remove obsolete assertions.
7. Run the repository's typecheck and fix every resulting error.

## Verification

The repository's typecheck passes after every targeted test assertion has been migrated.
