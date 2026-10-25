---
name: discovery
description: Kick off a brand-new, empty OpenSpec project by gathering requirements — what and why — with zero assumptions about tech, documenting everything in docs/DISCOVERY.md, then hand off to opsx:explore. Use at the very start of a greenfield repo: "start a new project", "kick off discovery", "gather initial requirements", "greenfield kickoff". Only for an OpenSpec-initialized repo with no changes (open or archived) and no real code; otherwise use opsx:explore directly.
---

# Discovery — the greenfield front door

An empty repo and an idea. Your job is to draw out the **requirements** — *what* the user wants and
*why* — while committing to **nothing** about *how* it gets built — and write them all down in
`docs/DISCOVERY.md`. When they hold together, hand them to `opsx:explore`.

## Preconditions — clean slate only

Check each (plain `ls`/`test`/`openspec list`). On any failure, stop and redirect.

1. `openspec/` exists. If not → the user runs `openspec init` first.
2. No directories in `openspec/changes/` other than `archive/`, and `archive/` is absent or empty. If
   there is history → use `opsx:explore`.
3. No substantial source code. If there is, the tech direction is already set → use `opsx:explore`.

## The hard rule — assume nothing about the how

No stack, language, platform, hosting, framework, library, database or tooling — not the house default,
not the last project's, not a "we could use…". If the user mentions one, confirm whether it is a genuine
constraint and record it as such. Everything else stays open for `/emmz:architecture`.

## The record — `docs/DISCOVERY.md`

Document **everything** the interview turns up in `docs/DISCOVERY.md`. It is the requirements' source of
truth: `/emmz:architecture` reads it, so anything that lives only in the conversation is lost. Write it
as you go, not at the end — create it once the session is framed, and update it each time a topic
settles. Use the user's words, and these sections:

- **Problem & users** — the problem, who has it, and why it matters now.
- **Outcomes & behaviours** — the core outcomes and the behaviours that deliver them.
- **Scope** — in, explicitly out, later.
- **Hard constraints** — only the genuinely fixed ones, each with its source (mandate, compliance,
  required integration).
- **Success criteria** — how we'll know it worked.
- **Open questions & ambiguities** — anything unresolved or contradictory, named plainly.

No tech choices go in it, except constraints confirmed as fixed.

## Procedure

1. **Gate** on the preconditions.
2. **Frame it:** this session is about what and why; tech decisions come later. Create
   `docs/DISCOVERY.md` with the section headings.
3. **Interview** — adapt, don't interrogate — recording each answer in `docs/DISCOVERY.md` as it
   settles:
   - the problem and who has it;
   - the core outcomes and the behaviours that deliver them;
   - scope: in, explicitly out, later;
   - hard constraints that are genuinely fixed (a mandate, compliance, a required integration);
   - what success looks like.
   Reflect answers back in the user's words. Name ambiguities and contradictions. A few sharp questions
   beat a long questionnaire.
4. **Finalise `docs/DISCOVERY.md`:** read it back to the user, fix anything they correct, and leave
   unresolved points under *Open questions & ambiguities*.
5. **Hand off to `opsx:explore`** with `docs/DISCOVERY.md` as the project's first exploration.

## Next step

> Requirements captured in `docs/DISCOVERY.md`. Next: **`/emmz:architecture`** to decide the tech and propose the first change,
> then **`/emmz:setup`** to add the Makefile gates and workflow section to `CLAUDE.md`.
