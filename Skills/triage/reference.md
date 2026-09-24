# Triage reference

Read this file for state transitions, the needs-info template, pull-request deltas, or resuming prior triage notes.

## State transitions

An unlabeled issue normally moves to `needs-triage` first. From there it moves to `needs-info`, `ready-for-agent`, `ready-for-human`, or `wontfix`. When a reporter answers, `needs-info` returns to `needs-triage` for re-evaluation.

The maintainer can override the state at any time. Flag an unusual transition and ask before proceeding. If multiple state roles conflict, ask the maintainer before any other action.

Outcome details:

- **`ready-for-agent`:** post an agent brief using [AGENT-BRIEF.md](AGENT-BRIEF.md).
- **`ready-for-human`:** use the same structure, but explain why judgment, external access, design decisions, or manual testing prevents delegation.
- **`needs-info`:** post durable triage notes using the template below.
- **Already-implemented `wontfix`:** point to the existing implementation and close. Do not add it to `.out-of-scope/`; that knowledge base is for rejected requests, not completed behavior.
- **Rejected bug `wontfix`:** explain politely, then close.
- **Rejected enhancement `wontfix`:** record it under `.out-of-scope/`, link that record from a comment, then close. Follow [OUT-OF-SCOPE.md](OUT-OF-SCOPE.md).
- **`needs-triage`:** apply the state role. A partial-progress comment is optional.

## Pull requests as issues with code

When the issue-tracker configuration treats external pull requests as a request surface, triage them with the same category roles, state roles, and state machine as issues. Resolve a bare identifier such as `#42` to an issue or PR according to that configuration.

The differences are:

- Gather the PR body, comments, labels, author, dates, and diff.
- Verify the claim by checking out the change and running the relevant tests or commands; report whether the diff does what it claims.
- `ready-for-agent` means an agent brief is attached and an agent should take the next step on the diff.
- `ready-for-human` means the PR is ready for a human to merge.
- Attention discovery includes only external PRs, as defined by tracker configuration; collaborator work in progress is excluded.
- The external-author filter applies only to discovery. Always triage an explicitly named PR regardless of author.
- In attention lists, mark each result `[PR]` or `[issue]`.

## Needs-info template

Every tracker comment still begins with the AI disclaimer required by the main workflow. Then use:

```markdown
## Triage Notes

**What we've established so far:**

- point 1
- point 2

**What we still need from you (@reporter):**

- question 1
- question 2
```

Put every resolved point from grilling under “established so far” so later sessions retain it. Ask specific, actionable questions rather than “please provide more info.”

## Resuming a previous session

Read all prior triage notes before continuing. Check whether the reporter answered outstanding questions, present the updated picture, and do not ask resolved questions again.

## Label mapping

The role names in this skill are canonical; actual issue-tracker labels may differ. Use the mapping produced by `setup-matt-pocock-skills`. If it is absent, tell the user to run `/setup-matt-pocock-skills` rather than guessing labels.