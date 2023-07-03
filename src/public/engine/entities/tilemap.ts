import type Frame from '../util/frame.js'
import type RectangularCollider from '../util/collision/rectangular.js'
import type Tile from '../util/tilemap/tile.js'
import { CHUNK_SIZE, tilePositionToPosition, tilePositionToChunkPosition, chunkPositionToTilePosition, positionToTilePosition } from '../util/tilemap/position-conversion.js'
import { Chunk } from '../util/tilemap/chunk.js'
import Vec2 from '../util/vec2.js'
import Entity from './index.js'

const chunkTileSize = new Vec2(CHUNK_SIZE, CHUNK_SIZE)

export class TileMapEntity<ValidTile extends Tile = Tile> extends Entity<never> {
  private readonly chunks = new Map<number, Map<number, Chunk<ValidTile>>>()

  public clearCache (): void {
    for (const row of this.getChunks().values()) {
      for (const chunk of row.values()) {
        chunk.clearCache()
      }
    }
  }

  public draw (frame: Frame): void {
    super.draw(frame)

    const scene = this.getScene()

    if (scene === undefined) return

    const camera = scene.camera
    const viewport = camera.getViewport()

    for (const [x, row] of this.getChunks()) {
      for (const [y, chunk] of row) {
        if (!chunk.boundingBox.overlapping(viewport)) continue

        const chunkChunkPosition = new Vec2(x, y)
        const chunkTilePosition = chunkPositionToTilePosition(chunkChunkPosition)
        const chunkPosition = tilePositionToPosition(chunkTilePosition)

        const chunkImage = chunk.getImage()

        if (chunkImage === undefined) continue

        // ? Should I resize the image?
        frame._drawImage(chunkImage, chunkPosition.x, chunkPosition.y)
      }
    }
  }

  public getChunk (x: number, y: number): Chunk<ValidTile> | undefined {
    return this.chunks.get(x)?.get(y)
  }

  public getChunks (): Map<number, Map<number, Chunk<ValidTile>>> {
    return this.chunks
  }

  public setChunk (chunk: Chunk<ValidTile>, x: number, y: number): void {
    const chunks = this.chunks

    const row = chunks.get(x) ?? new Map()
    chunks.set(x, row)

    row.set(y, chunk)
  }

  public removeChunk (chunk: Chunk<ValidTile> | Vec2): void {
    if (chunk instanceof Chunk) {
      const chunkPosition = chunk.boundingBox.getPosition()
      const chunkTilePosition = positionToTilePosition(chunkPosition)
      const chunkChunkPosition = tilePositionToChunkPosition(chunkTilePosition)

      chunk = chunkChunkPosition
    }

    this.chunks.get(chunk.x)?.delete(chunk.y)
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

    let chunk = this.getChunk(chunkChunkPosition.x, chunkChunkPosition.y)

    if (chunk === undefined) {
      chunk = new Chunk(chunkChunkPosition, chunkTileSize)
      this.setChunk(chunk, chunkChunkPosition.x, chunkChunkPosition.y)
    }

    chunk.setTile(tile, tilePosition)

    chunk.clearCache()
  }

  // TODO: Use x, y instead of Vec2
  public getTile (tilePosition: Vec2): ValidTile | undefined {
    const chunkPosition = tilePositionToChunkPosition(tilePosition)
    const chunk = this.getChunk(chunkPosition.x, chunkPosition.y)

    if (chunk === undefined) return

    const relativeTilePosition = tilePosition.mod(CHUNK_SIZE)

    return chunk.getTile(relativeTilePosition.x, relativeTilePosition.y)
  }

  // Collision Detection

  public touching (other: RectangularCollider): boolean {
    for (const row of this.getChunks().values()) {
      for (const chunk of row.values()) {
        if (chunk.touching(other)) return true
      }
    }

    return false
  }

  public overlapping (other: RectangularCollider): boolean {
    for (const row of this.getChunks().values()) {
      for (const chunk of row.values()) {
        if (chunk.overlapping(other)) return true
      }
    }

    return false
  }

  public colliding (other: RectangularCollider): boolean {
    for (const row of this.getChunks().values()) {
      for (const chunk of row.values()) {
        if (chunk.colliding(other)) return true
      }
    }

    return false
  }
}

export default TileMapEntity
