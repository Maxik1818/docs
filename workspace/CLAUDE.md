# This repo is my project workspace

My work lives in `projects/<slug>/`. See `README.md` for the conventions.
Every project has exactly three things: `README.md` (where it stands), `log.md`
(what happened, newest on top), and `prompts/` (every prompt version, kept).

## Rules that matter

- **Capture, then push — immediately.** After writing anything here, `git add` +
  `git commit` + `git push`. A web session's container is disposable and can vanish
  without warning; unpushed work is lost.
- **Durable branch:** the branch named in `.claude/workspace-branch` (default `main`).
  If the session is on some other branch, push with
  `git push origin HEAD:$(cat .claude/workspace-branch)`.
- **Log entries go on TOP of `log.md`**, formatted as
  `## YYYY-MM-DD — <title> #<tag> [<device>]`. Tags: `#thought` `#session`
  `#result` `#decision` `#imported`. Device is `[phone]` for a web/remote session,
  `[pc]` for a local one.
- **Keep dictation verbatim.** When the user speaks a thought, quote it in a `>`
  block before summarizing. Paraphrasing loses the nuance they came for.
- **Prefer the slash commands** (`/drop`, `/catchup`, `/wrap`, `/newproject`,
  `/prompt`, `/result`) over improvising a file layout.
- **Never commit raw transcripts** (`~/.claude/projects/**/*.jsonl`) or secrets.
  Transcripts routinely contain API keys.
- Keep replies short. The user is usually reading on a phone.

## Merge behavior

`log.md`, `inbox.md`, and `prompts/*.md` use git's `union` merge driver, so two
devices appending at once never conflict — both entries survive. If entries land
out of date order at the top of a log, re-sort by date during `/wrap`.

`README.md` is *not* union. If it conflicts: take the side with the newer
`**Status:**`, combine both `## Decisions` lists, then re-derive `**Next:**` from
the top of `log.md`.
