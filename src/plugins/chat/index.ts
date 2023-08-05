import type Player from '../../player'
import { COMMAND_PREFIX, COMMANDS } from './command'
import { CommandHelper, parseArgs } from './command/helper'
import Plugin from '../base'
import { type IServerSocket as ISocket } from '../../socket.io'

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

    try {
      f.call(this, helper)
    } catch (error) {
      const string = String(error)

      for (const line of string.split('\n')) {
        this.emitMessage(line)
      }
    }
  }
}

export default ChatPlugin
