---
name: diagnosing-bugs
description: Diagnose hard bugs and performance regressions through a tight feedback loop. Use for broken, throwing, failing, flaky, or slow behavior with an unknown cause.
---

# Diagnosing Bugs

A disciplined workflow for hard bugs. Skip later phases only when you can justify it; **never skip Phase 1: Build a feedback loop**.

When exploring the codebase, read `CONTEXT.md` if present and check ADRs in the area being changed.

## Use when / Not for

- **Use when:** behavior is broken, throwing, failing, flaky, or slow and the cause is unknown; the user asks to diagnose or debug it.
- **Not for:** a casual typo, or a known-cause fix ready to implement—use `implement` or `tdd`.

## Redact

Redact every secret from commands, outputs, and captured artifacts as `<REDACTED>`. Keep credentials in environment variables, and quote only signal-bearing lines from artifacts containing auth headers. If redacted output is insufficient, say what is missing and ask the user.

Read [phases.md](phases.md) only when executing a phase or when stuck choosing a feedback-loop technique.

## Phases

1. **Build a feedback loop.** Create and run one fast, deterministic, unattended command that exercises the real path and can fail on the user's exact symptom.
2. **Reproduce and minimise.** Observe the reported failure repeatedly, then remove inputs, callers, configuration, data, and steps until every remaining element is load-bearing.
3. **Hypothesise.** Write 3–5 ranked, falsifiable predictions and show them to the user before testing; continue with your ranking if they are unavailable.
4. **Instrument.** Test one prediction at a time, preferring a debugger over uniquely tagged targeted logs; measure performance before changing it.
5. **Fix and regress.** At the correct seam, turn the minimal repro into a failing test before fixing; if no correct seam exists, document that architectural gap.
6. **Clean up and verify.** Re-run the original loop and regression test, remove all diagnostic artifacts, and record the confirmed cause.

### Phase 1 completion criterion

Do not proceed until you can name **one command you have already run**, with redacted invocation and output, that is:

- **Red-capable:** drives the actual bug path and asserts the user's exact symptom—not merely “does not crash.”
- **Deterministic:** gives the same verdict, or a pinned high reproduction rate for a flaky bug.
- **Fast:** seconds, not minutes.
- **Agent-runnable:** unattended, with any unavoidable human action structured through `scripts/hitl-loop.template.sh`.

If no such loop can be built, stop, list what was tried, and request access to the reproducing environment, a redacted captured artifact, or permission for temporary production instrumentation. No red-capable command means no Phase 2.

## Verification

Phase 6 is required before declaring done:

- [ ] The original reproduction no longer fails when the Phase 1 loop is rerun.
- [ ] The regression test passes, or the absence of a correct seam is documented.
- [ ] All `[DEBUG-...]` instrumentation is removed by searching for its unique prefix.
- [ ] Throwaway prototypes are deleted or moved to a clearly marked debug location.
- [ ] The confirmed hypothesis is stated in the commit or PR message.
