---
name: teach
description: Teach a skill or concept across sessions in a structured workspace. Use for missions, lessons, and learning records; not for one-shot explanations.
---

# Teach

Teach a skill or concept across sessions. Treat the current directory as a stateful teaching workspace whose files carry learning context between sessions.

## Use when / Not for

- **Use when:** the user wants structured lessons tied to a mission, reusable references, and a persistent learning record.
- **Not for:** a one-shot explanation with no teaching workspace, or implementing a coding ticket—use `implement`.

## Teaching workspace

- `MISSION.md`: why the user wants to learn the topic. Use [MISSION-FORMAT.md](MISSION-FORMAT.md).
- `RESOURCES.md`: trusted sources for knowledge and wisdom. Use [RESOURCES-FORMAT.md](RESOURCES-FORMAT.md).
- `./lessons/0001-<name>.html`: short, self-contained lessons.
- `./assets/*`: reusable lesson components.
- `./reference/*.html`: printable cheat sheets, algorithms, syntax, poses, and glossaries.
- `./learning-records/0001-<name>.md`: non-obvious lessons and insights used to choose future work. Use [LEARNING-RECORD-FORMAT.md](LEARNING-RECORD-FORMAT.md).
- `NOTES.md`: teaching preferences and working notes.

Read [philosophy.md](philosophy.md) only when designing lesson difficulty, choosing a knowledge-versus-skills focus, or explaining the pedagogy.

Read [lessons.md](lessons.md) only when authoring lesson HTML, an assets component, a reference document, or a learning record.

## Philosophy

- **Knowledge:** ground claims in high-quality, high-trust resources; never rely on parametric knowledge alone.
- **Skills:** teach through relevant practice with the tightest possible feedback loop.
- **Wisdom:** encourage real-world interaction with reputable practitioners or communities.

Prefer storage strength—long-term retention—over the temporary feeling of fluency. Use retrieval practice, spacing, and skills-focused interleaving.

## Workflow

1. **Ground the mission.** Read `MISSION.md`. If it is missing or unclear, ask why the user wants to learn this topic. Confirm with the user before creating or changing the mission.
2. **Ground the knowledge.** Read and improve `RESOURCES.md`; select high-quality sources and a primary source for the lesson.
3. **Choose the lesson.** Read prior learning records and pick one mission-relevant skill in the user's zone of proximal development.
4. **Reuse assets.** Inspect `./assets/`; reuse components and create a shared component rather than duplicating reusable code.
5. **Teach and record.** Create the short lesson and any compressed reference material, then add a learning record for non-obvious learning or a changed mission.
6. **Capture preferences.** Update `NOTES.md` when the user reveals a durable teaching preference.

## Human gates

- Confirm the mission with the user before creating or changing it.
- A community can supply real-world wisdom, but never push one after the user says they do not want community participation.

## Verification

Before finishing:

- The lesson is tied to the confirmed mission and appropriate to the recorded learning level.
- Claims cite trusted sources, with one primary source recommended.
- Existing assets were reused and reusable additions were not inlined.
- New learning or mission changes are captured in an incremented learning record.
- Durable teaching preferences are reflected in `NOTES.md`.
