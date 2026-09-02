# OpenUPM publishing

This repository is a Unity Package Manager package at the repository root.

Before submitting it to OpenUPM:

1. Push the public GitHub repository.
2. Confirm `npm run check`, `npm test`, and `npm pack --dry-run` pass.
3. Create a semantic-version tag matching `package.json`, such as `v0.1.0`.
4. Submit `com.interneted.ai-agent-config` through the OpenUPM package-add form.
5. After OpenUPM finishes indexing the tag, verify installation in a clean
   Unity project with `openupm add com.interneted.ai-agent-config`.

OpenUPM hosts public open-source Unity packages. Authentication for MCP servers
is separate and remains local to each computer.
