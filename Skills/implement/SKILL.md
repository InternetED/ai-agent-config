---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
---

Implement the work described by the user in the spec or tickets.

Use /tdd where possible, at pre-agreed seams.

Run typechecking regularly. Each cycle, run only tests related to this change (path filter or `-t` / equivalent). Run the full suite only when the user explicitly asks or before opening a PR.

Once done, use /code-review to review the work.

Commit your work to the current branch.
