---
name: ed-workflow
description: Route an engineering task through Ed's preferred reusable workflow. Use when the user asks which skill to run, how to start a task, or explicitly invokes ed-workflow.
---

# Ed Workflow

Choose the smallest useful next step. Do not run the entire pipeline automatically.

## Routing

| Situation | Next skill |
| --- | --- |
| The idea is vague, disputed, broad, or risky | `$ed-brainstorm` |
| Existing documents or decisions need adversarial clarification | `$grill-with-docs` |
| The conversation is settled and needs a durable specification | `$to-spec` |
| An accepted specification needs executable work items | `$to-tickets` |
| A ticket or bounded task is ready to build | `$implement` |
| Completed changes need review | `$code-review` |
| Reviewed changes should become local commits | `$ce-commit` |

The user manages branches and worktrees. Never introduce a worktree step unless explicitly requested.

Inspect the current repository and conversation, recommend one next skill with a one-sentence reason, and wait for confirmation when that skill would publish issues, edit code, or create commits.
