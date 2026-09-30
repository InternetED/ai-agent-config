---
name: implement-spec
description: Multi-ticket task-graph → one integration branch (draft PR when tracker/user requires). Use when an accepted spec needs a single-branch PR factory; Not for one in-session build (use implement).
---
# Implement Spec

You have been provided a spec. This spec should have tickets associated with it, describing how to implement the spec.

The issue tracker should have been provided to you. If not, tell the user to run `/setup-matt-pocock-skills`.

The goal is the entire spec implemented on a single **integration branch**, with every ticket resolved the way the issue tracker closes work.

The tickets are not a list of steps. They are a **task graph** with blocking relationships between them. This means there is always a **frontier** of tickets which are ready to be grabbed.

Communication to and from subagents should be sparse. Communicate primarily through **context pointers**: to the spec, tickets, research notes, and previous commits. Don't duplicate information already available via pointers.

**Implementer subagents** should be run in the background where possible for **maximum concurrency**.

## When not

- Single bounded ticket or small change → `implement`.
- Spec or tickets not yet accepted → `to-spec` / `to-tickets` first.
- User has not approved creating a branch/draft PR → stop and ask; do not silently open one.
- Live money / product UI / deploy / secrets → human gate; do not treat this skill as authorization.

## Steps

1. Read the spec and tickets to understand the task graph.

2. (optional) Use an **exploration subagent** to conduct any exploration required by the tickets - relevant codebase files or external documentation. Ensure the exploration subagent can save files - it should save its markdown notes in a directory outside the repo, accessible by all future subagents. This lets **implementer subagents** focus on implementation rather than exploration.

3. Create the integration branch. If the issue tracker closes work through PRs, or the user asks for one, open a **draft** PR after the first merge in step 5 (a branch with no commits ahead of main can't open one), marked as closing the spec and tickets. **Ask before creating** unless the user already requested the PR. Default stays Draft; do not undraft/merge without explicit user ask.

4. Use **implementer subagents** to implement each ticket, each in its own worktree on its own branch. Each implementer subagent:
   - confirms its worktree is based on the integration branch before starting, and resets onto it if not;
   - calls the Skill tool with `tdd` to build the ticket;
   - merges the integration branch tip into its own branch before reporting done.

5. Once an **implementer subagent** completes, merge its work to the integration branch with a **merger subagent**.

6. If this changes the **frontier** of available tickets, kick off more **implementer subagents** to work on the new tickets. This allows for maximum concurrency.

7. Once all tickets are complete, call the Skill tool with `code-review` on the integration branch. Fix all issues raised by the code review in a single **implementer subagent**.

8. Before marking ready: run `verification-before-completion` on the integration branch (fresh suite/evidence). If a draft PR exists, mark it ready for review only after the user confirms if they have not already asked to un-draft. Otherwise, resolve each ticket the way the issue tracker closes work, and report the integration branch.

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

1. Attempt an automatic resolution that **preserves both intents** where possible (trace each side to its primary source / ticket intent rather than picking lines blindly).
2. If resolution is unclear or would drop behaviour: **stop**, report the conflicting files and both sides, and ask the user — do **not** silently discard changes.
3. Never `--abort` the overall PR effort without saying so; leave the implementer branch intact.

## Completion

Done when every non-failed ticket is merged, verification evidence is fresh, code-review issues are addressed, and the PR state matches what the user approved (draft vs ready). Report any failed tickets explicitly.
