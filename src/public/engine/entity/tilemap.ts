import type Frame from '../util/frame'
import type RectangularCollider from '../util/collision/rectangular'
import type Tile from '../util/tilemap/tile'
import Entity from '.'
import Vec2 from '../util/vec2'
import { Chunk } from '../util/tilemap/chunk'
import { CHUNK_SIZE, tilePositionToChunkPosition, chunkPositionToTilePosition, positionToTilePosition, TILE_SIZE, tilePositionToPosition } from '../util/tilemap/position-conversion'

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

        const chunkImage = chunk.getImage()

        if (chunkImage === undefined) continue

        frame._drawImage(
          chunkImage,
          chunkPosition.x, chunkPosition.y
        )
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

    this.clearNearbyChunkCache(x, y)
  }

  public removeChunk (chunk: Chunk<ValidTile> | Vec2): void {
    if (chunk instanceof Chunk) {
      const chunkPosition = chunk.boundingBox.getPosition()
      const chunkTilePosition = positionToTilePosition(chunkPosition)
      const chunkChunkPosition = tilePositionToChunkPosition(chunkTilePosition)

      chunk = chunkChunkPosition
    }

    this.chunks.get(chunk.x)?.delete(chunk.y)

    // this.clearNearbyChunkCache(chunk.x, chunk.y)
  }

  protected clearNearbyChunkCache (x: number, y: number): void {
    this._clearChunkCache(x - 1, y)
    this._clearChunkCache(x + 1, y)
    this._clearChunkCache(x, y - 1)
    this._clearChunkCache(x, y + 1)
  }

  protected _clearChunkCache (x: number, y: number): void {
    const chunk = this.getChunk(x, y)

    if (chunk === undefined) return

    chunk.clearCache()
  }

  // TODO: Use x, y instead of Vec2
  protected _createChunk (position: Vec2): Chunk<ValidTile> {
    return new Chunk<ValidTile>(position, chunkTileSize, (x: number, y: number) => this.getTile(new Vec2(x, y)))
  }

  public setTile (tile: ValidTile, tilePosition: Vec2): void {
    const chunkChunkPosition = tilePositionToChunkPosition(tilePosition)

    const chunkTilePosition = chunkPositionToTilePosition(chunkChunkPosition)

    tilePosition = tilePosition
      .minus(chunkTilePosition)

    let chunk = this.getChunk(chunkChunkPosition.x, chunkChunkPosition.y)

    if (chunk === undefined) {
      chunk = this._createChunk(chunkChunkPosition)
      this.setChunk(chunk, chunkChunkPosition.x, chunkChunkPosition.y)
    }

    chunk.setTile(tile, tilePosition.x, tilePosition.y)

    chunk.clearCache()

    if (tilePosition.x === 0) this._clearChunkCache(chunkChunkPosition.x - 1, chunkChunkPosition.y)

    if (tilePosition.x === CHUNK_SIZE - 1) this._clearChunkCache(chunkChunkPosition.x + 1, chunkChunkPosition.y)

    if (tilePosition.y === 0) this._clearChunkCache(chunkChunkPosition.x, chunkChunkPosition.y - 1)

    if (tilePosition.y === CHUNK_SIZE - 1) this._clearChunkCache(chunkChunkPosition.x, chunkChunkPosition.y + 1)
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