import type { Player as ClientPlayer, ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData, Vec2 as RawVec2 } from './socket.io'
import { positionToTilePosition } from './public/engine/util/tilemap/position-conversion.js'
import Vec2, { vec2ToString } from './public/engine/util/vec2.js'
import { type Tile } from './public/engine/util/tilemap/chunk.js'
import http from 'http'
import path from 'path'
import url from 'url'
import express from 'express'
import { Server } from 'socket.io'

// eslint-disable-next-line @typescript-eslint/naming-convention
const __filename = url.fileURLToPath(import.meta.url)

// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = path.dirname(__filename)

const SCREEN_SIZE = (new Vec2(1920, 1080))

const HALF_SCREEN_SIZE = SCREEN_SIZE.divided(2)

const app = express()

app.use('/', express.static(path.join(__dirname, 'public')))

const server = http.createServer(app)

const io = new Server<
ClientToServerEvents,
ServerToClientEvents,
InterServerEvents,
SocketData
>(server)

const players = new Set<ServerPlayer>()

const tiles = new Map<string, Tile>()

interface ServerPlayer {
  id: string
  position: Vec2
  velocity: Vec2
  tiles: Set<string>
}

io.on('connection', socket => {
  const player: ServerPlayer = {
    id: socket.id,
    position: new Vec2(0, 0),
    velocity: new Vec2(0, 0),
    tiles: new Set()
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

    const addedTiles = new Map<Vec2, Tile>()

    for (let y = topLeftScreenTilePosition.y; y <= bottomRightScreenTilePosition.y; y++) {
      for (let x = topLeftScreenTilePosition.x; x <= bottomRightScreenTilePosition.x; x++) {
        const tilePosition = new Vec2(x, y)
        const tileId = vec2ToString(tilePosition)

        let tile = tiles.get(tileId)

        if (tile === undefined) {
          tile = { id: Date.now() / 10 }

          tiles.set(tileId, tile)
        }

        addedTiles.set(tilePosition, tile)
      }
    }

    for (const [tilePosition, tile] of addedTiles) {
      const tileId = vec2ToString(tilePosition)

      if (!player.tiles.has(tileId)) socket.emit('tile.set', tile, tilePosition.toArray())
      player.tiles.add(tileId)
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
