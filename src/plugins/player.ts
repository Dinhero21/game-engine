import Plugin from './base'
import { type IServerSocket as ISocket } from '../socket.io'
import Player from '../player'
import Vec2 from '../public/engine/util/vec2'
import { type SocketId } from 'socket.io-adapter'

export class PlayerPlugin extends Plugin {
  protected readonly players = new Map<SocketId, Player>()

  public onConnection (socket: ISocket): void {
    const manager = this.manager
    const io = manager.io

    const players = this.players

    const player = new Player(socket, io)

    //                     Approximate position of where simplex noise breaks
    // player.position.x = 0b11000011001101101010101100100000000000000

    io.emit('player.add', player.getClientPlayer())

    for (const player of players.values()) socket.emit('player.add', player.getClientPlayer())

    players.set(socket.id, player)

    socket.on('disconnect', () => {
      players.delete(socket.id)

      io.emit('player.remove', player.getClientPlayer())

      player.removeAllListeners()
    })

    // ? Should this be here or in a Physics Plugin?

    socket.on('physics.update', (rawPosition, rawVelocity) => {
      const position = new Vec2(...rawPosition)
      const velocity = new Vec2(...rawVelocity)

      player.position = position
      player.velocity = velocity

      socket.broadcast.emit('player.physics.update', player.getClientPlayer())
    })
  }

  public getPlayer (id: SocketId): Player | undefined {
    return this.players.get(id)
  }
}

export default PlayerPlugin
