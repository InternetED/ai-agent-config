# OpenUPM publishing

This repository is a Unity Package Manager package at the repository root.

Before submitting it to OpenUPM:

1. Push the public GitHub repository.
2. Confirm `npm run check`, `npm test`, and `npm pack --dry-run` pass.
3. Create a semantic-version tag matching `package.json`, such as `v0.1.0`.
4. Submit `com.interneted.ai-agent-config` through the OpenUPM package-add form.
5. After OpenUPM finishes indexing the tag, verify installation in a clean
   Unity project with `openupm add com.interneted.ai-agent-config`.

Opening that Unity project must automatically synchronize the package once for
the installed version. A user must not need to invoke `Scripts/sync.mjs`.
Confirm the Unity Console reports successful synchronization and that the
Skills appear in both user-level agent directories. The Unity menu command is
only a repair path when automatic synchronization fails.

OpenUPM hosts public open-source Unity packages. Authentication for MCP servers
is separate and remains local to each computer.
