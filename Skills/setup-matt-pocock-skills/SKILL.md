---
name: setup-matt-pocock-skills
description: Configure a repository's issue tracker, triage labels, and domain-document layout for the engineering skills. Run once before their first use.
---

# Setup Matt Pocock's Skills

Scaffold the repository configuration expected by the engineering skills:

- Issue-tracker location and operating instructions.
- Triage-label mapping when `triage` is installed.
- Domain-document layout and consumer rules.
- An `## Agent skills` pointer block in the repository's existing agent instructions.

This is a prompt-driven setup, not a deterministic installer.

## Use when / Not for

- **Use when:** configuring these engineering skills in a repository for the first time, switching issue trackers, or restarting their repository setup.
- **Not for:** installing the skills themselves, or re-running setup for a tiny label change—edit `docs/agents/triage-labels.md` directly.

Read [reference.md](reference.md) only when exploring the repository, asking Sections A/B/C, or drafting the Agent skills block.

Seed templates:

- [issue-tracker-github.md](issue-tracker-github.md) for GitHub.
- [issue-tracker-gitlab.md](issue-tracker-gitlab.md) for GitLab.
- [issue-tracker-local.md](issue-tracker-local.md) for local markdown.
- [triage-labels.md](triage-labels.md) when `triage` is installed.
- [domain.md](domain.md) for domain-document rules and layout.

## Process

1. **Explore.** Inspect remotes, existing `CLAUDE.md` or `AGENTS.md`, domain docs, ADRs, prior `docs/agents/` output, local-tracker signals, installed `triage`, and genuine monorepo signals. **Done when:** current conventions and missing configuration are known.
2. **Ask Sections A/B/C.** Recommend the detected tracker; ask about default labels only when `triage` is installed; default domain docs to single-context and offer multi-context only for a real monorepo. Ask one section at a time. **Done when:** each applicable choice is explicit.
3. **Draft and confirm.** Show the exact `## Agent skills` block and every proposed `docs/agents/*.md` file. Let the user revise them. **Done when:** the user confirms the draft.
4. **Write.** Update the existing instruction file in place and write docs from the templates. Include triage configuration only when `triage` is installed. **Done when:** the confirmed files exist without duplicating or overwriting surrounding instructions.
5. **Report.** Name the files written and which engineering skills consume them; explain that small later edits belong directly in `docs/agents/*.md`. **Done when:** the user knows setup is complete and where to maintain it.

## Human gates

- Do not write until the user has reviewed and confirmed the complete draft.
- If neither `CLAUDE.md` nor `AGENTS.md` exists, ask which one to create; never choose for the user.

## Verification

Before finishing:

- The selected instruction file contains exactly one current `## Agent skills` block.
- `docs/agents/issue-tracker.md` and `docs/agents/domain.md` match the confirmed choices.
- `docs/agents/triage-labels.md` and its pointer exist if and only if `triage` is installed.
- Existing surrounding instruction content remains intact.
- Every written file was shown and confirmed before the write.
