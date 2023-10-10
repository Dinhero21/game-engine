import type Frame from '../util/frame'
import type RectangularCollider from '../util/collision/rectangular'
import type Tile from '../util/tilemap/tile'
import Entity from '.'
import Vec2 from '../util/vec2'
import { Chunk } from '../util/tilemap/chunk'
import { CHUNK_SIZE, tilePositionToChunkPosition, chunkPositionToTilePosition, positionToTilePosition, TILE_SIZE, tilePositionToPosition } from '../util/tilemap/position-conversion'

const chunkTileSize = new Vec2(CHUNK_SIZE, CHUNK_SIZE)

export class TileMapEntity<ValidTile extends Tile = Tile> extends Entity<never> {
  // Game Loop

  public draw (frame: Frame): void {
    super.draw(frame)

    const scene = this.getRoot()

    if (scene === undefined) return

    const camera = scene.camera
    const viewport = camera.getViewport()

    const viewportPosition = viewport.getPosition()
    const viewportSize = viewport.getSize()

    // TODO: Use ceil instead of floor for position -> chunk vector conversion instead of adding + 1 to the max relative chunk position

    const viewportTilePosition = positionToTilePosition(viewportPosition)
    const viewportChunkPosition = tilePositionToChunkPosition(viewportTilePosition)

    const viewportTileSize = positionToTilePosition(viewportSize)
    const viewportChunkSize = tilePositionToChunkPosition(viewportTileSize)

    for (let relativeX = 0; relativeX <= viewportChunkSize.x + 1; relativeX++) {
      for (let relativeY = 0; relativeY <= viewportChunkSize.y + 1; relativeY++) {
        const chunkPositionX = relativeX + viewportChunkPosition.x
        const chunkPositionY = relativeY + viewportChunkPosition.y

        const chunkChunkPosition = new Vec2(chunkPositionX, chunkPositionY)
        const chunkTilePosition = chunkPositionToTilePosition(chunkChunkPosition)
        const chunkPosition = tilePositionToPosition(chunkTilePosition)

        const chunk = this.getChunk(chunkPositionX, chunkPositionY)

        if (chunk === undefined) continue

        chunk.renderQueue()

        frame._drawImage(
          chunk.canvas,
          chunkPosition.x, chunkPosition.y
        )
      }
    }
  }

  // Chunk Manipulation

  private readonly chunks = new Map<number, Map<number, Chunk<ValidTile>>>()

  public renderAll (): void {
    for (const row of this.getChunks().values()) {
      for (const chunk of row.values()) {
        chunk.queueAll()
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

  // TODO: Use x, y instead of Vec2
  protected _createChunk (position: Vec2): Chunk<ValidTile> {
    return new Chunk<ValidTile>(position, chunkTileSize, (x: number, y: number) => this.getChunk(x, y))
  }

  // Tile Manipulation

  private _queueTile (tileTilePosition: Vec2): void {
    const tileChunkPosition = tilePositionToChunkPosition(tileTilePosition)

    const chunk = this.getChunk(tileChunkPosition.x, tileChunkPosition.y)

    if (chunk === undefined) return

    chunk.queueTile(tileTilePosition.x, tileTilePosition.y)
  }

  public setTile (tile: ValidTile, tileTilePosition: Vec2): void {
    const chunkChunkPosition = tilePositionToChunkPosition(tileTilePosition)

    const chunkTilePosition = chunkPositionToTilePosition(chunkChunkPosition)

    let chunk = this.getChunk(chunkChunkPosition.x, chunkChunkPosition.y)

    if (chunk === undefined) {
      chunk = this._createChunk(chunkChunkPosition)
      this.setChunk(chunk, chunkChunkPosition.x, chunkChunkPosition.y)
    }

    // ? Should I mutate
    tileTilePosition.subtract(chunkTilePosition)

    chunk.setTile(tile, tileTilePosition)
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

  public overlapping (other: RectangularCollider): boolean {
    const position = other.getPosition()
    const size = other.getSize()

    const startX = position.x
    const startY = position.y

    const endX = position.x + size.x
    const endY = position.y + size.y

    const startTileX = Math.floor(startX / TILE_SIZE)
    const startTileY = Math.floor(startY / TILE_SIZE)

    const endTileX = Math.ceil(endX / TILE_SIZE)
    const endTileY = Math.ceil(endY / TILE_SIZE)

    for (let x = startTileX; x < endTileX; x++) {
      for (let y = startTileY; y < endTileY; y++) {
        const position = new Vec2(x, y)
        const tile = this.getTile(position)

        if (tile === undefined) continue

        if (!tile.collidable) continue

        return true
      }
    }

    return false
  }
}

export default TileMapEntity
