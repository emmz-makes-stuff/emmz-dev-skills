---
name: handoff
description: Run just before /clear, /compact, or quitting `claude`. Checks that an OpenSpec change can be resumed cold by /emmz:pickup — the newest devlog note's "## Next" is the real resume point, tasks.md matches what landed, nothing that only lives in this conversation is lost, and uncommitted, unpushed or background work is accounted for — writes a handoff devlog note if anything is missing, then says plainly whether it is safe to exit. Use when the user runs /handoff, says they're wrapping up, clearing context, ending the session or starting fresh, and at the section loop's hand-off step.
---

# Handoff: make the next session's pickup work

`/emmz:pickup` trusts the newest devlog note. This skill makes sure that trust is deserved. The test for every
check: **could a fresh session, with none of this conversation, pick this up correctly from the repo alone?**

Fix gaps by writing to the repo (a devlog note, a tick), not by explaining them to the user. Anything that is
only in the conversation is lost the moment the context goes.

## 1. Orient

```bash
git branch --show-current
git status --short
git log --oneline -5
git rev-list --count @{upstream}..HEAD 2>/dev/null   # unpushed commits; fails if no upstream
ls openspec/changes/ 2>/dev/null | grep -v '^archive$'
```

- Find the change as `/emmz:pickup` does: the `change/<name>` branch, else the one this session worked on, else
  ask. With several in flight, check each one this session touched.
- No `openspec/changes/` and a clean tree: say there is nothing to hand off, and that it is safe to exit. Stop.
- No active change but a dirty tree: skip to step 4 and report the uncommitted files.

## 2. Read the resume point as pickup will

- The newest note in `openspec/changes/<name>/devlog/` by file name. Read it in full.
- The first unticked task in `tasks.md`.

## 3. Check it

**`## Next` is current.** This is the most important check. It must name the real next step: the next section
and its first task, the whole-change review, `/opsx:archive`, or the question being waited on. It must not point
at something this session already finished.

**Nothing lives only in the conversation.** Go back over the session for:

- decisions made and their reasons, especially where the obvious choice was rejected;
- the user's answers to questions, and rulings they gave;
- gotchas hit (tool quirks, failing commands and the fix, a test that passed for the wrong reason);
- deferred nits and anything parked for later;
- the state of a part-built section: which tasks are done, which are half-done, and what remains.

If any of these is missing from the devlog, it goes in a note.

**`tasks.md` matches what landed.** Ticked tasks should be in commits; finished work should be ticked. Report
drift. Tick only what you can show has landed, and never tick work in a section that is stopped.

**Working tree.**

- Clean: good.
- Dirty after a recorded `stopped-…` note: expected. Check the note names the exact task and the question.
- Dirty otherwise: a part-built section. Don't commit it to tidy up, and don't revert it. The section loop
  commits a section once, when it's done. Record the files and their state in the handoff note.

**Other loose ends.**

- Unpushed commits: report the branch and count. Don't push unless the user asks.
- Background tasks, shells or monitors this session started: a fresh session can't reach them. Name each one, and
  say what it was doing and where its output goes. Stop it, or record it in the note, with the user's say-so.
- Section-done note missing its gate exit lines, or the section's base commit: add them to the handoff note if this
  session knows them.

## 4. Write the handoff note, if needed

Only if step 3 found something the repo doesn't hold. Use `/emmz:devlog`'s format, with the slug `handoff` (or
`handoff-section-N`). Never edit an earlier note; this one supersedes its `## Next`.

```markdown
# Handoff: <one line on where things stand>

<!-- Section: N · Tasks: N.1–N.3 · Base: a1b2c3d -->

<What this session did since the last note, what it decided and why, answers given,
gotchas, uncommitted files and their state, background work. Terse.>

## Next

- <The real resume point.>
- <Open questions, deferred nits, anything a cold session must know.>
```

If the newest note already covers everything, don't write one. A redundant note is noise.

## 5. Report

```
## Handoff

Change:   <name> on <branch>
Resume:   <the ## Next a fresh session will read: first line>
Note:     <written: devlog/<file>  |  newest note already current>
Tasks:    N/M ticked <, drift: …>
Tree:     <clean | uncommitted: … (recorded in <note>)>
Pushed:   <yes | N commits unpushed on <branch>>
Running:  <nothing | …>

✅ Safe to /clear. Next session: /emmz:pickup
```

Or end with `⚠️ Not safe to exit yet: <what's outstanding>`. Say it plainly when it isn't safe: for example a
running background task with unrecorded output, a question the user hasn't answered that isn't in a note yet, or
a gap you couldn't close.
