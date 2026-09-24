---
name: scaffold-exercises
description: Scaffold lint-valid course exercise directories and variants. Use when creating exercise stubs or sections; not for authoring completed lesson content.
---

# Scaffold Exercises

Create exercise directory structures that pass `pnpm ai-hero-cli internal lint`, then commit them with `git commit`.

## Use when / Not for

- **Use when:** a plan needs section directories, exercise stubs, or `problem`/`solution`/`explainer` variants.
- **Not for:** writing completed exercise implementations or lesson content without scaffolding work.

If the plan leaves section boundaries, numbering, names, or variants ambiguous, stop at the human gate and ask the user to resolve those choices before creating files.

## Directory naming and variants

- Sections: `XX-section-name/` under `exercises/`, for example `01-retrieval-skill-building`.
- Exercises: `XX.YY-exercise-name/` under a section, for example `01.03-retrieval-with-bm25`.
- Names use lowercase dash-case; the section number is `XX` and exercise number is `XX.YY`.
- Each exercise has at least one variant: `problem/` for student TODOs, `solution/` for the reference implementation, or `explainer/` for conceptual material without TODOs.
- Default to `explainer/` when the plan does not specify a variant.
- Each variant needs a non-empty, link-valid `readme.md`. A readme-only stub is valid; code-bearing variants also need a `main.ts` longer than one line.

Read [reference.md](reference.md) when lint fails, renumbering or moving exercises, or stubbing from a multi-exercise plan.

## Workflow

1. **Parse the plan.** Extract section names, exercise names, numbering, and variant types.
2. **Create directories.** Make each section, exercise, and variant path.
3. **Create stub readmes.** Add one non-empty `readme.md` per variant folder with a title and description.
4. **Run lint.** Execute `pnpm ai-hero-cli internal lint`.
5. **Fix errors.** Apply the detailed rules in `reference.md` and repeat lint until it passes.

## Verification

`pnpm ai-hero-cli internal lint` passes with the complete scaffold in place.
