# Lessons and workspace outputs

Read this file when authoring lesson HTML, an assets component, a reference document, or a learning record.

## Lessons

A lesson is the primary teaching output: one self-contained HTML file in `./lessons/`, titled `0001-<dash-case-name>.html` with an incrementing number.

Make each lesson beautiful, with clean, readable typography and layout; think Tufte. Keep it short and quickly completable because working memory is small. Give the user one tangible win tied directly to the mission and within their zone of proximal development.

If possible, open the lesson file for the user with a CLI command.

Link lessons to other lessons and reference documents using HTML anchors. Recommend one primary source—the highest-quality, highest-trust resource found for the topic. Remind the user to ask the agent follow-up questions about anything unclear.

## Assets

Lessons use reusable components from `./assets/`: stylesheets, quiz widgets, simulators, diagram helpers, and anything a second lesson could reuse.

Reuse is the default. Before authoring a lesson, read `./assets/` and build from existing components. If a lesson needs something new and reusable, create a component in `./assets/` and link it; never inline code that a future lesson would duplicate.

A shared stylesheet is the first component every workspace earns. Every lesson links it so the course stays visually consistent. Grow the component library with the workspace.

## Mission and zone of proximal development

Every lesson must serve the mission: the reason the user wants to learn the topic. If the mission is unclear or `MISSION.md` is unpopulated, first ask why they want to learn it. Without that grounding, lessons become abstract and there is no sound basis for choosing what comes next.

Missions may change as skills and knowledge grow. Update `MISSION.md` and add a learning record for the change, but confirm with the user before changing the mission.

Challenge the user "just enough." If they request a specific topic, teach it at the appropriate level. Otherwise:

1. Read `./learning-records/`.
2. Choose the most relevant next skill from the mission.
3. Teach the most relevant thing within the user's current zone of proximal development.

## Reference documents

Create reference documents alongside lessons when the subject supports them. Lessons are rarely revisited; references should be the compressed essence of their lessons, optimized for quick lookup.

Useful reference forms include:

- Syntax and code snippets for programming.
- Algorithms and flowcharts for processes.
- Yoga poses and sequences.
- Fitness exercises and routines.
- Glossaries for any topic with specialized nomenclature.

Glossaries are essential. After creating one, follow it consistently in every lesson.

## Learning records

Use `./learning-records/*.md` for non-obvious lessons and key insights that later sessions may revise or build on. Number files sequentially as `0001-<dash-case-name>.md` and use [LEARNING-RECORD-FORMAT.md](LEARNING-RECORD-FORMAT.md).

## `NOTES.md`

Record teaching preferences and other working notes in `NOTES.md`. Read those notes when designing lessons or working with the user.