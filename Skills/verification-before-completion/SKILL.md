---
name: verification-before-completion
description: Use when about to claim work is complete, fixed, or passing, or before commit/PR — require a fresh verification command and its output before any success claim.
---

# Verification Before Completion

**Evidence before claims.** No completion, fix, or "passing" language without a verification command you just ran in this turn.

## Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If you did not run the proving command in this message, you cannot claim it passes.

## Gate Function

Before claiming status or expressing satisfaction:

1. **IDENTIFY** — What command proves this claim?
2. **RUN** — Execute that command fresh (full, not recalled).
3. **READ** — Full output, exit code, failure counts.
4. **VERIFY** — Does the output actually confirm the claim?
   - No → report actual status with evidence.
   - Yes → state the claim **with** that evidence.
5. **ONLY THEN** — Make the claim.

Skip a step = unverified assertion.

Prefer **targeted** checks that prove the claim (path/`-t` filters). Use the full suite only when the claim is about the whole suite, or before commit/PR when the project expects it.

## Common Failures

| Claim | Requires | Not sufficient |
|-------|----------|----------------|
| Tests pass | Test command output, 0 failures | Prior run, "should pass" |
| Linter clean | Linter output, 0 errors | Partial path, extrapolation |
| Build succeeds | Build exit 0 | Linter green alone |
| Bug fixed | Repro / symptom check passes | Code changed, assumed fixed |
| Regression test works | Red → green cycle observed | Test passes once |
| Agent finished | Diff / artifacts inspected | Agent said "success" |
| Requirements met | Checklist vs evidence | "Tests pass" alone |

## Red Flags — STOP

- "Should", "probably", "seems to"
- Satisfaction before verification ("Done!", "Perfect!")
- Commit / push / PR without a fresh run
- Trusting a subagent's success report without checking
- Partial checks treated as whole-suite proof
- Any wording that implies success without having run verification

## When To Apply

**Always before:** success/completion claims; satisfaction; commit or PR; marking a ticket done; moving to the next task; accepting subagent results as finished.
