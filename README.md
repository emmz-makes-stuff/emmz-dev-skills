# emmz-dev-skills

A Claude Code plugin marketplace for OpenSpec-driven development. The lean successor to
[dmon-dev](https://github.com/daemonicai/dmon-dev): same OpenSpec backbone, none of the role machinery.

## What changed from dmon-dev

| dmon-dev (`dmons`) | emmz-dev-skills (`emmz`) |
|---|---|
| worker / reviewer / supervisor subagents | The main thread builds and self-reviews; no subagents |
| Guard + tripwire hooks | None |
| `/dmons:scaffold` + `/dmons:update-scaffold` + migrations | `/emmz:setup` — a Makefile and one `CLAUDE.md` section, re-runnable |
| `/dmons:implementation` skill + `# dmons-config` | The loop lives in `CLAUDE.md`, on top of `/opsx:apply` |
| One `DEVLOG.md` per change with a pinned `## NEXT` | A `devlog/` folder of append-only timestamped notes; the newest note's `## Next` is the resume point |

## Built for OpenSpec

The skills assume a repo with `openspec/` in it (run `openspec init` first) and hand off to the
`/opsx:*` commands. This marketplace does not install OpenSpec.

## Skills

| Skill | What it does |
|---|---|
| `/emmz:discovery` | Greenfield only: gathers requirements (what and why) with zero tech assumptions, then hands off to `opsx:explore`. |
| `/emmz:architecture` | Makes the tech decisions against those requirements, including the exact gate commands, then hands off to `opsx:propose`. |
| `/emmz:setup` | Writes a `Makefile` of gate targets (each prints `LABEL_EXIT:<n>`) and an `## OpenSpec workflow` section in `CLAUDE.md`. Migrates dmons-scaffolded repos. |
| `/emmz:devlog` | Writes a note to `openspec/changes/<name>/devlog/YYYYMMDD-HHMM-<slug>.md`. |

## Install

```
/plugin marketplace add emmz/emmz-dev-skills
/plugin install emmz@emmz-dev-skills
```

## Flow

```
/emmz:discovery → opsx:explore → /emmz:architecture → opsx:propose → /emmz:setup → /opsx:apply
```

An existing repo starts at `/emmz:setup`.

During `/opsx:apply`, the `CLAUDE.md` section drives each `## N.` section of `tasks.md` through the same
steps: implement → self-review the section diff against the spec → `make gates` → tick → devlog note →
one commit. The run stops and asks on ambiguity, scope changes, human-only verification, or gates that
won't go green.

## Devlog

```
openspec/changes/add-auth/devlog/
├── 20260926-2215-section-1-start.md
├── 20260926-2340-decision-token-store.md
└── 20260927-0910-section-1-done.md     ← newest; its "## Next" says where to resume
```

Notes are never edited after they are written; a correction goes in a new note.

## License

[MIT](LICENSE).
