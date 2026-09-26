---
name: devlog
description: Write a timestamped note to an OpenSpec change's devlog folder (openspec/changes/<name>/devlog/YYYYMMDD-HHMM-<slug>.md) — decisions and their reasons, questions, stops, section completions with gate exit lines — each ending with a "## Next" block so the newest note is always the resume point. Use when the user runs /devlog, when a decision or question comes up while building a change, when a section lands, when work stops, or when resuming a change cold ("where were we?").
---

# Devlog

`tasks.md` records *what* and *whether done*. The devlog records everything the checkbox can't hold:
why a path was chosen, what was rejected, what was asked and answered, what the gates said, and where to
pick up next.

It is a **folder of small notes**, one file per event, never edited after it is written:

```
openspec/changes/<change-name>/devlog/
├── 20260926-2215-section-1-start.md
├── 20260926-2340-decision-token-store.md
├── 20260927-0910-section-1-done.md
└── 20260927-1130-stopped-rate-limit-spec.md
```

Filenames sort chronologically, so **the last file is the current state** — its `## Next` is where work
resumes.

## Locating the change

1. If the user named a change, use `openspec/changes/<name>/`.
2. Otherwise `openspec list --json`: exactly one active change → use it; several → ask which; none → say
   so and stop.

## Reading (resuming)

```bash
ls openspec/changes/<name>/devlog/ | tail -n 5
```

Read the newest note in full and the few before it for context. Read further back only when a note
refers to something earlier. Its `## Next` is authoritative for what happens next, alongside the first
unticked task in `tasks.md`.

## Writing a note

1. **Name it.** `YYYYMMDD-HHMM-<slug>.md`, local time from `date +%Y%m%d-%H%M`. The slug is 2–5
   kebab-case words saying what the note is (`section-3-done`, `decision-retry-policy`,
   `stopped-auth-scope`). If that exact filename exists, append `-2` to the slug.
2. **Write it** with this shape:

   ```markdown
   # <Short title>

   <!-- Section: 3 · Tasks: 3.1–3.4 · Base: a1b2c3d -->   (whichever apply; omit the line otherwise)

   <The body — terse. What happened, what was decided and WHY, what was rejected,
   questions asked and answers given, gate exit lines quoted verbatim.>

   ## Next

   - <What happens next — the next task/section, or what is being waited on.>
   - <Open questions, deferred nits, anything a cold session must know.>
   ```

3. Tell the user in one line what was written.

Create the `devlog/` folder on first use.

## When to write one

- **Section start** (optional for small sections) — the base commit (`git rev-parse --short HEAD`) and
  the plan. The base is the scope for the section's self-review.
- **Decision** — any non-obvious choice: what, why, the alternatives rejected.
- **Question / answer** — a question put to the user, and later their answer as its own note.
- **Section done** — tasks completed, a one-line self-review verdict with anything found and fixed, the
  gate exit lines (`GATES_EXIT:0`). Written *before* the section commit so it lands in it.
- **Stopped** — exactly what blocked and the question pending. The state must be resumable from this
  note alone; the session may die before the answer arrives.
- **Change done** — the whole-change review outcome and anything parked for a later change.

## Rules

- **Append-only.** Never edit or delete a prior note. A correction is a new note that says what it
  corrects.
- **Always end with `## Next`.** A note without one breaks resumption.
- **Reasons, not just actions.** A decision without its why is a wasted note.
- **Terse.** Don't restate `tasks.md`; don't narrate routine work.
- **Quote gate exit lines**, never paraphrase a result as "tests pass".
- **Legacy `DEVLOG.md`.** A change that already has a single `DEVLOG.md` keeps it as history; write
  new notes to `devlog/` and never convert the old file.
