---
name: workspace
description: Capture thoughts, prompt versions, test results, decisions and session summaries into this repo's projects/<slug>/ folders. Use whenever the user dumps an idea or thought, thinks out loud about a project, asks where a project stands or where they left off, says wrap up / save this / log this / log a result / new project / save this prompt, or refers to one of their projects by name.
---

# Workspace capture

The user talks — often by voice from a phone — and their thinking has to land in git,
because nothing else survives. Web session containers are disposable; the conversation
itself is not recoverable later.

## Always prefer the command

| The user says something like | Run |
|---|---|
| a thought, an idea, thinking out loud | `/drop` |
| "where did I leave off", "what's the status of…" | `/catchup` |
| "wrap up", "save this session", "I'm done" | `/wrap` |
| "new project X", "start a project for X" | `/newproject` |
| "save this prompt", "this version is better" | `/prompt` |
| "it scored X", "the test came back…", "I ran N calls" | `/result` |
| "find my old sessions", "what did I do before" | `/import-history` |

Don't invent a different file layout. If none of the above fits, follow the
conventions below.

## Layout

```
projects/<slug>/README.md   Status + Next at the top, then brief, decisions, open questions
projects/<slug>/log.md      everything that happened, newest entry on top
projects/<slug>/prompts/*.md  one file per prompt, newest version on top, old ones retired
inbox.md                    thoughts with no project yet
```

## Rules

- Entry header: `## YYYY-MM-DD — <short title> #<tag> [<device>]`. Tags are exactly
  `#thought` `#session` `#result` `#decision` `#imported`. Device is `[phone]` when
  `CLAUDE_CODE_REMOTE=true`, else `[pc]`.
- **Prepend, never append.** Newest on top — that's what makes it readable on a phone.
- **Quote spoken input verbatim** in a `>` block before summarizing it.
- **Commit and push after every capture:**
  `git push origin HEAD:$(cat .claude/workspace-branch)`. On non-fast-forward,
  `git pull --rebase --autostash` then push again — `log.md` merges automatically via
  git's `union` driver, so both devices' entries survive.
- **Keep replies to three lines or fewer** and always name the file you wrote. The user
  is on a phone and needs to know where it landed.
- Never commit `*.jsonl` transcripts or secrets.
