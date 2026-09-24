---
name: ed-brainstorm
description: Clarify an ambiguous software idea into agreed product and technical decisions before specification. Use only when the user explicitly invokes this skill or directly asks to brainstorm an idea.
---

# Ed Brainstorm

Turn a vague or consequential idea into a decision-complete brief that can be handed to `to-spec`. Do not implement, create tickets, or commit changes.

## Use when / Not for

- **Use when:** the user explicitly invokes this skill or asks to brainstorm an ambiguous product/technical idea into agreed decisions.
- **Not for:** implementing code, publishing a spec (`to-spec`), writing tickets (`to-tickets`), or pressure-testing domain rules already in a docs trail (`grill-with-docs`).

## Method

1. Inspect the repository, relevant documentation, issue tracker context, domain glossary, and nearby implementation before asking questions that the available context can answer.
2. State the current understanding in one short paragraph. Separate known facts from assumptions.
3. Identify the smallest set of decisions that materially changes the solution. Usually these are user and problem, scope, behavior, constraints, architecture boundaries, migration or compatibility, and success criteria.
4. Resolve one decision at a time. Offer two or three concrete options when choices are unclear, recommend one, and explain its main trade-off. Do not ask a batch of generic questions.
5. Challenge attractive but unnecessary scope. Name important failure modes, edge cases, and irreversible choices.
6. Stop interviewing when remaining uncertainty can safely be handled during implementation.

For a small, bounded change, keep the result brief. For a large or risky change, explore alternatives more deeply, but stay focused on decisions rather than producing a long design document prematurely.

## Completion brief

Present a concise synthesis with these headings:

- Goal and user problem
- In scope
- Out of scope
- Expected behavior and success criteria
- Decisions and rationale
- Constraints and risks
- Remaining open questions

**Human gate:** ask the user to confirm or correct the synthesis. Do not silently treat unresolved choices as settled.

## Handoff

- If the brief is settled, recommend `to-spec`.
- If terminology, domain rules, or constraints still need pressure-testing, recommend `grill-with-docs`, then return to `to-spec`.
- If a spec already exists and is accepted, recommend `to-tickets`.
- Never invent a `ce-plan` (or similar) handoff; this collection uses Matt Pocock's `to-spec` / `to-tickets` workflow.
