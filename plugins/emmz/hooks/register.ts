import type { EngineInterface, Register, SessionContextUsage } from 'claude-code'

// One hooks module per plugin, so both of emmz's helpers live here:
// - clear-pickup: /clear-pickup and clear_and_pickup queue /clear, then /emmz:pickup
// - context-meter: context_usage reports the fill, with a nudge past each threshold

const COMMAND = 'clear-pickup'
const CLEAR_TOOL = 'clear_and_pickup'
const USAGE_TOOL = 'context_usage'
const PICKUP = 'emmz:pickup'
const THRESHOLDS = [40, 50] as const

// --- clear-pickup ---

// Re-entrancy guard: a second request while one is queued is a no-op.
let isQueued = false

// Queues /clear then /emmz:pickup from a timer, outside any hook the turn
// waits on (where $.command.run rejects). Both wait for the session to go
// idle; /clear keeps the process and this module, so the chain survives it.
const queue = ($: EngineInterface, args: string): boolean => {
  if (isQueued) return false
  isQueued = true
  $.clock.after(0, () => {
    void (async () => {
      try {
        await $.command.run({ command: 'clear' })
        await $.command.run({ command: PICKUP, args })
      } catch (err) {
        $.ui.toast(`${COMMAND}: ${err instanceof Error ? err.message : String(err)}`, {
          timeoutMs: 10000,
        })
      } finally {
        isQueued = false
      }
    })()
  })
  return true
}

// --- context-meter ---

const describe = (c: SessionContextUsage): string =>
  c.tokens === undefined
    ? `Context window: ${c.window.toLocaleString()} tokens; no fill reported yet.`
    : `Context window: ${c.tokens.toLocaleString()} / ${c.window.toLocaleString()} tokens (${c.percent ?? 0}%).`

// Registrations are per session; a /clear starts a new one, so redo them then.
const declare = async ($: EngineInterface) => {
  await $.command.register({
    name: COMMAND,
    description: `Run /clear, then /${PICKUP}`,
    argumentHint: '[change]',
  })
  await $.tool.register({
    name: CLEAR_TOOL,
    description:
      `Clears the conversation (/clear) and then runs /${PICKUP} to resume the OpenSpec change ` +
      'from its devlog. Both run once your current turn ends, so finish the turn right after ' +
      'calling this. Run /emmz:handoff first so the devlog holds the resume point.',
    inputSchema: {
      type: 'object',
      properties: {
        change: {
          type: 'string',
          description: `Optional change name passed to /${PICKUP}.`,
        },
      },
    },
    isDeferred: false,
  })
  await $.tool.register({
    name: USAGE_TOOL,
    description:
      'Reports how full your context window is: tokens used (as of the last API response), the window size, and the percentage used.',
    inputSchema: { type: 'object', properties: {} },
    isDeferred: false,
  })
}

export const register: Register = on => {
  // Highest threshold already announced; drops back when the fill does (after /compact or /clear).
  let announced = 0

  const nudge = (c: SessionContextUsage): string | undefined => {
    const percent = c.percent ?? 0
    const crossed = THRESHOLDS.filter(t => percent >= t).at(-1) ?? 0

    if (crossed < announced) {
      announced = crossed
    }

    if (crossed <= announced) {
      return undefined
    }

    announced = crossed

    return (
      `${describe(c)} Passed ${crossed}%: keep tool output lean. If you are building an OpenSpec change, ` +
      `finish the task in hand, then run /emmz:handoff and call ${CLEAR_TOOL}; otherwise consider ` +
      'whether to wrap up or compact.'
    )
  }

  on('session.start', async ($, e, next) => {
    await declare($)
    return next(e)
  })

  on('classic.SessionStart', async ($, e, next) => {
    if (e.source === 'clear') await declare($)
    return next(e)
  })

  on('command.run', { command: COMMAND }, ($, e) => ({
    text: queue($, e.args.trim())
      ? `Queued /clear, then /${PICKUP}${e.args.trim() ? ` ${e.args.trim()}` : ''}.`
      : 'Already queued.',
  }))

  on('tool.call', { tool: `mcp__emmz__${CLEAR_TOOL}` }, ($, e) => {
    const input = e as unknown as { change?: unknown }
    const change = typeof input.change === 'string' ? input.change.trim() : ''
    return {
      result: queue($, change)
        ? `Queued /clear, then /${PICKUP}${change ? ` ${change}` : ''}. End your turn now.`
        : 'Already queued; end your turn now.',
    }
  })

  on('tool.call', { tool: `mcp__emmz__${USAGE_TOOL}` }, async $ => {
    const { context } = await $.session.usage()

    const figures = { tokens: context.tokens ?? null, window: context.window, percent: context.percent ?? null }

    return { result: `${describe(context)}\n${JSON.stringify(figures)}` }
  }).catch(() => ({ deny: 'context-meter: could not read the context usage.' }))

  // Mid-turn: attach the nudge to whichever tool result first lands past a threshold.
  on('tool.call', async ($, e, next) => {
    const ran = await next(e)

    if (ran.deny !== undefined) {
      return ran
    }

    const note = nudge((await $.session.usage()).context)

    return note === undefined ? ran : { ...ran, context: [...(ran.context ?? []), note] }
  }).catch(($, e, next) => next(e))

  // Between turns: the engine measures after each main-thread turn.
  on('session.measure', async ($, e, next) => {
    const note = e.changed.includes('context') ? nudge(e.context) : undefined

    if (note !== undefined) {
      await $.session.append({ message: { type: 'user', content: [{ type: 'text', text: note }] } })
    }

    return next(e)
  })
}
