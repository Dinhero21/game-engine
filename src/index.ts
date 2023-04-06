import type { Player as ClientPlayer, IServerServer as IServer } from './socket.io'
import { type TileType } from './world/tiles/index.js'
import { positionToTilePosition, tilePositionToChunkPosition, tilePositionToPosition } from './public/engine/util/tilemap/position-conversion.js'
import { World } from './world/world.js'
import Vec2, { vec2ToString } from './public/engine/util/vec2.js'
import Loop from './public/engine/util/loop.js'
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

const world = new World()

Loop.interval(1000 / 12)(() => { world.tick() })

io.on('connection', socket => {
  const player: ServerPlayer = {
    id: socket.id,
    position: tilePositionToPosition(new Vec2(0, -10)),
    velocity: new Vec2(0, 1000),
    chunks: new Set()
  }

  io.emit('player.add', getClientPlayer(player))

  for (const player of players) socket.emit('player.add', getClientPlayer(player))

  players.add(player)

  socket.on('physics.update', (rawPosition, rawVelocity) => {
    const position = new Vec2(...rawPosition)
    const velocity = new Vec2(...rawVelocity)

    player.position = position
    player.velocity = velocity

    socket.broadcast.emit('player.physics.update', getClientPlayer(player))

    const topLeftScreenPositionPosition = position.minus(HALF_SCREEN_SIZE)
    const bottomRightScreenPositionPosition = position.plus(HALF_SCREEN_SIZE)

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

        const tiles = chunk.getTiles()

        const rawTiles = new Map<string, string>()

        for (const [tileId, tile] of tiles) {
          rawTiles.set(tileId, tile.type)
        }

        socket.emit('chunk.set', Array.from(rawTiles), chunkPosition.toArray())

        player.chunks.add(chunkId)
      }
    }
  })

  socket.on('chunk.remove', rawPosition => {
    const position = new Vec2(...rawPosition)
    const chunkId = vec2ToString(position)

    player.chunks.delete(chunkId)
  })

  socket.on('tile.click', rawTilePosition => {
    const tilePosition = new Vec2(...rawTilePosition)

    world.setTile('sus', tilePosition, 'change', 'change')
  })

  socket.on('disconnect', () => {
    players.delete(player)

    io.emit('player.remove', getClientPlayer(player))
  })
})

world.on('tile.set', tile => {
  const type = tile.type as TileType
  const tilePosition = tile.getTilePosition()

  io.emit('tile.set', type, tilePosition.toArray())
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
