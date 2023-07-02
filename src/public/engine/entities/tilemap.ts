import type Frame from '../util/frame.js'
import type RectangularCollider from '../util/collision/rectangular.js'
import type Tile from '../util/tilemap/tile.js'
import { CHUNK_SIZE, tilePositionToPosition, tilePositionToChunkPosition, chunkPositionToTilePosition, positionToTilePosition } from '../util/tilemap/position-conversion.js'
import { Chunk } from '../util/tilemap/chunk.js'
import Vec2, { stringToVec2, vec2ToString } from '../util/vec2.js'
import Entity from './index.js'

const chunkTileSize = new Vec2(CHUNK_SIZE, CHUNK_SIZE)
const chunkPositionSize = chunkPositionToTilePosition(chunkTileSize)

export class TileMapEntity<ValidTile extends Tile = Tile> extends Entity<never> {
  private readonly chunks = new Map<string, Chunk<ValidTile>>()

  public clearCache (): void {
    for (const chunk of this.chunks.values()) chunk.clearCache()
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

  public getChunk (chunkPosition: Vec2): Chunk<ValidTile> | undefined {
    const chunkId = vec2ToString(chunkPosition)

    return this.chunks.get(chunkId)
  }

  public getChunks (): Set<Chunk<ValidTile>> {
    return new Set(this.chunks.values())
  }

  public setChunk (chunk: Chunk<ValidTile>, chunkPosition: Vec2): void {
    const chunkId = vec2ToString(chunkPosition)

    this.chunks.set(chunkId, chunk)
  }

  public removeChunk (chunk: Chunk<ValidTile> | Vec2 | string): void {
    if (chunk instanceof Chunk) {
      const chunkPosition = chunk.boundingBox.getPosition()
      const chunkTilePosition = positionToTilePosition(chunkPosition)
      const chunkChunkPosition = tilePositionToChunkPosition(chunkTilePosition)

      chunk = chunkChunkPosition
    }

    if (chunk instanceof Vec2) chunk = vec2ToString(chunk)

    this.chunks.delete(chunk)
  }

  public setTile (tile: ValidTile, tilePosition: Vec2): void {
    const chunkChunkPosition = tilePositionToChunkPosition(tilePosition)
    const chunkTilePosition = chunkPositionToTilePosition(chunkChunkPosition)

    this._setTile(tile, tilePosition, chunkChunkPosition)

    const relativeTilePosition = tilePosition.minus(chunkTilePosition)

    if (relativeTilePosition.x === 0) this._setTile(tile, tilePosition, chunkChunkPosition.offset(-1, 0))

    if (relativeTilePosition.x === CHUNK_SIZE - 1) this._setTile(tile, tilePosition, chunkChunkPosition.offset(1, 0))

    if (relativeTilePosition.y === 0) this._setTile(tile, tilePosition, chunkChunkPosition.offset(0, -1))

    if (relativeTilePosition.y === CHUNK_SIZE - 1) this._setTile(tile, tilePosition, chunkChunkPosition.offset(0, 1))
  }

  protected _setTile (tile: ValidTile, tilePosition: Vec2, chunkChunkPosition: Vec2): void {
    const chunkTilePosition = chunkPositionToTilePosition(chunkChunkPosition)

    tilePosition = tilePosition
      .minus(chunkTilePosition)

    let chunk = this.getChunk(chunkChunkPosition)

    if (chunk === undefined) {
      chunk = new Chunk(chunkChunkPosition, chunkPositionSize)
      this.setChunk(chunk, chunkChunkPosition)
    }

    chunk.setTile(tile, tilePosition)

    chunk.clearCache()
  }

  public getTile (tilePosition: Vec2): ValidTile | undefined {
    const chunkPosition = tilePositionToChunkPosition(tilePosition)
    const chunk = this.getChunk(chunkPosition)

    if (chunk === undefined) return

    const relativeTilePosition = tilePosition.mod(CHUNK_SIZE)

    return chunk.getTile(relativeTilePosition)
  }

  // Collision Detection

  public touching (other: RectangularCollider): boolean {
    return Array.from(this.chunks.values()).some(chunk => chunk.overlapping(other))
  }

  public overlapping (other: RectangularCollider): boolean {
    return Array.from(this.chunks.values()).some(chunk => chunk.overlapping(other))
  }

  public colliding (other: RectangularCollider): boolean {
    return Array.from(this.chunks.values()).some(chunk => chunk.colliding(other))
  }
}

export default TileMapEntity
