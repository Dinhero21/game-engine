import { io } from './server'
import { getPlayer } from './player'
import { World } from '../world'
import { WorldGen } from '../world/gen'
import { sleep } from '../public/engine/util/sleep'
import Vec2 from '../public/engine/util/vec2'
import { CHUNK_SIZE, positionToTilePosition, tilePositionToChunkPosition } from '../public/engine/util/tilemap/position-conversion'
import Tiles from '../world/tile'

const VIEWPORT_SIZE = new Vec2(1920, 1080)
const HALF_VIEWPORT_SIZE = VIEWPORT_SIZE.divided(2)

const gen = new WorldGen()

const world = new World(gen)

world.on('tile.set', tile => {
  const tilePosition = tile.getTilePosition()

  io.emit('tile.set', tilePosition.toArray(), tile.type, tile.getMeta())
})

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
  const player = getPlayer(socket.id)

  if (player === undefined) return

  const lastTopLeftViewportChunkPosition = new Vec2(NaN, NaN)
  const lastBottomRightViewportChunkPosition = new Vec2(NaN, NaN)

  socket.on('physics.update', rawPosition => {
    const position = new Vec2(...rawPosition)

    const topLeftViewportPosition = position.minus(HALF_VIEWPORT_SIZE)
    const bottomRightViewportPosition = position.plus(HALF_VIEWPORT_SIZE)

    const topLeftViewportTilePosition = positionToTilePosition(topLeftViewportPosition)
    const bottomRightViewportTilePosition = positionToTilePosition(bottomRightViewportPosition)

    const topLeftViewportChunkPosition = tilePositionToChunkPosition(topLeftViewportTilePosition)
    const bottomRightViewportChunkPosition = tilePositionToChunkPosition(bottomRightViewportTilePosition)

    const topLeftViewportChunkPositionChanged = topLeftViewportChunkPosition.x !== lastTopLeftViewportChunkPosition.x || topLeftViewportChunkPosition.y !== lastTopLeftViewportChunkPosition.y
    const bottomRightViewportChunkPositionChanged = bottomRightViewportChunkPosition.x !== lastBottomRightViewportChunkPosition.x || bottomRightViewportChunkPosition.y !== lastBottomRightViewportChunkPosition.y

    if (!topLeftViewportChunkPositionChanged && !bottomRightViewportChunkPositionChanged) return

    lastTopLeftViewportChunkPosition.update(topLeftViewportPosition)
    lastBottomRightViewportChunkPosition.update(bottomRightViewportPosition)

    // TODO: Use ceil instead of floor for position -> chunk vector conversion instead of adding + 1 to the max relative chunk position

    for (let chunkY = topLeftViewportChunkPosition.y; chunkY <= bottomRightViewportChunkPosition.y + 1; chunkY++) {
      for (let chunkX = topLeftViewportChunkPosition.x; chunkX <= bottomRightViewportChunkPosition.x + 1; chunkX++) {
        const chunkPosition = new Vec2(chunkX, chunkY)

        const chunk = world.getChunk(chunkPosition)

        if (chunk.references.has(player)) continue

        const tiles = chunk.getTiles()

        const tileArray: Array<[string, Record<string, unknown>] | null> = []

        for (let y = 0; y < CHUNK_SIZE; y++) {
          for (let x = 0; x < CHUNK_SIZE; x++) {
            let serializedTile: [string, Record<string, unknown>] | null = null;

            (() => {
              const row = tiles.get(x)

              if (row === undefined) return

              const tile = row.get(y)

              if (tile === undefined) return

              serializedTile = [tile.type, tile.properties]
            })()

            tileArray.push(serializedTile)
          }
        }

        socket.emit('chunk.set', chunkPosition.toArray(), tileArray)

        chunk.references.add(player)
      }
    }
  })

  socket.on('chunk.remove', rawPosition => {
    const position = new Vec2(...rawPosition)

    const chunk = world.getChunk(position)

    chunk.references.delete(player)

    // TODO: Somehow delete the chunk while storing its data somewhere (file system?)
  })

  // ? Should this be in the World or Inventory Plugin?

  socket.on('tile.click', rawTilePosition => {
    const tilePosition = new Vec2(...rawTilePosition)

    const tile = world.getTile(tilePosition)

    if (tile === undefined) return

    if (tile.type === 'air') {
      const newTileType = player.inventory.getSlot(-1)?.getType() ?? 'air'

      if (!(newTileType in Tiles)) return

      const newTile = Tiles[newTileType as keyof typeof Tiles]

      world.setTile(newTile.instance(), tilePosition, true, true)

      player.inventory.removeAmount(-1, 1)

      return
    }

    if (player.inventory.addItem(tile.type, 1)) world.setTile(Tiles.air.instance(), tilePosition, true, true)
  })
})
