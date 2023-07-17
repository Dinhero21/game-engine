import { type CommandHelper } from './helper'

export const COMMAND_PREFIX = '/'

export const COMMANDS = {
  '' (helper) {
    const manager = helper.manager
    const plugins = manager.plugins
    const chat = plugins.chat

    chat.emitMessage('Invalid Command!')
  },
  test (helper) {
    const manager = helper.manager
    const plugins = manager.plugins
    const chat = plugins.chat

    chat.emitMessage('Test Command!')
    chat.emitMessage('Check console for args')

    const args = helper.args
    console.log('Args:', ...args)
  },
  help (helper) {
    const manager = helper.manager
    const plugins = manager.plugins
    const chat = plugins.chat

    const commands = Object.keys(COMMANDS)

    chat.emitMessage(`Prefix: ${COMMAND_PREFIX}`)
    chat.emitMessage(`Commands: ${commands.join(', ')}`)
  },
  tp (helper) {
    const [x, y] = helper.args

    if (typeof x !== 'number') throw new TypeError('x must be a number')
    if (typeof y !== 'number') throw new TypeError('y must be a number')

    const sender = helper.sender

    sender.position.x = x
    sender.position.y = y

    sender.io.emit('player.physics.update', sender.getClientPlayer())
  }
} satisfies Record<string, (helper: CommandHelper) => void>
