---
name: setup
description: Set up an OpenSpec repo for the emmz workflow — verify every dependency in docs/dependencies.md is installed and authenticated (offering to install what's missing), generate a root Makefile of gate targets plus a `make deps` check (each printing LABEL_EXIT:<n>), and add an "OpenSpec workflow" section to CLAUDE.md describing the section-by-section build loop, self-review, devlog notes, and when to stop and ask. No subagents, no hooks. Use when the user says "set up the workflow", "add the gates", "check my tools", "set up this repo for openspec", after /emmz:architecture, or after /emmz:migrate-from-dmons.
---

# Setup

Makes sure the machine can build the project, then writes two things tailored to the repo:

- **`Makefile`** — gate targets and a `deps` target, from `templates/Makefile.template`.
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
  If found, **stop** and tell the user to run `/emmz:migrate-from-dmons` first, then re-run setup.
- **An existing `## OpenSpec workflow` section** with an `emmz-setup` stamp → this is a re-run; you'll
  replace that section in place, keeping any hand edits the user wants kept — show the diff.
- **An existing `Makefile`** → merge: keep its other targets, add or update only the gate and `deps`
  targets. Never silently overwrite a target the user wrote.

## Step 3 — Dependencies

`docs/dependencies.md` is the list of every SDK, CLI, local service and login the project needs, written
by `/emmz:architecture` (format defined there).

1. **No file?** Build a draft from the repo — `global.json`, `.nvmrc`/`engines`, `rust-toolchain.toml`,
   `.python-version`, `pyproject.toml`, `package.json`, `docker-compose.yml`, CI workflows, the gate
   commands' own tools, `openspec`, and any CLI the repo's scripts call (`gh`, cloud CLIs). Show it and
   write it after a yes. Tell the user this file is normally the architecture step's job, so future
   changes keep it current there.
2. **Check every row:** run its Check, compare against Version, then run its Auth check. Report one
   table: ✅ ok, ❌ missing, ⚠️ wrong version, 🔒 not authenticated.
3. **Fix what's broken:**
   - **Missing or wrong version** → list the install commands and **offer to run them**. Run them only
     after a yes, one at a time, re-checking each. If an install fails in the sandbox, say so and hand it
     to the user.
   - **Not authenticated** → never attempt it yourself; logins are interactive. Give the user the exact
     command to run as `! <cmd>` (e.g. `! gh auth login`), then re-run the auth check when they say
     it's done.
4. Repeat until every row is ✅, or the user explicitly accepts a gap — then record the gap as a note in
   `docs/dependencies.md` under the table.

## Step 4 — Harvest the gate commands

In order of preference:

1. `design.md ## Decisions` in the changes (open, then archived) — the verbatim commands
   `/emmz:architecture` recorded.
2. The repo itself — `package.json` scripts, `*.sln`/`*.csproj`, `Cargo.toml`, `pyproject.toml`, CI
   workflow files.
3. Ask the user for anything still missing.

Every gate must be non-interactive and exit non-zero on failure; `format` must be a **check**, never a
rewrite. Omit `lint` if it isn't distinct from the formatter/build. Multi-stack: one prefixed block per
extra stack, all included in `gates`.

## Step 5 — Show, confirm, write

1. Show the full `Makefile` (or the merge diff) and the `CLAUDE.md` section. Wait for a yes.
2. Write them. Fill `{{PLUGIN_VERSION}}` from `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json`,
   `{{ADR_CLAUSE}}` as ` and the ADRs in docs/adrs/` if ADRs exist (else empty), and `{{HITL_EXAMPLES}}`
   with the kinds of task in this project only a human can verify (UI look-and-feel, a real device, a
   third-party account) — ask if unclear. `{{DEP_CHECKS}}` comes from `docs/dependencies.md`, one line
   per row.
3. Run `make deps`, then `make gates`, and report the exit lines. A failing gate here is information,
   not a reason to edit the recipe to make it pass — tell the user.
4. **Offer** (don't just do) to allowlist `Bash(make deps)`, `Bash(make build)`, `Bash(make test)`, …
   `Bash(make gates)` in the repo's `.claude/settings.json`, so the loop doesn't prompt.

## Next step

> Set up. Build a change with **`/opsx:apply`** — the workflow section in `CLAUDE.md` drives the loop,
> and **`/emmz:devlog`** records notes as you go.
