---
name: migrate-from-dmons
description: Migrate a repo scaffolded by the dmons plugin (dmon-dev) onto the emmz workflow — remove the worker/reviewer/supervisor agents, the dmons guard/tripwire hooks and their settings.json wiring, and dmons's workflow sections of CLAUDE.md, while moving the project-specific binding decisions and domain hazards the agents held into CLAUDE.md, and seeding a devlog/ note for each in-flight change from its DEVLOG.md. Use when the user says "migrate from dmons", "get rid of the dmons agents", "move this repo to emmz", or /emmz:setup finds dmons scaffolding. Run /emmz:setup afterwards.
---

# Migrate from dmons

Removes everything `/dmons:scaffold` and `/dmons:update-scaffold` put into a repo, keeping only what is
specific to the project. It does **not** write the emmz workflow — `/emmz:setup` does that next.

Nothing is removed until the user has seen the full plan and said yes.

## Step 1 — Detect

Look for each of these; any one means the repo is dmons-scaffolded. If none are present, say so and
point at `/emmz:setup`.

| What | Where |
|---|---|
| Agents | `.claude/agents/worker.md`, `.claude/agents/worker-*.md`, `.claude/agents/reviewer.md`, `.claude/agents/supervisor.md` — confirm each has a `<!-- dmons-scaffold:` stamp or dmons-style frontmatter (`disallowedTools`, a `hooks:` block naming `dmons-guard.sh`) before treating it as dmons's |
| Hook scripts | `.claude/hooks/dmons-guard.sh`, `.claude/hooks/dmons-tripwire.sh` |
| Hook wiring | `.claude/settings.json` → `hooks` entries whose command names `dmons-tripwire.sh` (`SubagentStart`, `SubagentStop`, `Stop`, `PostToolUse`) |
| Tripwire scratch | `.claude/.dmons-tripwire/` and its `.gitignore` line |
| CLAUDE.md | a heading whose text is `OpenSpec Workflow` at any level (`grep -nE '^#{1,4} +OpenSpec Workflow'`), a `<!-- dmons-scaffold:` stamp, a fenced `# dmons-config` block |
| Makefile | a `# dmons-scaffold:` stamp comment near the top |
| Plugin | `enabledPlugins` containing `dmons@dmon-dev`, or `extraKnownMarketplaces` naming `dmon-dev`, in `.claude/settings.json` |

Note the stamped version if there is one; pre-0.6 repos lay `CLAUDE.md` out differently (the loop is
spelled out inline as numbered sections), so match sections by content, not by expected position.

## Step 2 — Harvest

Collect what is specific to *this* project before anything is deleted:

- **From the agents:** binding decisions, domain hazards, stack-specific conventions, anything the audit
  filled in. Ignore the workflow boilerplate (roles, boundaries, handoffs, review lenses, DEVLOG
  etiquette, gate reporting) — the emmz workflow replaces all of it.
- **From `CLAUDE.md`:** the project header (the H1, the description, the OpenSpec line), and any section
  the user added themselves — anything not in the dmons template stays as it is.

De-duplicate: if a decision is already recorded in a `design.md ## Decisions` or an ADR, reference it
(`see docs/adrs/ADR-0003-…`) rather than copying it. The result goes in a **`## Project notes`** section
in `CLAUDE.md` with two sub-lists, *Binding decisions* and *Hazards*, each item one or two lines.

## Step 3 — Plan and confirm

Show the user, in one message:

1. The files to delete.
2. The exact `.claude/settings.json` entries to remove (the dmons hook entries and plugin/marketplace
   entries only — keep permission rules, including `make` allowlists, and everything else).
3. The new `CLAUDE.md` in full: project header, `## Project notes`, and any user-written sections — every
   dmons workflow section removed (`The DEVLOG`, `Commands`, `Boundaries`, `OpenSpec Workflow`, `Roles`,
   `The implementation phase`, `Stop and ask`, `Workflow configuration`, and pre-0.6 equivalents).
   Replace any remaining `/dmons:*` or `/devlog` references with their emmz equivalents
   (`/emmz:discovery`, `/emmz:architecture`, `/emmz:devlog`) or remove them.
4. The Makefile change — only its dmons stamp line is removed; targets stay for `/emmz:setup` to merge.
5. The devlog notes to seed (Step 4).

Wait for a yes. Apply edits to `.claude/settings.json` with a merge, never a rewrite, and validate the
result with `jq`.

## Step 4 — Seed devlog notes for in-flight changes

For each active change (not under `archive/`) that has a `DEVLOG.md`:

- Leave `DEVLOG.md` exactly as it is — it is history.
- Write `openspec/changes/<name>/devlog/YYYYMMDD-HHMM-migrated-from-dmons.md` in the `/emmz:devlog`
  format: which sections have landed (with their commits from `git log`), any `STOPPED` post still
  unresolved, and under `## Next` the carried-forward contents of the DEVLOG's `## NEXT` — up next, open
  questions, deferred nits.

## Step 5 — Commit

Show `git status --short` and a one-line summary per file, then — after a yes — commit on the current
branch:

```
chore: migrate from dmons to emmz

- remove worker/reviewer/supervisor agents and dmons hooks
- move binding decisions and hazards into CLAUDE.md
- seed devlog notes for in-flight changes
```

## Step 6 — Hand off

> dmons removed. Next: **`/emmz:setup`** to verify dependencies, merge the Makefile, and add the
> `## OpenSpec workflow` section to `CLAUDE.md`.
>
> If the dmons plugin is installed at user level, remove it yourself with
> `/plugin uninstall dmons@dmon-dev`.
