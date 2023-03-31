import type Tile from './tile.js'
import { TILE_SIZE, chunkPositionToTilePosition, tilePositionToPosition } from './position-conversion.js'
import Vec2, { vec2ToString, stringToVec2 } from '../vec2.js'
import RectangularCollider from '../collision/rectangular.js'

const tileSize = new Vec2(TILE_SIZE, TILE_SIZE)

export interface TileRendererTile {
  position: Vec2
  size: Vec2
}

// TODO: "Global" Chunk Cache

export class Chunk<ValidTile extends Tile = Tile> {
  public tiles = new Map<string, ValidTile>()
  public boundingBox: RectangularCollider

  // TODO: Multiple Cache Versions
  private cache?: ImageBitmap

  public clearCache (): this {
    this.cache = undefined

    return this
  }

  public getImage (cache: boolean = true): ImageBitmap | undefined {
    if (cache && this.cache !== undefined) return this.cache

    const boundingBox = this.boundingBox
    const size = boundingBox.getSize()

    const canvas = new OffscreenCanvas(size.x, size.y)
    const context = canvas.getContext('2d')

    // ? Should I warn or throw an Error?
    if (context === null) return

    context.imageSmoothingEnabled = false

    for (const [tileId, tile] of this.tiles) {
      const tileTilePosition = stringToVec2(tileId)

      const tilePosition = tilePositionToPosition(tileTilePosition)

      // ? Should I make translating and resizing the tile's responsibility?
      tile.render(context, {
        position: tilePosition,
        size: tileSize
      })
    }

    const image = canvas.transferToImageBitmap()

    if (cache) this.cache = image

    return image
  }

  constructor (chunkPosition: Vec2, chunkTileSize: Vec2) {
    const tilePosition = chunkPositionToTilePosition(chunkPosition)
    const position = tilePositionToPosition(tilePosition)

    const size = tilePositionToPosition(chunkTileSize)

    this.boundingBox = new RectangularCollider(position, size)
  }

  public getTile (tilePosition: Vec2): ValidTile | undefined {
    const id = vec2ToString(tilePosition)

    return this.tiles.get(id)
  }

  public setTile (tile: ValidTile, tilePosition: Vec2): void {
    const id = vec2ToString(tilePosition)

    this.tiles.set(id, tile)
  }

  // Collision Detection

  public touching (other: RectangularCollider): boolean {
    const boundingBox = this.boundingBox

    if (!boundingBox.overlapping(other)) return false

    const position = boundingBox.getPosition()

    other = other.offset(position.scaled(-1))

    return Array.from(this.tiles)
      .filter(([tileId, tile]) => tile.collidable)
      .map(([tileId, tile]) => stringToVec2(tileId))
      .map(tilePositionToPosition)
      .some(position => (new RectangularCollider(position, tileSize)).touching(other))
  }

  public overlapping (other: RectangularCollider): boolean {
    const boundingBox = this.boundingBox

    if (!boundingBox.overlapping(other)) return false

    const position = boundingBox.getPosition()

    other = other.offset(position.scaled(-1))

    return Array.from(this.tiles)
      .filter(([tileId, tile]) => tile.collidable)
      .map(([tileId, tile]) => stringToVec2(tileId))
      .map(tilePositionToPosition)
      .some(position => (new RectangularCollider(position, tileSize)).overlapping(other))
  }

  public colliding (other: RectangularCollider): boolean {
    const boundingBox = this.boundingBox

    if (!boundingBox.overlapping(other)) return false

    const position = boundingBox.getPosition()

    other = other.offset(position.scaled(-1))

    return Array.from(this.tiles)
      .filter(([tileId, tile]) => tile.collidable)
      .map(([tileId, tile]) => stringToVec2(tileId))
      .map(tilePositionToPosition)
      .some(position => (new RectangularCollider(position, tileSize)).colliding(other))
  }
}
