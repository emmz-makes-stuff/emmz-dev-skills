---
name: pickup
description: Resume work on an OpenSpec change from its devlog after a /clear or a fresh `claude` session. Find the change, read the newest devlog note and its "## Next", check it against tasks.md and git, run the repo's pre-flight, then carry on. Use when the user says "pickup", "pick up from the devlog", "resume", "carry on", "where were we?", or starts a session on a change/<name> branch with no other instruction.
---

# Pickup: resume a change from its devlog

The devlog's newest note is the resume point. It was written on the assumption that the context would be cleared
(by the section loop's hand-off, or by `/emmz:handoff`), so trust it over guesses. Still verify it against `tasks.md`
and git before acting.

## 1. Find the change

- If the current branch is `change/<name>` and `openspec/changes/<name>/` exists, use that change and say so in one line.
- Otherwise list the active changes (`openspec/changes/*`, excluding `archive/`), or run `make changes` if the Makefile
  has it. Ask which one to resume, even if there is only one.
- If the repo has no `openspec/changes/`, say so and stop. There is nothing to pick up from.

## 2. Read the newest devlog note

- Notes are `openspec/changes/<name>/devlog/YYYYMMDD-HHMM-<slug>.md`. The newest is the last one by file name, not by
  modification time.
- Read the whole note. Its `## Next` block is the resume point. The rest gives the context: decisions, the user's answers,
  gotchas, and deferred nits.
- **If the note is `stopped-…`**, the work is blocked on the user, and the section's work is usually left uncommitted
  on purpose.
  - Check whether the user's message answers the note's question, for example with pasted output from a human-run
    recipe.
  - If it does, continue from the note's "On PASS" / "On FAIL" branch.
  - If it doesn't, restate the question, and any copy-paste recipe, exactly as the note gives it, then wait. Never
    decide the question yourself.
- If there is no devlog folder, fall back to `tasks.md` and `git log`, and say that you did. A legacy `DEVLOG.md` is
  history only; read its `## NEXT` if there is no `devlog/` note yet.

## 3. Cross-check before acting

- **`tasks.md`:** find the first unticked task (`- [ ]`). It should be the one `## Next` names. If they disagree, say
  how. Prefer whatever the newer evidence supports (commits, files on disk), and ask if it is still unclear.
- **Git:**
  - Branch: it should be `change/<name>`.
  - `git status --short`: the tree should be clean, unless the newest note is a recorded stop or a handoff note that
    lists the uncommitted files.
  - `git log --oneline -5`: the last section commit should match the note.
- **Notes that mention commits, files or flags:** check that they still exist before relying on them.

## 4. Pre-flight

Follow the repo's own `CLAUDE.md` rules for starting or resuming a change. Typically:

- `make deps` gives `DEPS_EXIT:0`. If it doesn't, stop and offer to install what's missing. Hand any login to the user
  as `! <cmd>`.
- `make validate` gives `VALIDATE_EXIT:0`.
- Note the base commit (`git rev-parse --short HEAD`) for the section about to start.

Quote the exit lines; don't paraphrase them.

## 5. Load only what the next task needs

Read the parts of `proposal.md`, `design.md` and the delta specs that the next section touches, plus any files the
note points at. Don't reread the whole change, or every older devlog note, unless the newest one is unclear.

## 6. Report, then continue

Tell the user in a few lines:

- the change;
- what the newest note says was last done;
- the task you are about to start, or the question still pending.

Then continue straight into the repo's section loop (for example `/opsx:apply` plus the `CLAUDE.md` workflow): build,
self-review, gates, section-done devlog note, one commit, hand-off. Don't wait for confirmation unless a question is
pending or the resume point is ambiguous.
