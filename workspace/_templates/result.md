# Result entry template

Prepend to the top of `log.md`. This is the record that makes improvement visible —
always include the previous number so the direction of travel is obvious.

```markdown
## YYYY-MM-DD — <what was tested> #result [<device>]

**Tested:** <the thing and its version, e.g. intake-agent prompt v3>
**How:** <20 live calls / 50 synthetic inputs / manual walkthrough>
**Numbers:** <metric: value>  (previous: <value>)
**Verdict:** better / worse / inconclusive
**Next:** <the one change to try next>
```

If the tested thing is a prompt version, also backfill that version's `**Result:**`
line in `prompts/<slug>.md`, so the prompt file carries its own scoreboard.
