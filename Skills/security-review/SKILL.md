---
name: security-review
description: Security pass over a diff or feature (auth, input, secrets). Use before a security-sensitive PR or when asked for an OWASP-oriented review; Not for general code style review.
---

# Security Review

A focused security pass over a change or feature. Stay concise: findings over lectures.

When exploring the area, read `CONTEXT.md` and relevant ADRs if they exist.

## Use when / Not for

- **Use when:** reviewing a diff/feature for security issues — auth, untrusted input, secrets/tokens — before opening a PR that needs a security pass, or when asked for a security/OWASP review.
- **Not for:** general style/architecture review (`code-review`), inventing CVEs you did not look up, or claiming "secure" without walking auth and input paths in the diff.

## When To Apply

- Implementing or changing **auth / authz**
- Handling **user or untrusted input**
- Touching **secrets, tokens, keys, cookies, sessions**
- Adding network, file, or shell surfaces
- Before opening a PR that needs a **security pass**
- User asks to "security review" / "OWASP check"

## Scope Checklist

Scan the diff (and call sites it reaches) for:

1. **Secrets** — hard-coded keys, tokens, passwords; secrets in logs, fixtures, or committed config
2. **Authn / Authz** — missing checks, IDOR, privilege escalation, trust of client-supplied roles/IDs
3. **Injection** — SQL/NoSQL/command/template/XSS; unsanitized sink of user data
4. **Input validation** — missing bounds, type checks, allowlists at trust boundaries
5. **Sensitive data** — PII/secrets in responses, URLs, error messages
6. **Dependencies** — newly added packages with known CVEs or abandoned maintainers (flag; don't invent CVEs)
7. **OWASP Top 10** — only where the change actually touches that class (broken access, injection, misconfig, SSRF, etc.)

Skip generic advice unrelated to this diff.

## Process

1. Identify the change surface: `git diff` / PR files, plus auth and data-flow entry points.
2. Walk the checklist against real code paths.
3. Rank each finding by severity.
4. Report only concrete issues (file + line or symbol). Omit filler.

## Severity

| Level | Meaning |
|-------|---------|
| **Critical** | Exploitable now: auth bypass, RCE, secret leak in repo/runtime |
| **High** | Likely abuse with realistic attacker control |
| **Medium** | Real weakness, needs context or chaining |
| **Low** | Hardening / defense-in-depth |
| **Info** | Observation, no clear exploit path |

## Output Format

For each finding:

```
### [Severity] Short title
- **Where:** `path/to/file` (symbol or ~line)
- **Issue:** one sentence
- **Impact:** one sentence
- **Fix:** concrete remediation
```

End with a one-line summary: counts per severity, or "No significant findings in scope."

**Human gate:** if any Critical or High finding remains open, do not recommend merge until the user acknowledges the risk or the finding is fixed.

## Verification

Done when the full scope checklist was walked against the real diff, every finding cites a file/symbol, and the severity summary is present. "No significant findings" is valid only after that walk.

## Red Flags

- Claiming "secure" without reviewing auth and input paths in the diff
- Inventing CVEs or CVSS scores you did not look up
- Dumping the whole OWASP list with no file references
- Ignoring secrets already in the tree that this change touches
