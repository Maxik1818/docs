#!/usr/bin/env bash
# Sync the workspace branch and surface the project index at session start.
# Hard rule: this must NEVER fail a session. Every path exits 0.
set -uo pipefail
export GIT_TERMINAL_PROMPT=0

cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0

out=""
add() { out+="$1"$'\n'; }

emit() {
  if command -v jq >/dev/null 2>&1; then
    printf '%s' "$out" | jq -Rs \
      '{hookSpecificOutput:{hookEventName:"SessionStart",additionalContext:.}}' 2>/dev/null \
      || printf '%s' "$out"
  else
    printf '%s' "$out"
  fi
  exit 0
}

# Not a git repo? Say so and get out of the way.
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  add "Workspace is not a git repo yet — nothing here is durable until it is."
  emit
fi

WSB=$(tr -d '[:space:]' < .claude/workspace-branch 2>/dev/null || true)
WSB=${WSB:-main}

# Which device is this? Used for the [phone]/[pc] tag on log entries.
if [ "${CLAUDE_CODE_REMOTE:-}" = "true" ]; then DEV="phone"; else DEV="pc"; fi

add "## Workspace sync — device tag [$DEV], durable branch '$WSB'"

cur=$(git branch --show-current 2>/dev/null || true)

if [ -z "$cur" ]; then
  add "- DETACHED HEAD. Do not write notes until a branch is checked out:  git checkout $WSB"
  add ""
  add "$(bash .claude/scripts/ws-status.sh 2>/dev/null)"
  emit
fi

# Every mutating git call below MUST discard stdout as well as stderr: on conflict,
# `git pull` prints to stdout, which would corrupt this hook's JSON output.
if ! timeout 20 git fetch --quiet origin >/dev/null 2>&1; then
  add "- OFFLINE (fetch failed). Working from the local clone only."
  add "  Do not force-push. Run 'git pull --rebase' before the first write once back online."
fi

# Get onto the durable branch when it's safe (clean tree only).
if [ "$cur" != "$WSB" ]; then
  if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
    add "- Still on '$cur' (uncommitted changes, not switching). Push notes with:"
    add "    git push origin HEAD:$WSB"
  elif timeout 20 git checkout -q "$WSB" >/dev/null 2>&1; then
    add "- Switched from '$cur' to '$WSB'."
    cur=$WSB
  elif git rev-parse --verify --quiet "origin/$WSB" >/dev/null 2>&1 \
       && timeout 20 git checkout -q -b "$WSB" --track "origin/$WSB" >/dev/null 2>&1; then
    add "- Created local '$WSB' tracking origin/$WSB."
    cur=$WSB
  else
    add "- Still on '$cur' ('$WSB' unavailable). Push notes with:  git push origin HEAD:$WSB"
  fi
fi

# Pull anything the other device pushed.
if git rev-parse --verify --quiet "origin/$cur" >/dev/null 2>&1; then
  behind=$(git rev-list --count "HEAD..origin/$cur" 2>/dev/null || echo 0)
  ahead=$(git rev-list --count "origin/$cur..HEAD" 2>/dev/null || echo 0)
  if [ "${behind:-0}" -gt 0 ]; then
    if timeout 60 git pull --rebase --autostash --quiet >/dev/null 2>&1; then
      add "- Pulled $behind commit(s) from origin/$cur — up to date with the other device."
    else
      git rebase --abort >/dev/null 2>&1 || true
      add "- CONFLICT pulling origin/$cur ($behind behind, $ahead ahead). Rebase aborted, nothing lost."
      add "  Resolve before writing:  git pull --rebase --autostash"
      add "  In log.md / inbox.md KEEP BOTH sides, newest date on top."
      add "  Then check nothing is stashed:  git stash list"
    fi
  else
    add "- Up to date with origin/$cur (${ahead:-0} unpushed)."
  fi
else
  add "- Branch '$cur' has no remote yet. First push:  git push -u origin $cur"
fi

add ""
add "$(bash .claude/scripts/ws-status.sh 2>/dev/null)"
add ""
add "Reminder: commit AND push after every capture — this container is disposable."

emit
