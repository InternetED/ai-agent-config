---
name: to-tickets
description: Turn an approved plan or spec into blocked tracer-bullet tickets. Use when work needs publishable vertical slices; not for wayfinding maps, open brainstorming, or implementing one ticket.
---

# To Tickets

Break a plan, spec, or settled conversation into **tickets**: tracer-bullet vertical slices that declare the tickets blocking them.

## Use when / Not for

- **Use when:** a sufficiently settled plan or spec needs implementation-sized, publishable vertical slices with explicit dependency edges.
- **Not for:** wayfinding decision maps—use `wayfinder`; open brainstorming—use `ed-brainstorm` or `grill`; implementing one ticket—use `implement`.

The issue tracker and triage label vocabulary should have been provided. If not, tell the user to run `/setup-matt-pocock-skills`.

Read [reference.md](reference.md) when drafting slices, handling wide refactors, or writing ticket bodies.

## Process

1. **Gather context.** Use the current conversation. If the user supplied a spec path, issue number, or URL, fetch its full body and comments.
2. **Explore when needed.** If the codebase has not already been explored, learn the current state, domain glossary, and relevant ADRs. Look for prefactoring that makes the change easy before making the easy change.
3. **Draft vertical slices.** Apply the vertical-slice rules in `reference.md`; give every ticket explicit blocking edges. Use expand–contract tickets for wide refactors that cannot land green as vertical slices.
4. **Get quiz approval.** Present a numbered list with each ticket's title, blockers, and end-to-end behaviour. Ask whether granularity and edges are right and whether tickets should merge or split. Iterate until the user approves; explicit approval already present in the conversation satisfies this human gate.
5. **Publish to the configured tracker.** Publish blockers first. For local files, create one file per ticket under `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01` in dependency order, with text blocking edges. For a real tracker, create one issue per ticket in dependency order and use native blocking or sub-issue relationships where available; otherwise write the blocking references. Apply `ready-for-agent` unless instructed otherwise.

Work the **frontier**: any ticket whose blockers are all done. For a purely linear chain, that means top to bottom. Do not close or modify a parent issue.

## Verification

Before finishing:

- Every approved ticket is published separately with its blockers represented in the configured tracker's supported form.
- The frontier is clear: tickets with no outstanding blockers are visibly ready, and blocked tickets identify what gates them.
