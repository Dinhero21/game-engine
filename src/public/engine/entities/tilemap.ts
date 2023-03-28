import { type Tile, Chunk, type TileRenderer } from '../util/tilemap/chunk.js'
import type Frame from '../util/frame.js'
import Vec2, { stringToVec2, vec2ToString } from '../util/vec2.js'
import Entity from './base.js'
import { CHUNK_SIZE, tilePositionToPosition, tilePositionToChunkPosition, chunkPositionToTilePosition } from '../util/tilemap/position-conversion.js'

const chunkTileSize = new Vec2(CHUNK_SIZE, CHUNK_SIZE)
const chunkPositionSize = chunkPositionToTilePosition(chunkTileSize)

export class TileMapEntity extends Entity {
  private readonly chunks = new Map<string, Chunk>()

  private readonly renderer

  public clearCache (): void {
    for (const chunk of this.chunks.values()) chunk.clearCache()
  }

  constructor (render: TileRenderer) {
    super()

    this.renderer = render
  }

  public draw (frame: Frame): void {
    super.draw(frame)

    const scene = this.getScene()

    if (scene === undefined) return

    const camera = scene.camera
    const viewport = camera.getViewport()

    for (const [chunkId, chunk] of this.chunks) {
      if (!chunk.boundingBox.overlapping(viewport)) continue

      const chunkChunkPosition = stringToVec2(chunkId)
      const chunkTilePosition = chunkPositionToTilePosition(chunkChunkPosition)
      const chunkPosition = tilePositionToPosition(chunkTilePosition)

      const chunkImage = chunk.getImage()

      if (chunkImage === undefined) continue

      // ? Should I resize the image?
      frame._drawImage(chunkImage, chunkPosition.x, chunkPosition.y)
    }
  }

  public setTile (tile: Tile, tilePosition: Vec2): void {
    const chunkChunkPosition = tilePositionToChunkPosition(tilePosition)
    const chunkTilePosition = chunkPositionToTilePosition(chunkChunkPosition)

    tilePosition = tilePosition
      .minus(chunkTilePosition)

    const chunkId = vec2ToString(chunkChunkPosition)
    let chunk = this.chunks.get(chunkId)

    if (chunk === undefined) {
      const renderer = this.renderer

      chunk = new Chunk(chunkChunkPosition, chunkPositionSize, renderer)
      this.chunks.set(chunkId, chunk)
    }

    chunk.setTile(tile, tilePosition)

    chunk.clearCache()
  }

  public setChunk (chunk: Chunk, chunkPosition: Vec2): void {
    const chunkId = vec2ToString(chunkPosition)

    this.chunks.set(chunkId, chunk)
  }
}
