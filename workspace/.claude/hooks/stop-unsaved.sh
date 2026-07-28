#!/usr/bin/env bash
# Refuse to end a session with unsaved workspace notes.
# The web container ships an equivalent global hook; a local PC does not.
set -uo pipefail

input=$(cat 2>/dev/null || true)

# Don't loop: if this hook already fired once for this stop, let it through.
if command -v jq >/dev/null 2>&1; then
  if [ "$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null)" = "true" ]; then
    exit 0
  fi
fi

cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

WSB=$(tr -d '[:space:]' < .claude/workspace-branch 2>/dev/null || true)
WSB=${WSB:-main}

dirty=$(git status --porcelain 2>/dev/null || true)
cur=$(git branch --show-current 2>/dev/null || true)

unpushed=0
if [ -n "$cur" ] && git rev-parse --verify --quiet "origin/$cur" >/dev/null 2>&1; then
  unpushed=$(git rev-list --count "origin/$cur..HEAD" 2>/dev/null || echo 0)
fi

if [ -z "$dirty" ] && [ "${unpushed:-0}" = "0" ]; then
  exit 0
fi

{
  echo "Workspace has unsaved work — it will be lost if this container is reclaimed."
  [ -n "$dirty" ] && { echo "Uncommitted:"; printf '%s\n' "$dirty"; }
  [ "${unpushed:-0}" != "0" ] && echo "Unpushed commits: $unpushed"
  echo "Run /wrap, or: git add -A && git commit -m '...' && git push origin HEAD:$WSB"
} >&2

exit 2
