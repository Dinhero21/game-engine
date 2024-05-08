import type Chunk from '../world/chunk'
import { io } from './web'
import { getPlayer } from './player'
import { World } from '../world'
import { WorldGen } from '../world/gen'
import Vec2 from '../public/engine/util/vec2'
import { CHUNK_SIZE, positionToTilePosition, tilePositionToChunkPosition } from '../public/engine/util/tilemap/position-conversion'
import Loop from '../public/engine/util/loop'
import { Map2D } from '../public/engine/util/2d'
import { type TileInstance } from '../world/tile/base'
import { type TileMap } from '../socket.io'

export type BaseSerializedTile = [
  type: string,
  light: number,
  meta: unknown
]

export type SerializedTile = BaseSerializedTile | null

// ! Babel will refuse to transpile the code below with the error
// ! "Tuple members must all have names or all not have names."
// ! even though it is supposed to only transpile and not do any
// ! kind of type-checking.
// TODO: Fix Babel Errors
// export type PositionedSerializedTile = [
//   /* x: */ number,
//   /* y: */ number,
//   ...BaseSerializedTile
// ]

const VIEWPORT_SIZE = new Vec2(1920, 1080)
const HALF_VIEWPORT_SIZE = VIEWPORT_SIZE.divided(2)

export const gen = new WorldGen()

export const world = new World(gen)

const tileQueue = new Map<Chunk, Map2D<number, number, TileInstance>>()

world.on('tile.set', tile => {
  const tilePosition = tile.getTilePosition()
  const chunk = tile.getChunk()

  const tileMap = tileQueue.get(
    chunk
  ) ?? new Map2D()

  tileQueue.set(
    chunk,
    tileMap
  )

  tileMap.set(
    tilePosition.x,
    tilePosition.y,
    tile
  )
})

const OnTick = Loop.precise(1000 / 12)

// Tile Ticking
OnTick(
  () => {
    world.tick()
  },
  behind => {
    console.warn(`Tick took too long! ${behind.toPrecision(3)}ms behind`)
  }
)

// Tile Update
OnTick(() => {
  if (tileQueue.size === 0) return

  const tiles: TileMap = {}

  for (const [chunk, tileMap] of tileQueue.entries()) {
    // TODO: Per-player tile.set-ing
    if (chunk.references.size === 0) continue

    for (const [position, tile] of tileMap.entries()) {
      const [rawX, rawY] = position
      const [x, y] = [String(rawX), String(rawY)]

      const row = tiles[x] ?? (tiles[x] = {})

      row[y] = [
        tile.type,
        tile.light,
        tile.getMeta()
      ]
    }
  }

  tileQueue.clear()

  io.emit('tile.set[]', tiles)
})

// Entity Syncing
OnTick(() => {
  world.syncEntities()
})

const OnInstant = Loop.instant()

// Light Ticking
OnInstant(delta => {
  if (delta > 100) console.warn(`Lighting took too long! ${delta.toPrecision(3)}ms`)

  world.updateLights()
})

// Entity Ticking
OnInstant(delta => {
  world.updateEntities(delta)
})

io.on('connection', socket => {
  const player = getPlayer(socket.id)

  if (player === undefined) return

  const lastTopLeftViewportChunkPosition = new Vec2(NaN, NaN)
  const lastBottomRightViewportChunkPosition = new Vec2(NaN, NaN)

  socket.on('physics.update', rawPosition => {
    const position = Vec2.fromArray(rawPosition)

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

        const tiles = chunk.getTileMap()

        const tileArray: Array<SerializedTile | null> = []

        for (let y = 0; y < CHUNK_SIZE; y++) {
          for (let x = 0; x < CHUNK_SIZE; x++) {
            let serializedTile: SerializedTile | null = null;

            (() => {
              const tile = tiles.get(x, y)

              if (tile === undefined) return

              serializedTile = [
                tile.type,
                tile.light,
                tile.getMeta()
              ]
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
    const position = Vec2.fromArray(rawPosition)

    const chunk = world.getChunk(position)

    chunk.references.delete(player)

    // TODO: Somehow delete the chunk while storing its data somewhere (file system?)
  })

  // TODO: Run this code before Player's so that entities don't need to be filtered
  for (const entity of world.entities) {
    // Stop the player from being sent twice
    if (entity.id === socket.id) continue

    socket.emit('entity.add', entity.getClientData())
  }
})

export default world
