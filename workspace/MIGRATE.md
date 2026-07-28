# Move this into your private repo (one manual step)

**Why this folder is here.** You asked for a private repo. I could not create it: the
GitHub App in this session doesn't have repository-creation permission (`403 Resource
not accessible by integration`). So the complete, tested workspace is staged here
inside `Maxik1818/docs` instead, on branch `claude/cross-device-project-storage-mq98q3`.

**⚠️ `Maxik1818/docs` is PUBLIC.** Everything in this folder is generic scaffolding —
no business content, no client names, no credentials — so nothing sensitive is exposed
today. **Don't start dictating real business thoughts until this lives in the private
repo.** Anything committed to a public repo stays in its history even after deletion.

**Also note:** the hooks and commands here are *inert* while the folder is nested
inside the docs repo — Claude Code reads `.claude/` from the repository root. They come
alive the moment this becomes a repo root, which is what the steps below do.

---

## Step 1 — create the empty private repo (you, 30 seconds)

On github.com (works fine on a phone):

1. **+** → **New repository**
2. Name: `workspace`
3. Visibility: **Private** ← the whole point
4. **Do not** add a README, .gitignore, or license — leave it completely empty
5. **Create repository**

## Step 2 — tell me, in a session on this repo

Say: **"the private workspace repo exists, move the workspace into it"**

I'll then run, essentially:

```bash
git clone https://github.com/Maxik1818/workspace.git ~/workspace
cp -r /path/to/docs/workspace/. ~/workspace/
cd ~/workspace
rm MIGRATE.md                      # this file has served its purpose
git add -A
git commit -m "workspace: thoughts, prompts, results, decisions"
git branch -M main
git push -u origin main
```

That's it — the folder is deliberately a **complete repo root**, so it's a straight
copy with nothing to rewire. `.claude/workspace-branch` already says `main`.

If a session can't reach the new repo, it needs attaching first — `add_repo` with
owner `Maxik1818`, repo `workspace`, access `push`.

## Step 3 — delete the public copy

Once the private repo has it, remove this staged copy so the public repo doesn't keep
a stale duplicate:

```bash
git rm -r workspace && git commit -m "workspace moved to private repo" && git push
```

(The public repo's git history will still contain the scaffolding. That's harmless —
it's templates and shell scripts, no personal content. This is exactly why the real
notes should wait for the private repo.)

## Step 4 — confirm it works from the phone

Open a fresh session on `Maxik1818/workspace` and check that turn one shows the sync
block and the project list **without you asking**. Then say
*"add a thought to smile flow: testing this works"* and confirm the reply names a file
you can then see in the GitHub app.

---

## What's already verified

Tested in a two-clone simulation (a stand-in "phone" and "PC" sharing one remote):

- Concurrent appends to the same `log.md` from both devices merge with **zero
  conflicts** and lose nothing — proven both by direct merge and by
  `pull --rebase` after real divergence.
- The `union` merge rules apply at every depth, including
  `projects/*/prompts/*.md`, while `README.md` correctly uses normal merge.
- The SessionStart hook exits `0` and emits valid JSON in every state: synced, dirty
  tree, branch with no remote, detached HEAD, offline, behind origin, and a genuine
  conflict (which it aborts cleanly, preserving the local commit and leaving no
  stash behind).
- The Stop hook blocks on uncommitted *and* unpushed work, stays silent when
  everything is saved, and does not loop.
