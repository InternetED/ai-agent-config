# Claude Code hook configuration

Read this file when writing or merging `settings.json` hook configuration.

## Project configuration

Add this entry to `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-dangerous-git.sh"
          }
        ]
      }
    ]
  }
}
```

The project script belongs at `.claude/hooks/block-dangerous-git.sh`.

## Global configuration

Add this entry to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/block-dangerous-git.sh"
          }
        ]
      }
    ]
  }
}
```

The global script belongs at `~/.claude/hooks/block-dangerous-git.sh`.

## Merge guidance

When the target settings file already exists, preserve every existing setting. Merge the new Bash matcher entry into `hooks.PreToolUse`; do not replace the object, the array, or unrelated hooks. Keep valid JSON and avoid adding a duplicate guardrail entry when setup is rerun.