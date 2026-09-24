---
name: resolving-merge-conflicts
description: Resolve an in-progress git merge or rebase conflict by intent. Use when mid-conflict; Not for starting merges, aborting, or rewriting unrelated history.
---

## Use when / Not for

- **Use when:** a merge or rebase is already in progress and conflicting files need resolution.
- **Not for:** starting a merge/rebase, running `git merge --abort` / `git rebase --abort`, force-pushing, or inventing new behaviour unrelated to either side's intent.

1. **See the current state** of the merge/rebase. Check git history, and the conflicting files.

2. **Find the primary sources** for each conflict. Understand deeply why each change was made, and what the original intent was. Read the commit messages, check the PRs, check original issues/tickets.

3. **Resolve each hunk.** Preserve both intents where possible. Where incompatible, pick the one matching the merge's stated goal and note the trade-off. Do **not** invent new behaviour. Always resolve; never `--abort`.

   **Human gate:** if intents are incompatible and the merge goal is unclear, pause and ask which intent wins before finishing the operation.

4. Discover the project's **automated checks** and run only those relevant to the conflicted files (e.g. typecheck/tests/format scoped to touched paths) — not the full suite by default. Fix anything the merge broke.

5. **Finish the merge/rebase.** Stage everything and commit. If rebasing, continue the rebase process until all commits are rebased.

## Verification

Done when the merge/rebase completes (no `git status` conflict markers), relevant scoped checks for touched paths pass, and the trade-offs for incompatible hunks were named.
