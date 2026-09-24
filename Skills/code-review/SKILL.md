---
name: code-review
description: Review a branch, pull request, or work-in-progress diff against repository standards and its originating specification.
---

# Code Review

Review the diff from a user-supplied fixed point to `HEAD` along two independent axes:

- **Standards:** conformity with documented repository guidance plus a Fowler smell baseline.
- **Spec:** fidelity to the originating issue or specification.

Run the axes as parallel sub-agents so their contexts and rankings remain independent. For a tiny diff—one or two files or only a handful of hunks—review both axes in this session instead.

## Use when / Not for

- **Use when:** reviewing a branch, PR, WIP diff, or changes since a commit, branch, or tag.
- **Not for:** unsettled pre-implementation design—use `grill-with-docs` or `ed-brainstorm`; a security-only pass—use `security-review`; only a commit message—use `ce-commit`.

If `docs/agents/issue-tracker.md` is missing, tell the user to run `/setup-matt-pocock-skills`.

Read [smells.md](smells.md) only when preparing the Standards sub-agent prompt. **Paste its smell baseline in full into that prompt; do not replace this required step with a reference link.**

## Process

1. **Pin the fixed point.** Use exactly what the user supplied; ask if absent. Resolve it with `git rev-parse`, capture `git diff <fixed-point>...HEAD` and `git log <fixed-point>..HEAD --oneline`, and stop on an invalid ref or empty diff.
2. **Find the spec.** Check commit-message issue references through `docs/agents/issue-tracker.md`, a user-supplied path, then matching files under `docs/`, `specs/`, or `.scratch/`. If none exists, ask; if the user confirms there is none, skip the Spec agent and report that.
3. **Find standards.** Collect repository standards such as `CODING_STANDARDS.md` and `CONTRIBUTING.md`. Repository rules override smell heuristics; skip anything tooling enforces.
4. **Review both axes.** Unless the tiny-diff exception applies, spawn both sub-agents in parallel:
   - The **Standards prompt** includes the full diff command, commit list, standards-source paths, and the complete baseline copied from [smells.md](smells.md). Ask for file/hunk findings, cited rules, named smells with quoted hunks, and a distinction between hard repository-rule violations and heuristic smells, under 400 words.
   - The **Spec prompt** includes the full diff command, commit list, and spec path or contents. Ask for missing or partial requirements, unrequested behavior, and incorrectly implemented requirements, quoting the spec for each, under 400 words.
5. **Aggregate without reranking.** Present the reports under `## Standards` and `## Spec`, verbatim or lightly cleaned. End with finding counts and the worst issue within each axis; never choose one winner across axes.

## Why two axes

Correct style can implement the wrong thing; correct scope can violate repository conventions. Separate reports prevent one dimension from masking the other.

## Verification

Before finishing:

- The fixed point resolved and the reviewed three-dot diff was non-empty.
- Both axes are reported, or Spec explicitly says no specification was available.
- Parallel sub-agents were used unless the tiny-diff exception was documented.
- The Standards prompt received repository guidance and the complete smell baseline from `smells.md`.
- Findings remain separated by axis with counts and a worst finding per axis.
