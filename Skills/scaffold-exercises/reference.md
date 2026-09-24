# Exercise scaffolding reference

## Required files and lint rules

Each variant folder (`problem/`, `solution/`, `explainer/`) needs a `readme.md` that:

- Is **not empty**; real content is required, though a single title line works.
- Has no broken links.

When stubbing, create a minimal readme with a title and description:

```md
# Exercise Title

Description here
```

If the subfolder has code, it also needs a `main.ts` longer than one line. A readme-only stub is valid.

The linter (`pnpm ai-hero-cli internal lint`) checks:

- Each exercise has subfolders (`problem/`, `solution/`, `explainer/`).
- At least one of `problem/`, `explainer/`, or `explainer.1/` exists.
- `readme.md` exists and is non-empty in the primary subfolder.
- No `.gitkeep` files.
- No `speaker-notes.md` files.
- No broken links in readmes.
- No `pnpm run exercise` commands in readmes.
- `main.ts` is required per subfolder unless it is readme-only.

## Moving or renaming exercises

When renumbering or moving exercises:

1. Use `git mv`, not `mv`, to preserve history.
2. Update the numeric prefix to maintain order.
3. Re-run lint after moves.

Example:

```bash
git mv exercises/01-retrieval/01.03-embeddings exercises/01-retrieval/01.04-embeddings
```

## Example: stubbing from a plan

Given this plan:

```text
Section 05: Memory Skill Building
- 05.01 Introduction to Memory
- 05.02 Short-term Memory (explainer + problem + solution)
- 05.03 Long-term Memory
```

Create:

```bash
mkdir -p exercises/05-memory-skill-building/05.01-introduction-to-memory/explainer
mkdir -p exercises/05-memory-skill-building/05.02-short-term-memory/{explainer,problem,solution}
mkdir -p exercises/05-memory-skill-building/05.03-long-term-memory/explainer
```

Then create readme stubs:

```text
exercises/05-memory-skill-building/05.01-introduction-to-memory/explainer/readme.md -> "# Introduction to Memory"
exercises/05-memory-skill-building/05.02-short-term-memory/explainer/readme.md -> "# Short-term Memory"
exercises/05-memory-skill-building/05.02-short-term-memory/problem/readme.md -> "# Short-term Memory"
exercises/05-memory-skill-building/05.02-short-term-memory/solution/readme.md -> "# Short-term Memory"
exercises/05-memory-skill-building/05.03-long-term-memory/explainer/readme.md -> "# Long-term Memory"
```
