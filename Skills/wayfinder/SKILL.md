---
name: wayfinder
description: Plan multi-session ambiguous efforts as shared decision maps. Use when the route needs discovery; not for executable implementation plans or work that fits one session.
---

# Wayfinder

A loose idea is too large for one agent session and wrapped in fog: the way to the **destination** is not visible yet. Wayfinding charts that route as a **shared map** of decision tickets, then resolves them one at a time until the way is clear.

## Use when / Not for

- **Use when:** an effort spans sessions and still has decisions or investigations between the current state and its destination.
- **Not for:** an executable implementation plan, a single implementation ticket, or work whose route is already clear and fits one session.

Naming the destination is the first human gate. It might be a spec to hand off, a decision to lock before planning, or a change made in place. The destination fixes the scope and shapes every ticket.

## Plan, don't do

Wayfinder is **planning** by default. Each ticket resolves a decision, and the map is done when nothing remains to decide before execution. The pull to do the work usually marks the edge of the map and the point to hand off. An effort may override this in its **Notes**, but otherwise produce decisions, not deliverables.

## Refer by name

Every map and ticket is an issue with a title. In human-facing narration and Decisions so far, refer to it by that linked name, never a bare id, number, or slug. The id and URL ride inside the name; they do not stand in for it.

Read [reference.md](reference.md) when creating or updating a map or ticket, or choosing a ticket type.

Read [fog-and-scope.md](fog-and-scope.md) when deciding whether something is a ticket, Not yet specified, or Out of scope.

## Chart the map

The user invokes this mode with a loose idea.

1. **Name the destination.** Call the Skill tool twice, for "grilling" and "domain-modeling", to pin down the spec, decision, or change this map is finding its way to. Do not proceed until the human agrees on the destination.
2. **Map the frontier.** Grill again, breadth-first: fan across the whole space to surface open decisions and the first steps takeable now. If this surfaces no fog and the whole journey fits one session, stop; no map is needed, so ask the user how to proceed.
3. **Create the map.** Apply `wayfinder:map`; fill Destination and Notes; leave Decisions so far empty; sketch the fog in Not yet specified.
4. **Create the tickets currently specifiable.** Make them child issues, then wire blocking edges in a second pass after issue ids exist. Leave questions that are not yet precise in the fog.
5. **Fire research subagents.** For each new `research` ticket, start a subagent that calls the Skill tool with "research", captures findings on a throwaway `research/<name>` branch, and links that context from the ticket.
6. **Stop.** Charting is one session's work and hand-resolves nothing.

## Work through the map

The user invokes this mode with a map URL or number. A ticket is optional: without one, choose the next decision. Never resolve more than one ticket per session, except research tickets.

1. Load the map's low-resolution view, not every ticket body.
2. Use the ticket the user named, or take the first frontier ticket in order. **Claim it first** by assigning it to yourself before any work.
3. Resolve it. Fetch related or closed tickets only as needed and call the skills named in `## Notes`. If in doubt, call the Skill tool twice, for "grilling" and "domain-modeling". HITL ticket types are a human gate: the human speaks for themselves; the agent never supplies their side of the exchange.
4. Post the answer as a resolution comment, close the issue, and append a linked context pointer to the map's Decisions so far.
5. Create then wire newly surfaced tickets. Graduate newly precise fog into tickets and remove each graduated patch from Not yet specified. Rule work beyond the destination out of scope. Update or delete map tickets invalidated by the decision.

Other sessions may edit the tracker concurrently because the user may run unblocked tickets in parallel.

## Verification

Before finishing:

- The map exists with its destination, notes, decisions index, fog, and scope sections.
- A worked ticket was claimed before work, answered in a resolution comment, and then closed.
- Decisions so far contains a linked one-line gist for every resolved ticket and does not duplicate the ticket's detail.
