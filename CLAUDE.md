## Project

Mintlify documentation site. Content is `.mdx` files at the repo root and in topic
directories (`api-reference/`, `quickstart/`, `examples/`, `sdk/`, ...); navigation,
theming, and redirects live in `mint.json`. `api.json` is the generated OpenAPI spec —
treat it as an artifact, not a hand-edited file.

## gstack (recommended)

This project uses [gstack](https://github.com/garrytan/gstack) for AI-assisted workflows.
Install it for the best experience:

```bash
git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && ./setup --team
```

`--team` installs a session hook that keeps gstack up to date automatically, so this
is a one-time step per machine.

Use `/browse` for all web browsing. Use `~/.claude/skills/gstack/...` for gstack file paths.

## Skill routing

**Plan** — `/office-hours` (interrogate the idea, write a design doc) · `/spec` (vague
intent → executable spec) · `/plan-ceo-review` · `/plan-eng-review` ·
`/plan-design-review` · `/plan-devex-review` · `/autoplan` (runs the four reviews in
sequence) · `/design-consultation`

**Build** — `/design-shotgun` (generate mockup variants) · `/design-html` (mockup →
production HTML/CSS)

**Review & QA** — `/review` (staff-engineer bug hunt) · `/investigate` (root-cause
analysis) · `/qa` (test and fix, with regression tests) · `/qa-only` (report, no edits) ·
`/design-review` · `/devex-review` · `/cso` (OWASP + STRIDE threat model) · `/codex`
(second opinion from OpenAI Codex CLI)

**Ship** — `/ship` (sync, test, push, open PR) · `/land-and-deploy` · `/canary`
(post-deploy monitoring) · `/benchmark` · `/health`

**Document** — `/document-release` (sync docs to shipped changes) · `/document-generate`
(write missing docs) · `/make-pdf` · `/diagram`

**Browser** — `/browse` (headless Chromium) · `/scrape` · `/open-gstack-browser` ·
`/setup-browser-cookies` · `/pair-agent`

**Safety** — `/careful` (warn before destructive commands) · `/freeze` (scope edits to
one directory) · `/guard` (both) · `/unfreeze`

**Meta** — `/learn` (persist learnings) · `/retro` (weekly retrospective) ·
`/context-save` / `/context-restore` · `/gstack-upgrade`

Full reference: `~/.claude/skills/gstack/llms.txt`
