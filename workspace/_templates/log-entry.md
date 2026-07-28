# Log entry template

Prepend to the top of `log.md`, directly under the `# Log` title.
Tag is one of: `#thought` `#session` `#result` `#decision` `#imported`.
Device is `[phone]` or `[pc]`.

```markdown
## YYYY-MM-DD — <short title> #<tag> [<device>]

> <raw dictation, verbatim — only when it was spoken>

<2-5 lines, cleaned up: what happened, or what I think.>

**Next:** <action, or "none">
```

## Decision variant

```markdown
## YYYY-MM-DD — decided: <the decision> #decision [<device>]

**Options:** <A> vs <B>
**Chose:** <A>, because <one clause>
**Cost of being wrong:** <low / medium / high> — <how to reverse it>
```

The first line of any `#decision` entry also gets mirrored as a one-liner into the
project README's `## Decisions` list, so the README stays scannable on a phone.
