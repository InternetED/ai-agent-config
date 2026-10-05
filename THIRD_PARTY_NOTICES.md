# Third-party notices

This package bundles selected work from the following open-source projects.
`upstreams.lock.json` is the authoritative per-Skill source/path/revision registry;
this file records attribution, licensing, and local adaptation rather than duplicate pins.

## mattpocock/skills

- Source: https://github.com/mattpocock/skills
- Pinned commit: `upstreams.lock.json` → `sources.mattpocock-skills.commit`
- Included: every directory below `skills/` containing a `SKILL.md`, regardless of maturity category
- License: MIT; see `Licenses/mattpocock-skills-LICENSE`

## everyinc/compound-engineering-plugin

- Source: https://github.com/everyinc/compound-engineering-plugin
- Pinned commit: `upstreams.lock.json` → `sources.compound-engineering-plugin.commit`
- Included: `ce-commit`
- Derived work: `ed-brainstorm` was inspired by `ce-brainstorm`, then rewritten for this package's Matt Pocock handoff and scope.
- License: MIT; see `Licenses/compound-engineering-LICENSE`

## vercel-labs/skills

- Source: https://github.com/vercel-labs/skills
- Pinned commit: `upstreams.lock.json` → `sources.vercel-skills.commit`
- Included: `skills/find-skills/SKILL.md`
- Local adaptation: routing description via `overlays/find-skills/frontmatter.yaml`
- License: MIT; see `Licenses/vercel-skills-LICENSE`

## vercel-labs/agent-browser

- Source: https://github.com/vercel-labs/agent-browser
- Pinned commit: `upstreams.lock.json` → `sources.agent-browser.commit`
- Included: `skills/agent-browser/SKILL.md` (unmodified)
- License: Apache-2.0; see `Licenses/agent-browser-LICENSE`

## anthropics/skills

- Source: https://github.com/anthropics/skills
- Pinned commit: `upstreams.lock.json` → `sources.anthropic-skills.commit`
- Included: complete `skills/frontend-design` and `skills/mcp-builder` directories
- Local adaptation: frontend routing via `overlays/frontend-design/SKILL.md`; the modified Skill carries a local-change notice
- License: Apache-2.0; retain the original `LICENSE.txt` in each included Skill directory
- Excluded: proprietary document-format Skills; no document-format code/assets or upstream bundled media/font dependencies are redistributed

## humanlayer/skills

- Source: https://github.com/humanlayer/skills
- Pinned commit: `upstreams.lock.json` → `sources.humanlayer-skills.commit`
- Included: `plugins/show-me/skills/show-me/SKILL.md` and `agents/openai.yaml`
- Local adaptation: explicit Use when / Not for boundaries, cross-platform HTML opening and headless delivery, and rendered-artifact verification in `Skills/show-me/SKILL.md`
- License: MIT; retain `Skills/show-me/LICENSE.txt` with installed copies
- Update policy: standalone import, not refreshed by `npm run upstreams`

Local workflow instructions and OpenUPM packaging are maintained separately in this repository.
