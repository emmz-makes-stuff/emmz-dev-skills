import type { Register, SessionContextUsage } from 'claude-code'

const TOOL = 'context_usage'
const THRESHOLDS = [40, 50] as const

const describe = (c: SessionContextUsage): string =>
  c.tokens === undefined
    ? `Context window: ${c.window.toLocaleString()} tokens; no fill reported yet.`
    : `Context window: ${c.tokens.toLocaleString()} / ${c.window.toLocaleString()} tokens (${c.percent ?? 0}%).`

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
      'finish the task in hand, then run /emmz:handoff and call clear_and_pickup; otherwise consider ' +
      'whether to wrap up or compact.'
    )
  }

  on('session.start', async ($, e, next) => {
    await $.tool.register({
      name: TOOL,
      description:
        'Reports how full your context window is: tokens used (as of the last API response), the window size, and the percentage used.',
      inputSchema: { type: 'object', properties: {} },
      isDeferred: false,
    })

    return next(e)
  })

  on('tool.call', { tool: `mcp__emmz__${TOOL}` }, async $ => {
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
