#!/usr/bin/env bash
# Single source of truth for the project index.
# Used by the SessionStart hook (plain) and by /wrap (--table, for README.md).
set -uo pipefail

cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0

mode=${1:-}

if [ ! -d projects ]; then
  [ "$mode" = "--table" ] || echo "No projects yet — say \"new project <name>\" to create the first one."
  exit 0
fi

if [ "$mode" = "--table" ]; then
  echo "| Project | Status | Next | Last touched |"
  echo "|---|---|---|---|"
else
  echo "## Projects"
fi

found=0
for d in projects/*/; do
  [ -d "$d" ] || continue
  n=$(basename "$d")
  case "$n" in _*) continue ;; esac
  found=1

  st=$(grep -m1 '^\*\*Status:\*\*' "$d/README.md" 2>/dev/null | sed 's/^\*\*Status:\*\* *//')
  nx=$(grep -m1 '^\*\*Next:\*\*' "$d/README.md" 2>/dev/null | sed 's/^\*\*Next:\*\* *//')
  lt=$(grep -m1 '^## [0-9]' "$d/log.md" 2>/dev/null | sed 's/^## \([0-9][0-9-]*\).*/\1/')

  if [ "$mode" = "--table" ]; then
    # Escape pipes so a Next containing "|" can't break the table.
    st=${st//|/\\|}; nx=${nx//|/\\|}
    echo "| [$n](projects/$n/README.md) | ${st:-?} | ${nx:-?} | ${lt:-?} |"
  else
    echo "- $n — ${st:-no status} | next: ${nx:-?} | last touched: ${lt:-never}"
  fi
done

if [ "$found" = 0 ] && [ "$mode" != "--table" ]; then
  echo "- (none yet)"
fi

if [ "$mode" != "--table" ] && [ -f inbox.md ]; then
  c=$(grep -c '^## ' inbox.md 2>/dev/null || true)
  [ -n "${c:-}" ] && [ "$c" != "0" ] && echo "- inbox: $c unfiled item(s)"
fi

exit 0
