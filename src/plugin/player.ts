import { io } from './web'
import world from './world'
import Vec2 from '../public/engine/util/vec2'
import { PlayerConstructor, type IPlayer } from '../world/entity'
import { type SocketId } from 'socket.io-adapter'

export const PLAYERS = new Map<SocketId, IPlayer>()

io.on('connection', socket => {
  const player = new PlayerConstructor(world, socket)

  PLAYERS.set(socket.id, player)

  world.addEntity(player)

  socket.on('disconnect', () => {
    PLAYERS.delete(socket.id)

    world.removeEntity(player)

    player.removeAllListeners()
  })

  // ? Should this be here or in a Physics Plugin?

  socket.on('physics.update', (rawPosition, rawVelocity, rawAcceleration) => {
    if (player.isTeleporting) return

    const position = Vec2.fromArray(rawPosition)
    const velocity = Vec2.fromArray(rawVelocity)
    const acceleration = Vec2.fromArray(rawAcceleration)

    player.position = position
    player.velocity = velocity
    player.acceleration = acceleration

    player.queueSync()
  })
})

export function getPlayer (id: SocketId): IPlayer | undefined {
  return PLAYERS.get(id)
}
