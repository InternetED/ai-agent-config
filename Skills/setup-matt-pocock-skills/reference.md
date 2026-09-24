# Setup reference

Read this file when exploring the repository, asking Sections A/B/C, or drafting the Agent skills block.

## Explore checklist

Read the repository's current state rather than assuming it:

- `git remote -v` and `.git/config`: hosting provider and repository.
- Root `AGENTS.md` and `CLAUDE.md`: which exists, and whether either already contains `## Agent skills`.
- Root `CONTEXT.md` and `CONTEXT-MAP.md`.
- `docs/adr/` and any `src/*/docs/adr/` directories.
- `docs/agents/`: prior setup output.
- `.scratch/`: evidence of a local-markdown tracker convention.
- Whether `triage` is installed, either beside this skill or among available skills. Section B runs only when it is.
- Monorepo signals: `pnpm-workspace.yaml`, a `workspaces` field in `package.json`, or populated `packages/*` directories with their own `src/`. Multi-context is only for a genuinely large multi-package repository.

Present what exists and what is missing. Ask one section at a time, leading with the recommended answer so the user can accept it in one word. Explain only choices that genuinely branch. Skip Section B when `triage` is absent and Section C's question when no monorepo signal exists.

## Section A: issue tracker

Explain that skills such as `to-tickets`, `triage`, and `to-spec` must know where issues live and whether to invoke a tracker CLI, write local markdown, or follow another workflow.

Recommend GitHub when a remote points to GitHub, GitLab for a GitLab remote, or otherwise offer:

- **GitHub:** repository GitHub Issues through `gh`.
- **GitLab:** repository GitLab Issues through [`glab`](https://gitlab.com/gitlab-org/cli).
- **Local markdown:** `.scratch/<feature>/` files, useful for solo or remote-less repositories.
- **Other:** Jira, Linear, or another system; ask for one paragraph describing the workflow and preserve it as freeform prose.

Write the choice to `docs/agents/issue-tracker.md`. GitHub and GitLab templates include “PRs as a request surface,” defaulted off. Leave it off without prompting; users can edit the file later.

## Section B: triage label vocabulary

Skip this section when `triage` is not installed. Otherwise ask exactly:

> Do you want to keep the default triage labels? (recommended: **yes**)

The five canonical roles default to identically named labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. On yes, write them unchanged. Only on no, collect overrides so existing labels such as `bug:triage` are reused rather than duplicated.

## Section C: domain docs

Default to **single-context**: one root `CONTEXT.md` plus root `docs/adr/`. This fits almost every repository and requires no question.

Offer **multi-context** only when exploration found monorepo signals. It uses a root `CONTEXT-MAP.md` pointing to per-context `CONTEXT.md` files. Ask which layout the user wants.

## Draft Agent skills block

Before writing, show the proposed block and every generated `docs/agents/*.md` file. Let the user edit them.

```markdown
## Agent skills

### Issue tracker

[one-line summary of where issues are tracked]. See `docs/agents/issue-tracker.md`.

### Triage labels

[one-line summary of the label vocabulary]. See `docs/agents/triage-labels.md`.

### Domain docs

[one-line summary of layout: "single-context" or "multi-context"]. See `docs/agents/domain.md`.
```

Omit the triage subsection and `docs/agents/triage-labels.md` when `triage` is not installed.

## File selection and writing rules

- Edit `CLAUDE.md` when it exists; otherwise edit `AGENTS.md` when it exists.
- If neither exists, ask which one to create. Never choose for the user.
- Never create one file when the other already exists.
- Update an existing `## Agent skills` block in place; do not append a duplicate or overwrite surrounding user edits.
- Start from the matching templates in this skill directory. For another tracker, write `docs/agents/issue-tracker.md` from the user's description.
- After setup, users may edit `docs/agents/*.md` directly. Re-run this skill only to switch trackers or restart setup.