import type { Player as ClientPlayer, Vec2 as RawVec2, IServerServer as IServer } from './socket.io'
import { positionToTilePosition, tilePositionToChunkPosition } from './public/engine/util/tilemap/position-conversion.js'
import Vec2, { vec2ToString } from './public/engine/util/vec2.js'
import { WorldGenerator } from './world-generator.js'
import http from 'http'
import path from 'path'
import url from 'url'
import express from 'express'
import { Server } from 'socket.io'

// eslint-disable-next-line @typescript-eslint/naming-convention
const __filename = url.fileURLToPath(import.meta.url)

// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = path.dirname(__filename)

const SCREEN_SIZE = new Vec2(1920, 1080)

const HALF_SCREEN_SIZE = SCREEN_SIZE.divided(2)

interface ServerPlayer {
  id: string
  position: Vec2
  velocity: Vec2
  chunks: Set<string>
}

const app = express()

app.use('/', express.static(path.join(__dirname, 'public')))

const server = http.createServer(app)

const io: IServer = new Server(server)

const players = new Set<ServerPlayer>()

const world = new WorldGenerator()

io.on('connection', socket => {
  const player: ServerPlayer = {
    id: socket.id,
    position: new Vec2(0, 0),
    velocity: new Vec2(0, 0),
    chunks: new Set()
  }

  io.emit('player.add', getClientPlayer(player))

  for (const player of players) socket.emit('player.add', getClientPlayer(player))

  players.add(player)

  socket.on('physics.update', (position: RawVec2, velocity: RawVec2) => {
    const positionVec2 = new Vec2(position[0], position[1])
    const velocityVec2 = new Vec2(velocity[0], velocity[1])

    player.position = positionVec2
    player.velocity = velocityVec2

    socket.broadcast.emit('player.physics.update', getClientPlayer(player))

    const topLeftScreenPositionPosition = positionVec2.minus(HALF_SCREEN_SIZE)
    const bottomRightScreenPositionPosition = positionVec2.plus(HALF_SCREEN_SIZE)

    const topLeftScreenTilePosition = positionToTilePosition(topLeftScreenPositionPosition)
    const bottomRightScreenTilePosition = positionToTilePosition(bottomRightScreenPositionPosition)

    const topLeftScreenChunkPosition = tilePositionToChunkPosition(topLeftScreenTilePosition)
    const bottomRightScreenChunkPosition = tilePositionToChunkPosition(bottomRightScreenTilePosition)

    for (let chunkY = topLeftScreenChunkPosition.y; chunkY <= bottomRightScreenChunkPosition.y; chunkY++) {
      for (let chunkX = topLeftScreenChunkPosition.x; chunkX <= bottomRightScreenChunkPosition.x; chunkX++) {
        const chunkPosition = new Vec2(chunkX, chunkY)
        const chunkId = vec2ToString(chunkPosition)

        if (player.chunks.has(chunkId)) continue

        const chunk = world.getChunk(chunkPosition)

        socket.emit('chunk.set', Array.from(chunk), chunkPosition.toArray())

        player.chunks.add(chunkId)
      }
    }
  })

  socket.on('disconnect', () => {
    players.delete(player)

    io.emit('player.remove', getClientPlayer(player))
  })
})

server.listen(80, () => {
  console.info('Server listening on port 80')
})

function getClientPlayer (serverPlayer: ServerPlayer): ClientPlayer {
  return {
    id: serverPlayer.id,
    position: serverPlayer.position.toArray(),
    velocity: serverPlayer.velocity.toArray()
  }
}
