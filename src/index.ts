import type { IServerServer as IServer } from './socket.io'
import { type TileType } from './world/tiles/index.js'
import { positionToTilePosition, tilePositionToChunkPosition } from './public/engine/util/tilemap/position-conversion.js'
import { World } from './world/world.js'
import Vec2, { vec2ToString } from './public/engine/util/vec2.js'
import Player from './player.js'
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

const app = express()

app.use('/', express.static(path.join(__dirname, 'public')))

const server = http.createServer(app)

const io: IServer = new Server(server)

const players = new Set<Player>()

const world = new World()

Loop.interval(1000 / 12)(() => { world.tick() })

io.on('connection', socket => {
  const player: Player = new Player(socket.id)

  io.emit('player.add', player.getClientPlayer())

  for (const player of players) socket.emit('player.add', player.getClientPlayer())

  players.add(player)

  player.on('inventory.update', (slot, oldType, newType) => {
    const id = player.inventory.getSlotId(slot)

    socket.emit('slot.set', id, newType)
  })

  socket.on('physics.update', (rawPosition, rawVelocity) => {
    const position = new Vec2(...rawPosition)
    const velocity = new Vec2(...rawVelocity)

    player.position = position
    player.velocity = velocity

    socket.broadcast.emit('player.physics.update', player.getClientPlayer())

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

    const tile = world.getTile(tilePosition)

    if (tile === undefined) return

    if (tile.type === 'air') {
      world.setTile('sus', tilePosition, 'change', 'change')

      return
    }

    if (player.inventory.addItem(tile.type)) world.setTile('air', tilePosition, 'change', 'change')
  })

  socket.on('disconnect', () => {
    players.delete(player)

    io.emit('player.remove', player.getClientPlayer())

    player.removeAllListeners()
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
