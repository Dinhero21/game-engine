import type Player from '../player'
import { getPlayer } from './player'
import { io } from './server'
import { type AsyncVoid, EventHandler } from '../util/events'

export interface ChatPluginEventMap {
  'message': (message: string, sender: Player, cancel: VoidFunction) => AsyncVoid
}

export class ChatPlugin extends EventHandler<ChatPluginEventMap> {
  constructor () {
    super()

    io.on('connection', socket => {
      const player = getPlayer(socket.id)

      if (player === undefined) return

      socket.on('chat.message', async message => {
        let cancelled = false

        function cancel (): void {
          cancelled = true
        }

        await this._emit('message', message, player, cancel)

        if (cancelled) return

        this.writeMessage(`<${player.name}> ${message}`)
      })
    })
  }

  public writeMessage (message: string): void {
    io.emit('chat.message', message)
  }
}

export default new ChatPlugin()
