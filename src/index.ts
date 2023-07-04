import type { IServerServer as IServer } from './socket.io'
import { positionToTilePosition, tilePositionToChunkPosition } from './public/engine/util/tilemap/position-conversion.js'
import { World } from './world/index.js'
import { Server } from 'socket.io'
import { WorldGen } from './world/gen/index.js'
import { sleep } from './public/engine/util/sleep.js'
import Vec2, { vec2ToString } from './public/engine/util/vec2.js'
import Player from './player.js'
import http from 'http'
import path from 'path'
import url from 'url'
import express from 'express'
import Tiles from './world/tiles/index.js'

// eslint-disable-next-line @typescript-eslint/naming-convention
const __filename = url.fileURLToPath(import.meta.url)

// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT ?? 8080

const SCREEN_SIZE = new Vec2(1920, 1080)

const HALF_SCREEN_SIZE = SCREEN_SIZE.divided(2)

const app = express()

app.use(express.static(path.join(__dirname, 'public')))

const server = http.createServer(app)

const io: IServer = new Server(server)

const players = new Set<Player>()

const gen = new WorldGen()
const world = new World(gen)

void (async () => {
  while (true) {
    const start = performance.now()

    world.tick()

    const end = performance.now()

    const duration = end - start

    const sleepTime = (1000 / 12) - duration

    if (sleepTime < 0) console.warn(`Tick took too long! ${(-sleepTime).toPrecision(3)}ms behind`)

    await sleep(sleepTime)
  }
})()

io.on('connection', socket => {
  const player: Player = new Player(socket.id)

  io.emit('player.add', player.getClientPlayer())

  for (const player of players) socket.emit('player.add', player.getClientPlayer())

  players.add(player)

  socket.on('slot.click', id => {
    const inventory = player.inventory

    const cursorType = inventory.getSlot(-1)?.getType() ?? null
    const slotType = inventory.getSlot(id)?.getType() ?? null

    inventory.setItem(id, cursorType)
    inventory.setItem(-1, slotType)
  })

  player.on('inventory.update', (id, after, before) => {
    socket.emit('slot.set', id, after)
  })

  socket.on('recipe.crafted', recipe => {
    const inventory = player.inventory
    const inputs = recipe.inputs

    for (const input of inputs) {
      for (let i = 0; i < input.amount; i++) {
        inventory.removeItem(input.type)
      }
    }

    const output = recipe.output

    for (let i = 0; i < output.amount; i++) {
      inventory.addItem(output.type)
    }
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

        const chunkTilePosition = chunk.getTilePosition()

        const tiles = chunk.getTiles()

        for (const [relativeX, row] of tiles.entries()) {
          for (const [relativeY, tile] of row.entries()) {
            const x = relativeX + chunkTilePosition.x
            const y = relativeY + chunkTilePosition.y

            socket.emit('tile.set', [x, y], tile.type)
          }
        }

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
      const newTileType = player.inventory.getSlot(-1)?.getType() ?? 'air'

      if (!(newTileType in Tiles)) return

      const newTile = Tiles[newTileType as keyof typeof Tiles]

      world.setTile(newTile.instance(), tilePosition, true, true)

      player.inventory.setItem(-1, null)

      return
    }

    if (player.inventory.addItem(tile.type)) world.setTile(Tiles.air.instance(), tilePosition, true, true)
  })

  socket.on('disconnect', () => {
    players.delete(player)

    io.emit('player.remove', player.getClientPlayer())

    player.removeAllListeners()
  })
})

world.on('tile.set', tile => {
  const tilePosition = tile.getTilePosition()

  io.emit('tile.set', tilePosition.toArray(), tile.type)
})

server.listen(PORT, () => {
  console.info(`Server listening on port ${PORT}`)
})
