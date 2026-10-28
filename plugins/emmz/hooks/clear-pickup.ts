import type { EngineInterface, Register } from 'claude-code'

const COMMAND = 'clear-pickup'
const TOOL = 'clear_and_pickup'
const PICKUP = 'emmz:pickup'

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

// Registrations are per session; a /clear starts a new one, so redo them then.
const declare = async ($: EngineInterface) => {
  await $.command.register({
    name: COMMAND,
    description: `Run /clear, then /${PICKUP}`,
    argumentHint: '[change]',
  })
  await $.tool.register({
    name: TOOL,
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
}

export const register: Register = on => {
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

  on('tool.call', { tool: `mcp__emmz__${TOOL}` }, ($, e) => {
    const input = e as unknown as { change?: unknown }
    const change = typeof input.change === 'string' ? input.change.trim() : ''
    return {
      result: queue($, change)
        ? `Queued /clear, then /${PICKUP}${change ? ` ${change}` : ''}. End your turn now.`
        : 'Already queued; end your turn now.',
    }
  })
}
