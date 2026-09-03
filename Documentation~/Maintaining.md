# Maintaining AI Agent Config

## Authority boundaries

Edit only these authoritative inputs:

- Add and update shared skills under `Skills/<skill-name>/`.
- Add and update MCP servers in `Config/mcp.servers.json`.
- Change translation behavior in `Scripts/sync.mjs` only when a client format
  changes.
- Treat `upstreams.lock.json` as the record of imported Skill provenance.

Do not hand-edit generated output or installed files. Run the installer again
with an explicit `--scope user` or `--scope project` instead. Never choose a
scope on a user's behalf.

## Add a skill

Create `Skills/<skill-name>/SKILL.md`. Use lowercase letters, digits, and
hyphens for the directory and `name`. Include concise `name` and `description`
frontmatter. Keep the shared workflow portable; place Codex-only UI metadata in
`agents/openai.yaml` only when it adds value.

Run `node Scripts/sync.mjs check`. Completion means every direct child of
`Skills/` has a valid `SKILL.md`, every skill name matches its directory, and
the integration tests pass.

## Update imported Skills

Run `npm run upstreams` to clone the current upstream defaults into a temporary
directory and preview added, changed, and removed Skills. Nothing in the
repository changes during preview.

Run `npm run upstreams -- --apply` to apply the preview, refresh third-party
license copies and commit pins, and validate the result. Add `--install` to
also synchronize the result to both clients. You may test a specific branch or
tag with `--matt-ref <ref>` or `--compound-ref <ref>`.

The updater owns the Skill names recorded under each source in
`upstreams.lock.json`. It must never overwrite the local `ed-brainstorm` or
`ed-workflow` Skills. Review the resulting Git diff before release.

## Add an MCP server

Add one entry to `Config/mcp.servers.json`. Use `stdio` for a local process and
`http` for a streamable HTTP endpoint. Put credential names in `envVars`,
`bearerTokenEnv`, or `headersFromEnv`; keep credential values out of Git.

For example:

```json
{
  "servers": {
    "context7": {
      "transport": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    },
    "internal-docs": {
      "transport": "http",
      "url": "https://docs.example.com/mcp",
      "bearerTokenEnv": "INTERNAL_DOCS_TOKEN"
    }
  }
}
```

Run `node Scripts/sync.mjs generate` and inspect both generated formats before
installation. If a local installation is requested, use
`node Scripts/sync.mjs install --scope user` or
`node Scripts/sync.mjs install --scope project`. Completion means `check`,
`test`, and `npm pack --dry-run` pass.

## Release

Update `package.json` and `CHANGELOG.md`, commit the change, and tag the same
semantic version. The public Git tag can be executed directly with `npx`; the
optional OpenUPM listing reads the same tags and requires the tag version to
match `package.json`.
