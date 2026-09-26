---
name: discovery
description: Kick off a brand-new, empty OpenSpec project by gathering requirements — what and why — with zero assumptions about tech, then hand off to opsx:explore. Use at the very start of a greenfield repo: "start a new project", "kick off discovery", "gather initial requirements", "greenfield kickoff". Only for an OpenSpec-initialized repo with no changes (open or archived) and no real code; otherwise use opsx:explore directly.
---

# Discovery — the greenfield front door

An empty repo and an idea. Your job is to draw out the **requirements** — *what* the user wants and
*why* — while committing to **nothing** about *how* it gets built. When they hold together, hand them to
`opsx:explore`.

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

## Procedure

1. **Gate** on the preconditions.
2. **Frame it:** this session is about what and why; tech decisions come later.
3. **Interview** — adapt, don't interrogate:
   - the problem and who has it;
   - the core outcomes and the behaviours that deliver them;
   - scope: in, explicitly out, later;
   - hard constraints that are genuinely fixed (a mandate, compliance, a required integration);
   - what success looks like.
   Reflect answers back in the user's words. Name ambiguities and contradictions. A few sharp questions
   beat a long questionnaire.
4. **Hand off to `opsx:explore`** with the gathered requirements as the project's first exploration.

## Next step

> Requirements captured. Next: **`/emmz:architecture`** to decide the tech and propose the first change,
> then **`/emmz:setup`** to add the Makefile gates and workflow section to `CLAUDE.md`.
