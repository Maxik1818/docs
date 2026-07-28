---
description: Record a prompt version, keeping the full history of what was tried
argument-hint: [prompt name] — the prompt text follows, or is taken from this session
---

Record a prompt version: $ARGUMENTS

1. **Locate the file.** Resolve the project (as `/drop` does), then
   `projects/<slug>/prompts/<prompt-slug>.md`. If the prompt name wasn't given, infer
   it from what the prompt does — kebab-case, e.g. `intake-greeting`.
2. **New file?** Create it from `_templates/prompt.md` with this as `v1 — LIVE`.
3. **Existing file?** Read the highest `v<N>` at the top, then:
   - Change that block's header from `LIVE` to `retired`.
   - Prepend a new `## v<N+1> — <YYYY-MM-DD> — LIVE` block with:
     - `**Changed:**` what's different from v<N> — be concrete, name the edit
     - `**Why:**` the observation that drove it, referencing the log date it came from
     - `**Result:**` `not tested yet` (a later `/result` backfills this)
     - The full prompt text in a four-backtick ` ````prompt ` fence, so prompts that
       themselves contain code blocks don't break the file.
4. **Never delete or rewrite an old version block.** The trail is the point.
5. **Cross-link:** add a one-line entry at the top of the project's `log.md`:
   `## <date> — prompt <slug> v<N+1> #thought [<device>]` with a one-line note.
6. **Commit and push:**
   `git add -A && git commit -m "prompt: <slug> v<N+1>" && git push origin HEAD:$(cat .claude/workspace-branch)`

Reply with the file path, the new version number, and what changed — three lines.
