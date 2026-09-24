---
name: ed-workflow
description: Route an engineering task through Ed's preferred reusable workflow. Use when the user asks which skill to run, how to start a task, or explicitly invokes ed-workflow.
---

# Ed Workflow

Ed-preferred short router for engineering tasks. Prefer this over `ask-matt` when Ed needs the next step on an idea→ship path; `ask-matt` is the fuller Matt-flow map (on-ramps, prototypes, standalone skills).

Choose the **smallest useful next step**. Wait for confirmation before any skill that would publish issues, edit code, or create commits.

## When NOT

- Do not auto-run the full pipeline (brainstorm → grill → spec → tickets → implement → review → commit) in one go.
- Do not invent skill names; only recommend folders that exist under `Skills/`.
- For a broad "which skill exists for X?" map beyond Ed's short path, point at `ask-matt` instead of expanding this table.

## Routing

| Situation | Next skill |
| --- | --- |
| The idea is vague, disputed, broad, or risky | `ed-brainstorm` |
| Existing documents or decisions need adversarial clarification | `grill-with-docs` |
| The conversation is settled and needs a durable specification | `to-spec` |
| An accepted specification needs executable work items | `to-tickets` |
| A ticket or bounded task is ready to build | `implement` |
| Completed changes need review | `code-review` |
| Reviewed changes should become local commits | `ce-commit` |

The user manages branches and worktrees. Never introduce a worktree step unless explicitly requested.

## Completion

Inspect the current repository and conversation, recommend **one** next skill with a one-sentence reason, and stop. Done when the user confirms or picks a different skill — not when the pipeline finishes.
