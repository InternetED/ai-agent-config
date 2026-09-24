# Ticket drafting reference

## Vertical-slice rules

<vertical-slice-rules>

- Each slice cuts a narrow but COMPLETE path through every layer (schema, API, UI, tests): vertical, NOT a horizontal slice of one layer.
- A completed slice is demoable or verifiable on its own.
- Each slice is sized to fit in a single fresh context window.
- Any prefactoring should be done first.

</vertical-slice-rules>

Give each ticket its **blocking edges**: the other tickets that must complete before it can start. A ticket with no blockers can start immediately.

## Wide refactors

**Wide refactors are the exception to vertical slicing.** A **wide refactor** is one mechanical change—a column rename or shared-symbol retype—whose **blast radius** fans across the whole codebase, so one edit breaks thousands of call sites and no vertical slice can land green. Don't force it into a tracer bullet; sequence it as **expand–contract**.

1. **Expand:** add the new form beside the old so nothing breaks.
2. **Migrate:** move call sites in batches sized by blast radius—per package or directory—with each batch in its own ticket blocked by the expand. Keep CI green between batches because the old form still exists.
3. **Contract:** delete the old form once no caller remains, in a ticket blocked by every migration batch.

When even a migration batch cannot stay green independently, combine only the inseparable portion and state why.

## Local ticket template

<local-ticket-template>

```markdown
# <NN>: <Ticket title>

**What to build:** the end-to-end behaviour this ticket makes work, from the user's perspective, not a layer-by-layer implementation list.

**Blocked by:** the numbers/titles of the tickets that gate this one, or "None (can start immediately)".

**Status:** ready-for-agent

- [ ] Acceptance criterion 1
- [ ] Acceptance criterion 2
```

</local-ticket-template>

## Issue template

<issue-template>

```markdown
## Parent

A reference to the parent issue on the tracker (if the source was an existing issue, otherwise omit this section).

## What to build

The end-to-end behaviour this ticket makes work, from the user's perspective, not layer-by-layer implementation.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Blocked by

- A reference to each blocking ticket, or "None (can start immediately)".
```

</issue-template>

## Avoid stale implementation detail

In either form, avoid specific file paths or code snippets: they go stale fast. Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can—a state machine, reducer, schema, or type shape—inline it and note briefly that it came from a prototype. Trim it to the decision-rich parts, not a working demo: just the important bits.
