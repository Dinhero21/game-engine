import { io } from './web'
import Player from '../player'
import Vec2 from '../public/engine/util/vec2'
import { type SocketId } from 'socket.io-adapter'

export const PLAYERS = new Map<SocketId, Player>()

io.on('connection', socket => {
  const player = new Player(socket, io)

  //                     Approximate position of where simplex noise breaks
  // player.position.x = 0b11000011001101101010101100100000000000000

  io.emit('player.add', player.getClientPlayer())

  for (const player of PLAYERS.values()) socket.emit('player.add', player.getClientPlayer())

  PLAYERS.set(socket.id, player)

  socket.on('disconnect', () => {
    PLAYERS.delete(socket.id)

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
})

export function getPlayer (id: SocketId): Player | undefined {
  return PLAYERS.get(id)
}
