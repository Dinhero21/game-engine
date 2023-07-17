import type Player from '../player'
import Plugin from './base'
import { type PluginManager } from './manager'
import { type IServerSocket as ISocket } from '../socket.io'
import json5 from 'json5'

// TODO: Separate Command and Chat Logic

export function * parseArgs (data: string): Generator<any, void, unknown> {
  let buffer = ''

  while (data.length > 0) {
    try {
      yield json5.parse(data)

      data = buffer
      buffer = ''
    } catch (e) {
      const lastCharacter = data[data.length - 1]
      data = data.slice(0, -1)
      buffer = `${lastCharacter}${buffer}`
    }
  }
}

const COMMAND_PREFIX = '/'

const COMMANDS = {
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

export class CommandHelper {
  public readonly manager
  public readonly args
  public readonly sender

  constructor (manager: PluginManager, args: unknown[], sender: Player) {
    this.manager = manager
    this.args = args
    this.sender = sender
  }
}

export class ChatPlugin extends Plugin {
  public onConnection (socket: ISocket): void {
    const manager = this.manager
    const plugins = manager.plugins
    const playerPlugin = plugins.player
    const player = playerPlugin.getPlayer(socket.id)

    if (player === undefined) return

    socket.on('chat.message', message => {
      this.onChatMessage(message, player)
    })
  }

  public onChatMessage (message: string, sender: Player): void {
    if (message.startsWith(COMMAND_PREFIX)) {
      message = message.substring(COMMAND_PREFIX.length)

      let args = message.split(' ')

      const command = args.shift() ?? ''

      args = Array.from(parseArgs(args.join(' ')))

      this.onCommand(command, args, sender)

      return
    }

    this.emitMessage(`<${sender.name}> ${message}`)
  }

  public emitMessage (message: string): void {
    const manager = this.manager
    const io = manager.io

    io.emit('chat.message', message)
  }

  public onCommand (command: string, args: string[], sender: Player): void {
    if (!(command in COMMANDS)) command = ''

    const f = COMMANDS[command as (keyof typeof COMMANDS) | '']

    const helper = new CommandHelper(this.manager, args, sender)

    f.call(this, helper)
  }
}

export default ChatPlugin
