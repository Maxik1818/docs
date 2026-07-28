---
description: Scaffold a new project folder
argument-hint: <project name>
---

Create a new project: $ARGUMENTS

1. **Slugify** the name: lowercase, kebab-case, 3 words maximum, no dates, no version
   numbers. "Smile Flow v2 2026" → `smile-flow`.
2. **Refuse to overwrite.** If `projects/<slug>/` already exists, stop and say so —
   suggest `/catchup <slug>` instead.
3. **Scaffold** from the templates:
   - `projects/<slug>/README.md` from `_templates/project-README.md`
   - `projects/<slug>/log.md` containing `# Log` and `Newest entry on top.`
   - `projects/<slug>/prompts/` (empty)
4. **Fill the README** by asking **at most three questions**, one message, numbered:
   - What is this and who's it for? (2 lines)
   - What does success look like? (up to 3 bullets)
   - What's the next action?
   If the user doesn't want to answer now, leave the placeholders and set
   `**Status:** just created — brief not written yet`.
5. **First log entry:** a `#session` entry recording that the project was created.
6. **Regenerate the index table** in `README.md` from
   `bash .claude/scripts/ws-status.sh --table`.
7. **Commit and push:**
   `git add -A && git commit -m "new project: <slug>" && git push origin HEAD:$(cat .claude/workspace-branch)`

Reply with the folder path and the three files created.
