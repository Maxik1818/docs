---
description: Brief me on where a project stands
argument-hint: [project name — omit to list all]
---

Catch me up on: $ARGUMENTS

**This command never writes files.** Read only.

If no project was named: run `bash .claude/scripts/ws-status.sh`, show the list, and
ask which one (numbered). Stop there.

If a project was named (match loosely — "smile flow" → `projects/smile-flow/`):

1. Read `projects/<slug>/README.md`.
2. Read the top ~5 entries of `projects/<slug>/log.md`.
3. List `projects/<slug>/prompts/` and read the top (LIVE) version block of each.

Then give a brief of **10 lines or fewer** — the user is on a phone:

```
<Project> — <status>

Last 3 things:
- <date>: <what happened, one line>
- <date>: <what happened, one line>
- <date>: <what happened, one line>

Open: <the open questions, one line>
Next: <the next action>
```

If the project's README is still a template (unfilled `<...>` placeholders), say so
and offer to fill it in by talking it through — three questions maximum: what it is,
what success looks like, what's next.
