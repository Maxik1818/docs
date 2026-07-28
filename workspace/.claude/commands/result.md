---
description: Log a test result with numbers, so improvement is visible over time
argument-hint: <what was tested and how it went>
---

Log this result: $ARGUMENTS

1. **Resolve the project** (as `/drop` does).
2. **Find the previous number.** Grep the project's `log.md` for the most recent
   `#result` entry on the same metric. You need it for the comparison — a result with
   no baseline is nearly useless.
3. **Write the entry** at the top of `log.md`, following `_templates/result.md`:
   ```
   ## <YYYY-MM-DD> — <what was tested> #result [<device>]

   **Tested:** <thing and version>
   **How:** <sample size / method>
   **Numbers:** <metric: value>  (previous: <value, or "no baseline">)
   **Verdict:** better / worse / inconclusive
   **Next:** <the one change to try next>
   ```
   Don't invent numbers. If the user didn't give a metric, ask for one short answer —
   or write `**Numbers:** not measured` and say plainly that this makes the result
   hard to build on.
4. **Backfill the prompt scoreboard.** If a prompt version was tested, set that
   version's `**Result:**` line in `projects/<slug>/prompts/<slug>.md`.
5. **Update the README** `**Status:**` and `**Next:**`.
6. **Commit and push:**
   `git add -A && git commit -m "result: <slug> — <verdict>" && git push origin HEAD:$(cat .claude/workspace-branch)`

Reply in three lines: the numbers with their comparison, the verdict, and the next thing to try.
