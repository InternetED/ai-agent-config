---
name: handoff
description: Compact the current conversation into a handoff document for another agent. Use when continuing work in a fresh session via a file; not when launching a Claude background agent immediately (use claude-handoff).
---

Write a handoff document summarising the current conversation so a fresh agent can continue the work. Save to the temporary directory of the user's OS - not the current workspace.

## Use when / Not for

- **Use when:** continuing work in a fresh session via a portable handoff file (new harness, directory, colleague, or mid-phase fork).
- **Not for:** launching a Claude Code background agent that starts immediately (use `claude-handoff`).

Include a "suggested skills" section in the document, naming which skills the next agent should call the Skill tool for.

Do not duplicate content already captured in other artifacts (specs, plans, ADRs, issues, commits, diffs). Reference them by path or URL instead.

Redact any sensitive information, such as API keys, passwords, or personally identifiable information.

If the user passed arguments, treat them as a description of what the next session will focus on and tailor the doc accordingly.

## Completion

Done when the handoff file exists and its **absolute path is reported** to the user (path reported = verified).
