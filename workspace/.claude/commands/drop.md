---
description: Capture a raw thought into the right project, then commit and push
argument-hint: <the thought, spoken or typed>
---

Capture this thought: $ARGUMENTS

1. **Pick the project.** Read the `**Status:**` line and `## What this is` section of
   each `projects/*/README.md`. Match against the thought.
   - Exactly one plausible match → use it, don't ask.
   - Genuinely ambiguous → ask ONE question with numbered options. Nothing else.
   - No match → `inbox.md`.
2. **Write the entry** at the top of that project's `log.md` (or `inbox.md`), directly
   under the `# Log` title, following `_templates/log-entry.md`:
   - `## <today's date YYYY-MM-DD> — <short title> #thought [<phone|pc>]`
   - The user's words **verbatim in a `>` block** — do not clean up the dictation, quote it.
   - Then 2–5 lines of your own cleaned-up reading of it.
   - `**Next:**` line if it implies an action, otherwise `none`.
   Device tag: `[phone]` if `CLAUDE_CODE_REMOTE=true`, else `[pc]`.
3. **Update the project README** if warranted: rewrite `**Next:**` when the thought
   implies a new next action. If it's clearly a decision, also add a one-line dated
   entry to `## Decisions` and tag the log entry `#decision` instead of `#thought`.
4. **Commit and push** — do not skip this, the container is disposable:
   `git add -A && git commit -m "thought: <slug> — <title>" && git push origin HEAD:$(cat .claude/workspace-branch)`
   If the push is rejected as non-fast-forward, `git pull --rebase --autostash` (the
   union merge driver handles `log.md` automatically) and push again.

Reply in **three lines or fewer**: which file it went into, and the project's new `Next`.
