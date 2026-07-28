---
description: Mine this machine's past Claude Code transcripts into the project logs
argument-hint: [project-slug | --inventory]
---

Recover past session history from this machine's local transcripts: $ARGUMENTS

**Run this from a PC session.** Only the machine that ran a session has its transcript.
Past *web/phone* session transcripts died with their containers and cannot be recovered.

Needs read access to `~/.claude/projects`. If it's denied, add to
`.claude/settings.local.json` (machine-specific, gitignored, never committed):
```json
{ "permissions": { "additionalDirectories": ["~/.claude/projects"],
                   "allow": ["Read(~/.claude/projects/**)"] } }
```

## Phase 1 — inventory (cheap, always do this first)

Transcripts live in `~/.claude/projects/<escaped-cwd>/*.jsonl`, where the escaped cwd
replaces every non-alphanumeric character with `-` (so `/home/user/docs` →
`-home-user-docs`). `ls ~/.claude/projects/` to see every working directory that has
history — **each one needs its own pass.**

One line per session, without loading the transcripts into context:

```bash
for f in ~/.claude/projects/*/*.jsonl; do
  jq -rs --arg f "$f" '
    [.[] | select(.type=="user" or .type=="assistant")] as $m |
    ($m | map(select(.type=="user")) | .[0].message.content) as $c |
    "\($f)\t\($m[0].timestamp // "?")\t\($m[-1].timestamp // "?")\t\($m|length) msgs\t\(
      (if ($c|type)=="string" then $c
       else ([$c[]? | select(.type=="text") | .text] | join(" ")) end) // ""
      | .[0:180] | gsub("\n";" "))"
  ' "$f" 2>/dev/null
done
```

Group the sessions into candidate projects and **show the user the proposed mapping.
Do not write anything until they confirm it.** Mapping old sessions to projects is a
guess, and it will be imperfect.

## Phase 2 — distill, one session at a time

Text-only digest — drops `thinking` blocks and the huge `tool_result` payloads,
collapses tool calls to their names:

```bash
jq -r '
  select(.type=="user" or .type=="assistant")
  | .timestamp as $t
  | (if (.message.content|type)=="string" then .message.content
     else [ .message.content[]?
            | if .type=="text" then .text
              elif .type=="tool_use" then "[tool:" + .name + "]"
              else empty end ] | join("\n") end) as $c
  | select(($c|length) > 0)
  | "[" + ($t|.[0:16]) + "] " + (.type|ascii_upcase) + ": " + ($c[0:1200])
' "$SESSION_FILE" | head -c 120000
```

For each confirmed session write **one `#imported` entry** into
`projects/<slug>/log.md` — not one per message. Process **oldest session first**, so
prepending yields correct newest-on-top order. Each entry:

```
## <session's date> — <what this session was about> #imported [pc]

**Covered:** <what was worked on>
**Concluded:** <decisions, findings, working solutions>
**Left open:** <what was unfinished>

_source: transcript <session-uuid>, imported <today>_
```

Any prompt text found in a transcript goes into `projects/<slug>/prompts/<slug>.md`
as `retired` versions, oldest first, dated from the transcript.

Commit every ~5 sessions so a crash loses nothing.

## Tell the user these limits up front

- Past **web/phone** sessions are gone. This recovers PC history only.
- Other working directories have separate history folders — each needs its own pass.
- **Tool results are dropped.** You recover the conversation, not the evidence: file
  contents and command output aren't in the digest.
- Sessions that were already compacted have lost detail irrecoverably.
- **Never commit the raw `.jsonl`** — transcripts routinely contain API keys. Only
  distilled prose goes into the repo. (`*.jsonl` is gitignored for this reason.)
- This is one-time archaeology. From here on, `/wrap` is what makes history durable.
