---
name: setup
description: Set up an OpenSpec repo for the emmz workflow — generate a root Makefile of gate targets (each printing LABEL_EXIT:<n>) and add an "OpenSpec workflow" section to CLAUDE.md describing the section-by-section build loop, self-review, devlog notes, and when to stop and ask. No subagents, no hooks. Also migrates a repo scaffolded by dmons (removes its agents, hooks, and CLAUDE.md sections). Use when the user says "set up the workflow", "add the gates", "set up this repo for openspec", "migrate off dmons", or after /emmz:architecture.
---

# Setup

Writes two things, both tailored to the repo:

- **`Makefile`** — gate targets from `templates/Makefile.template`.
- **An `## OpenSpec workflow` section in `CLAUDE.md`** — from `templates/CLAUDE-section.md.template`.

Templates are at `${CLAUDE_PLUGIN_ROOT}/skills/setup/templates/`. Fill every `{{PLACEHOLDER}}` and delete
every guidance comment (`#!!` lines in the Makefile; HTML comments in the markdown except the
`emmz-setup` stamp).

## Step 1 — Preconditions

- `openspec/` exists. If not → the user runs `openspec init` first.
- Ideally at least one change (open or archived) carries decisions. If there is none and no code, suggest
  `/emmz:discovery` → `/emmz:architecture` first; continue only if the user wants to.

## Step 2 — Detect what's already there

- **dmons scaffolding** — any of `.claude/agents/{worker*,reviewer,supervisor}.md`,
  `.claude/hooks/dmons-*.sh`, a `# dmons-config` block or `<!-- dmons-scaffold:` stamp in `CLAUDE.md`.
  If found, list exactly what you'd remove (the agent files, the hook scripts and their entries in
  `.claude/settings.json`, and the dmons workflow sections of `CLAUDE.md`) and **ask before removing**.
  Keep the project-specific content worth keeping (project header, hazards, binding decisions) in
  `CLAUDE.md`. Existing `DEVLOG.md` files stay as history.
- **An existing `## OpenSpec workflow` section** with an `emmz-setup` stamp → this is a re-run; you'll
  replace that section in place, keeping any hand edits the user wants kept — show the diff.
- **An existing `Makefile`** → merge: keep its other targets, add or update only the gate targets. Never
  silently overwrite a target the user wrote.

## Step 3 — Harvest the gate commands

In order of preference:

1. `design.md ## Decisions` in the changes (open, then archived) — the verbatim commands
   `/emmz:architecture` recorded.
2. The repo itself — `package.json` scripts, `*.sln`/`*.csproj`, `Cargo.toml`, `pyproject.toml`, CI
   workflow files.
3. Ask the user for anything still missing.

Every gate must be non-interactive and exit non-zero on failure; `format` must be a **check**, never a
rewrite. Omit `lint` if it isn't distinct from the formatter/build. Multi-stack: one prefixed block per
extra stack, all included in `gates`.

## Step 4 — Show, confirm, write

1. Show the full `Makefile` (or the merge diff) and the `CLAUDE.md` section. Wait for a yes.
2. Write them. Fill `{{PLUGIN_VERSION}}` from `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json`,
   `{{ADR_CLAUSE}}` as ` and the ADRs in docs/adrs/` if ADRs exist (else empty), and `{{HITL_EXAMPLES}}`
   with the kinds of task in this project only a human can verify (UI look-and-feel, a real device, a
   third-party account) — ask if unclear.
3. Run `make gates` once and report the exit lines. A failing gate here is information, not a reason to
   edit the recipe to make it pass — tell the user.
4. **Offer** (don't just do) to allowlist `Bash(make build)`, `Bash(make test)`, … `Bash(make gates)`
   in the repo's `.claude/settings.json`, so the loop's gates don't prompt.

## Next step

> Set up. Build a change with **`/opsx:apply`** — the workflow section in `CLAUDE.md` drives the loop,
> and **`/emmz:devlog`** records notes as you go.
