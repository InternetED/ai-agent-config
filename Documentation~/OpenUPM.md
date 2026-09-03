# Optional OpenUPM publishing

OpenUPM is an optional Unity-specific entry point. The primary cross-platform
installer is the repository's `npx` command documented in the README.

Before publishing a Unity package release:

1. Push the public GitHub repository.
2. Confirm `npm run check`, `npm test`, and `npm pack --dry-run` pass.
3. Create a semantic-version tag matching `package.json`.
4. Submit or update `com.interneted.ai-agent-config` on OpenUPM.
5. Verify installation in a clean Unity project with
   `openupm add com.interneted.ai-agent-config`.

Installing the Unity package must not select an AI-agent configuration scope or
write agent configuration automatically. The user chooses one menu action:

```text
Tools > AI Agent Config > Install > User Scope
Tools > AI Agent Config > Install > Project Scope
```

Both actions run the same repository synchronizer used by the cross-platform
installer. Node.js 18 or newer must be available on `PATH`. Authentication for
MCP servers remains local to each computer and is never included in the package.
