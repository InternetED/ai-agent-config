---
name: implement
description: Implement one bounded ticket or small change in-session. Use when a single task/spec slice is ready to build with tdd + review; Not for multi-ticket worktree PR factories (use implement-spec) or open-ended design.
---

# Implement

Implement the work described by the user in the spec or tickets.

## When not

- Multi-ticket task graph needing parallel worktrees and one closing PR → `implement-spec`.
- Idea still vague or disputed → `ed-workflow` / `ed-brainstorm` or `grill-with-docs`.
- User only wants review or a commit → `code-review` or `ce-commit`.

## Steps

1. Use `tdd` where possible, at pre-agreed seams.
2. Run typechecking regularly and targeted tests (path/`-t` filter) every cycle; run the full suite only at the end (or before commit/PR).
3. Before any success claim, run `verification-before-completion` (fresh command evidence required).
4. Once verified, use `code-review` to review the work.
5. **Do not auto-commit.** Propose a commit via `ce-commit` and wait for the user unless they already asked to commit.

## Completion

Done when implementation matches the ticket/spec, verification evidence is fresh and green, and either a commit was requested and made via `ce-commit` or a commit proposal is waiting on the user.
