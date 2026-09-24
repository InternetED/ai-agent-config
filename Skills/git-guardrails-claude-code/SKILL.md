---
name: git-guardrails-claude-code
description: Configure Claude Code to block destructive git commands before execution. Use for project or global git safety hooks.
---

# Setup Git Guardrails

Install a Claude Code `PreToolUse` hook that rejects selected dangerous git commands before Claude executes them.

## Use when / Not for

- **Use when:** the user wants Claude Code to block destructive git operations at project or global scope.
- **Not for:** non-Claude-Code harnesses, or as a substitute for human review before any authorized force-push.

## What gets blocked

- Every `git push`, including force variants.
- `git reset --hard`.
- `git clean -f` and `git clean -fd`.
- `git branch -D`.
- `git checkout .` and `git restore .`.

Claude receives a message explaining that it lacks authority when a command is blocked.

Read [reference.md](reference.md) only when writing or merging `settings.json` hook configuration.

The bundled hook is [scripts/block-dangerous-git.sh](scripts/block-dangerous-git.sh).

## Steps

1. **Choose scope.** Ask whether to install for this project (`.claude/settings.json`) or all projects (`~/.claude/settings.json`).
2. **Copy the hook.** Put the bundled script at `.claude/hooks/block-dangerous-git.sh` for project scope or `~/.claude/hooks/block-dangerous-git.sh` for global scope, then make it executable with `chmod +x`.
3. **Configure Claude Code.** Add the corresponding `PreToolUse` Bash hook from [reference.md](reference.md). Merge into `hooks.PreToolUse` without overwriting existing settings.
4. **Customize.** Ask whether the user wants to add or remove blocked patterns; edit only the copied script.
5. **Verify.** Pipe a simulated push request into the installed script and confirm exit code 2 plus a `BLOCKED` message on stderr.

## Verification

Run:

```bash
echo '{"tool_input":{"command":"git push origin main"}}' | <path-to-script>
```

The installed script must exit with code 2 and print `BLOCKED` to stderr. Also confirm the target settings remain valid JSON and retain pre-existing hooks and settings.
