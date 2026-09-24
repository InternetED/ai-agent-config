---
name: implement-spec
description: Implement a multi-ticket task-graph into one draft PR with parallel worktrees. Use when an accepted spec has blocking tickets and needs a single-branch PR factory; Not for a single bounded in-session build (use implement).
---
# Implement Spec

You have been provided a spec. This spec should have tickets associated with it, describing how to implement the spec.

The goal is a PR which implements the entire spec on a single branch.

The tickets are not a list of steps. They are a **task graph** with blocking relationships between them. This means there is always a **frontier** of tickets which are ready to be grabbed.

Communication to and from subagents should be sparse. Communicate primarily through **context pointers**: to the spec, tickets, research notes, and previous commits. Don't duplicate information already available via pointers.

**Implementer subagents** should be run in the background where possible for **maximum concurrency**.

## When not

- Single bounded ticket or small change → `implement`.
- Spec or tickets not yet accepted → `to-spec` / `to-tickets` first.
- User has not approved creating a branch/draft PR → stop and ask; do not silently open one.

## Steps

1. Read the spec and tickets. Read enough to understand the task graph.

2. (optional) Use an **exploration subagent** to conduct any exploration required by the tickets - relevant codebase files or external documentation. Ensure the exploration subagent can save files - it should save its markdown notes in a directory outside the repo, accessible by all future subagents. This lets **implementer subagents** focus on implementation rather than exploration.

3. Create a branch, and a draft PR. The PR should be marked as 'closing' the spec issue and tickets. **Ask before creating** unless the user already requested the PR.

4. Use **implementer subagents** to implement each ticket. Each implementer subagent should work in its own worktree, on its own branch.

5. Once an **implementer subagent** completes, merge its work to the PR branch with a **merger subagent**.

6. If this changes the **frontier** of available tickets, kick off more **implementer subagents** to work on the new tickets. This allows for maximum concurrency.

7. Once all tickets are complete, run `code-review` on the PR branch. Fix all issues raised by the code review in a single **implementer subagent**.

8. Before marking ready: run `verification-before-completion` on the PR branch (fresh suite/evidence). Then mark the PR as ready for review — only after the user confirms if they have not already asked to un-draft.

9. Clean up all **implementer subagent** worktrees.

## Implementer failure handling

When an **implementer subagent** fails:

1. **Retry** at most **twice** (three attempts total) with a tightened prompt (error output + pointers only).
2. If still failing: mark that ticket **failed**, leave its worktree/branch as-is for inspection, and **continue** other independent frontier tickets.
3. Do **not** block the whole graph on one failed ticket unless every remaining ticket depends on it.
4. Before finishing: report a **failed ticket list** (ticket id/title, last error summary, branch/worktree) in the PR description or a final status message.

## Test gate (per ticket)

An implementer ticket is **not complete** until:

- Targeted tests for that ticket's seam are run (path/`-t` / equivalent), and
- Output shows green (exit 0, failures = 0).

Agent self-report without command output does **not** count. Prefer `verification-before-completion` before claiming a ticket done. Full suite only if the user asks or before marking the PR ready.

## Merger conflicts

When a **merger subagent** hits conflicts:

1. Attempt an automatic resolution that **preserves both intents** where possible (same rules as `resolving-merge-conflicts`).
2. If resolution is unclear or would drop behaviour: **stop**, report the conflicting files and both sides, and ask the user — do **not** silently discard changes.
3. Never `--abort` the overall PR effort without saying so; leave the implementer branch intact.

## Completion

Done when every non-failed ticket is merged, verification evidence is fresh, code-review issues are addressed, and the PR state matches what the user approved (draft vs ready). Report any failed tickets explicitly.
