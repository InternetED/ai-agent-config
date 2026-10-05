# Third-party notices

This package bundles selected work from the following open-source projects.

## mattpocock/skills

- Source: https://github.com/mattpocock/skills
- Pinned commit: `6654f6b60cd9d5be8b54c6fafe44346dabeb3b76`
- Included: every directory below `skills/` containing a `SKILL.md`, regardless of maturity category
- License: MIT; see `licenses/mattpocock-skills-LICENSE`

## everyinc/compound-engineering-plugin

- Source: https://github.com/everyinc/compound-engineering-plugin
- Pinned commit: `37eed42548189fcecbcb9333c8268d2cb4163c5d`
- Included: `ce-commit`
- Derived work: `ed-brainstorm` was inspired by `ce-brainstorm`, then rewritten for this package's Matt Pocock handoff and scope.
- License: MIT; see `licenses/compound-engineering-LICENSE`

## vercel-labs/skills

- Source: https://github.com/vercel-labs/skills
- Pinned commit: `3694740352eeef5cdd689af694c485f1ff62eec3`
- Included: `skills/find-skills/SKILL.md`
- Local adaptation: routing description via `overlays/find-skills/frontmatter.yaml`
- License: MIT; see `Licenses/vercel-skills-LICENSE`

## vercel-labs/agent-browser

- Source: https://github.com/vercel-labs/agent-browser
- Pinned commit: `39a74c70d7759d5a6de7a22c04570bb626bbd081`
- Included: `skills/agent-browser/SKILL.md` (unmodified)
- License: Apache-2.0; see `Licenses/agent-browser-LICENSE`

## anthropics/skills

- Source: https://github.com/anthropics/skills
- Pinned commit: `8a1541c4a3ffa5a20a5a91de0dcf3f0bab1d1ef4`
- Included: complete `skills/frontend-design` and `skills/mcp-builder` directories
- Local adaptation: frontend routing via `overlays/frontend-design/SKILL.md`; the modified Skill carries a local-change notice
- License: Apache-2.0; retain the original `LICENSE.txt` in each included Skill directory
- Excluded: proprietary document-format Skills; no document-format code/assets or upstream bundled media/font dependencies are redistributed

## humanlayer/skills

- Source: https://github.com/humanlayer/skills
- Pinned commit: `ca7c8088db69e315a8b2deea43820270457f8f3c`
- Included: `plugins/show-me/skills/show-me/SKILL.md` and `agents/openai.yaml`
- Local adaptation: explicit Use when / Not for boundaries, cross-platform HTML opening and headless delivery, and rendered-artifact verification in `Skills/show-me/SKILL.md`
- License: MIT; retain `Skills/show-me/LICENSE.txt` with installed copies
- Update policy: standalone import, not refreshed by `npm run upstreams`

Local workflow instructions and OpenUPM packaging are maintained separately in this repository.
