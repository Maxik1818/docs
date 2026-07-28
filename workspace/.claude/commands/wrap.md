---
description: Summarize this session into the project logs, then commit and push
---

Wrap up this session. This is what makes the session durable — the raw conversation
is NOT recoverable later, only what gets written here.

For **each project touched in this session**:

1. **Write one `#session` entry** at the top of `projects/<slug>/log.md`:
   ```
   ## <YYYY-MM-DD> — <short title> #session [<phone|pc>]

   **Tried:** <what was attempted>
   **Worked:** <what worked>
   **Didn't:** <what didn't, and how it failed>
   **Numbers:** <any metrics, or omit this line>

   **Next:** <the next action>
   ```
   One entry per project, not one per topic. Be specific — "shortened the greeting to
   one sentence, callers stopped interrupting" beats "improved the prompt".
2. **Record prompt iterations.** Any prompt changed this session gets a new version
   block at the top of `projects/<slug>/prompts/<slug>.md` (see `/prompt`).
3. **Rewrite the README.** Update `**Status:**` and `**Next:**`. Append any new dated
   one-liners to `## Decisions`. Remove open questions that got answered; add new ones.
4. **Re-sort** the top of `log.md` if entries are out of date order (a union merge from
   the other device can interleave them). Newest date first.
5. **Archive if huge.** Only if `log.md` exceeds ~500 lines: move the oldest half into
   `projects/<slug>/log-archive-<year>-H<n>.md` and leave a one-line pointer at the bottom.

Then, once for the whole workspace:

6. **Regenerate the index table** in `README.md` from
   `bash .claude/scripts/ws-status.sh --table`, replacing the rows between the
   `<!-- table generated ... -->` and `<!-- end table -->` markers.
7. **Commit and push:**
   `git add -A && git commit -m "wrap: <projects touched> — <one-line gist>" && git push origin HEAD:$(cat .claude/workspace-branch)`
   On a non-fast-forward rejection: `git pull --rebase --autostash`, then push again.
8. **Verify it landed:** `git status` clean, and
   `git rev-list --count origin/$(cat .claude/workspace-branch)..HEAD` is `0`.

Finish by printing **the file paths you wrote** and the push confirmation, so it can
be checked from the phone's GitHub app. If the current branch isn't the durable
branch, say so explicitly.
