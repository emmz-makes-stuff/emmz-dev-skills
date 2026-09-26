---
name: architecture
description: Turn captured requirements into technology decisions — platform, language(s), frameworks/libraries, datastore, hosting, tooling, and the exact build/test/format/lint gate commands — opinionated but evidence-backed, then hand off to opsx:propose. Use after discovery/opsx:explore: "decide the stack", "make the architecture decisions", "choose platform/language/framework", "start the proposal". Needs captured requirements and undecided tech; if there are none, run /emmz:discovery first.
---

# Architecture — deciding the how

Discovery gathered *what* while deciding nothing about *how*. Now make those deferred calls with the
user, each one argued from the requirements rather than picked by habit, then hand off to
`opsx:propose` to shape the change.

## Preconditions

1. `openspec/` exists. If not → `openspec init` first.
2. Requirements have been captured (discovery / `opsx:explore`). If not → `/emmz:discovery`.
3. The tech is still open (no populated `design.md ## Decisions` or ADRs covering it). If it's already
   decided → go straight to `opsx:propose` / `opsx:apply`.

## Stance

- **Recommend, don't list.** For each decision: credible options, trade-offs *against these
  requirements*, a clear recommendation, and the alternatives rejected.
- **Evidence over taste.** Verify checkable claims (a library's fit, a platform limit, maturity) rather
  than asserting them.
- **Push back once, then defer.** If the user leans a way you think is wrong, say so plainly with the
  risk. If they hold their position, record their decision with their rationale and your flagged
  trade-off.

## Procedure

1. **Gate** on the preconditions.
2. **Read the requirements.** Every recommendation must trace to an outcome, constraint, or scope line.
3. **Decide one call at a time:** platform, language(s), frameworks/libraries, datastore,
   hosting/deploy, core tooling. Don't over-decide; leave genuinely deferrable details for later.
4. **Settle the gate commands** (below).
5. **Record** (below).
6. **Hand off to `opsx:propose`** — the decisions become the change's binding constraints.

## Gate commands — no stack is decided until these are

`/emmz:setup` wraps them in a Makefile, but it can only wrap what you decided. For each stack pin down:

- the **exact** build, test, format and lint commands, including working directory or prefix
  (`npm --prefix web run build`, not "we'll use vite");
- that each runs **non-interactively** and **exits non-zero on failure**;
- that the formatter has a **check mode** (`dotnet format --verify-no-changes`, `prettier --check`);
- lint only where it is genuinely distinct from the formatter or build;
- for multi-stack projects, a short **stack name** per stack (`web`) used as the target prefix.

A toolchain that can't offer a clean non-interactive gate is evidence against it — raise it while the
decision is still open.

## Recording

- **`design.md ## Decisions`** — every decision: the choice, why, alternatives rejected. Include the gate
  commands verbatim, one line per stack per gate.
- **ADRs** for the foundational, hard-to-reverse calls only (platform, primary language, core framework,
  datastore, hosting model): `docs/adrs/ADR-NNNN-<slug>.md`, or the repo's existing convention. Don't
  write one per library.

## Next step

> Tech decided and the change proposed. Next: **`/emmz:setup`** to add the Makefile gates and the
> workflow section to `CLAUDE.md`, then **`/opsx:apply`** to build it.
