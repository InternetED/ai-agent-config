---
name: research
description: Investigate a question against primary sources and save cited Markdown findings. Use when researching docs/APIs or delegating reading legwork; Not for unverified summaries or implementation.
---

Spin up a **background agent** to do the research, so you keep working while it reads.

## Use when / Not for

- **Use when:** the user wants a topic researched, docs or API facts gathered, or reading legwork delegated.
- **Not for:** implementing the answer, publishing a spec (`to-spec`), or secondary blog-style summaries that skip primary sources.

Its job:

1. Investigate the question against **primary sources** (official docs, source code, specs, first-party APIs), not a secondary write-up of them. Follow every claim back to the source that owns it.
2. Write the findings to a single Markdown file, citing each claim's source.
3. Save it where the repo already keeps such notes; match the existing convention, and if there is none, put it somewhere sensible and say where.

## Verification

Done when the Markdown file exists at the reported path and every non-trivial claim has a citation back to a primary source.
