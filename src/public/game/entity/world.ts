import type Tile from '../../engine/util/tilemap/tile'
import { TILE_CLICK_BUTTONS } from '../../../socket.io'
import { TILE_SIZE, CHUNK_SIZE, positionToTilePosition, tilePositionToChunkPosition } from '../../engine/util/tilemap/position-conversion'
import { createTile } from '../util/tile'
import { loader } from '../../asset/loader'
import Vec2 from '../../engine/util/vec2'
import TileMapEntity from '../../engine/entity/tilemap'
import { watch } from '../../engine/util/object'
import { Experiments } from '../../globals'
import { PrioritizedMouse } from '../../engine/util/input/mouse/prioritization'
import socket from '../socket.io'

export class WorldEntity extends TileMapEntity<Tile> {
  constructor () {
    super()

    const mouse = new PrioritizedMouse(() => this.getPath())

    for (const button of TILE_CLICK_BUTTONS) {
      mouse.addEventListener(`${button}.down`, () => {
        const mouseGlobalPosition = this.getMouseGlobalPosition()

        if (mouseGlobalPosition === undefined) return

        const globalMouseTilePosition = positionToTilePosition(mouseGlobalPosition)

        socket.emit('tile.click', globalMouseTilePosition.toArray(), button)
      })
    }
  }

  public ready (): void {
    socket.on('chunk.set', (rawChunkPosition, tiles) => {
      const chunkPosition = Vec2.fromArray(rawChunkPosition)

      const chunk = this._createChunk(chunkPosition)

      for (let y = 0; y < CHUNK_SIZE; y++) {
        for (let x = 0; x < CHUNK_SIZE; x++) {
          void (async () => {
            const rawTile = tiles.shift()

            if (rawTile === undefined) return
            if (rawTile === null) return

            const [
              type,
              light,
              meta
            ] = rawTile

            const tile = await createTile(type, light, meta)

            const tileTilePosition = new Vec2(x, y)

            chunk.setTile(tile, tileTilePosition)
          })()
        }
      }

      this.setChunk(chunk, chunkPosition.x, chunkPosition.y)
    })

    socket.on('tile.set[]', async tiles => {
      for (const [rawX, row] of Object.entries(tiles)) {
        for (const [rawY, rawTile] of Object.entries(row)) {
          const x = parseInt(rawX)
          const y = parseInt(rawY)

          const tilePosition = new Vec2(x, y)

          const oldTile = this.getTile(tilePosition)

          const [type, light, meta] = rawTile

          if (
            oldTile !== undefined &&
            oldTile.type === type &&
            oldTile.light === light &&
            oldTile.meta === meta
          ) continue

          const tile = await createTile(type, light, meta)

          this.setTile(tile, tilePosition)
        }
      }
    })

    loader.addEventListener('load', () => {
      this.renderAll()
    })

    watch(Experiments, 'cursed_water', {
      set: () => {
        this.renderAll()
      }
    })
  }

  private lastViewportTopLeftChunkPosition = new Vec2(NaN, NaN)
  private lastViewportBottomRightChunkPosition = new Vec2(NaN, NaN)

  public update (delta: number): void {
    super.update(delta)

    const scene = this.getRoot()

    if (scene === undefined) return

    const camera = scene.camera

    const viewport = camera.getViewport()

    const viewportTopLeftPosition = viewport.getPosition()

    const viewportSize = viewport.getSize()

    const viewportBottomRightPosition = viewportTopLeftPosition.plus(viewportSize)

    const viewportTopLeftTilePosition = positionToTilePosition(viewportTopLeftPosition)
    const viewportBottomRightTilePosition = positionToTilePosition(viewportBottomRightPosition)

    const viewportTopLeftChunkPosition = tilePositionToChunkPosition(viewportTopLeftTilePosition)
    const viewportBottomRightChunkPosition = tilePositionToChunkPosition(viewportBottomRightTilePosition)

    const viewportTopLeftChunkPositionChanged = viewportTopLeftChunkPosition.x !== this.lastViewportTopLeftChunkPosition.x || viewportTopLeftChunkPosition.y !== this.lastViewportTopLeftChunkPosition.y
    const viewportBottomRightChunkPositionChanged = viewportBottomRightChunkPosition.x !== this.lastViewportBottomRightChunkPosition.x || viewportBottomRightChunkPosition.y !== this.lastViewportBottomRightChunkPosition.y

    this.lastViewportTopLeftChunkPosition = viewportTopLeftChunkPosition
    this.lastViewportBottomRightChunkPosition = viewportBottomRightChunkPosition

    if (!viewportTopLeftChunkPositionChanged && !viewportBottomRightChunkPositionChanged) return

    for (const row of this.getChunks().values()) {
      for (const chunk of row.values()) {
        const boundingBox = chunk.boundingBox

        if (boundingBox.distance(viewport) < TILE_SIZE * CHUNK_SIZE) continue

        const position = boundingBox.getPosition()
        const tilePosition = positionToTilePosition(position)
        const chunkPosition = tilePositionToChunkPosition(tilePosition)

        socket.emit('chunk.remove', chunkPosition.toArray())

        this.removeChunk(chunkPosition)
      }
    }
  }
}

export default WorldEntity
