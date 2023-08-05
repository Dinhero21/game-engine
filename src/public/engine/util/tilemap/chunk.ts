import type Tile from './tile'
import { TILE_SIZE, chunkPositionToTilePosition, positionToTilePosition, tilePositionToPosition } from './position-conversion'
import Vec2 from '../vec2'
import RectangularCollider from '../collision/rectangular'
import { loader } from '../../../assets/loader'

const tileSize = new Vec2(TILE_SIZE, TILE_SIZE)

export interface TileRendererTile {
  position: Vec2
  size: Vec2
}

// TODO: "Global" Chunk Cache

export class Chunk<ValidTile extends Tile = Tile> {
  public tiles = new Map<number, Map<number, ValidTile>>()
  public boundingBox: RectangularCollider

  protected getTiles (): Map<Vec2, ValidTile> {
    const map = new Map<Vec2, ValidTile>()

    const boundingBox = this.boundingBox
    const size = boundingBox.getSize()

    const chunkSize = size.divided(TILE_SIZE)

    for (let x = 0; x < chunkSize.x; x++) {
      for (let y = 0; y < chunkSize.y; y++) {
        const tile = this.getTile(x, y)

        if (tile === undefined) continue

        map.set(new Vec2(x, y), tile)
      }
    }

    return map
  }

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

    for (const [tileTilePosition, tile] of this.getTiles()) {
      const tilePosition = tilePositionToPosition(tileTilePosition)

      // ? Should I make translating and resizing the tile's responsibility?
      tile.render(context, {
        position: tilePosition,
        size: tileSize,
        nearby: this.getNearby(tileTilePosition.x, tileTilePosition.y)
      })
    }

    const image = canvas.transferToImageBitmap()

    if (cache) this.cache = image

    return image
  }

  protected getNearby (x: number, y: number): [boolean, boolean, boolean, boolean] {
    const tile = this.getTile(x, y)

    if (tile === undefined) return [false, false, false, false]

    const connects = loader.getConnects(tile.type)

    const upTile = this.requestTile(x, y - 1)
    const leftTile = this.requestTile(x - 1, y)
    const rightTile = this.requestTile(x + 1, y)
    const downTile = this.requestTile(x, y + 1)

    const up = connects.includes(String(upTile?.type))
    const left = connects.includes(String(leftTile?.type))
    const right = connects.includes(String(rightTile?.type))
    const down = connects.includes(String(downTile?.type))

    return [up, left, right, down]
  }

  protected _requestTile

  constructor (chunkPosition: Vec2, chunkTileSize: Vec2, requestTile: (x: number, y: number) => ValidTile | undefined) {
    const tilePosition = chunkPositionToTilePosition(chunkPosition)
    const position = tilePositionToPosition(tilePosition)

    const size = tilePositionToPosition(chunkTileSize)

    this.boundingBox = new RectangularCollider(position, size)

    this._requestTile = requestTile
  }

  protected _requestRelativeTile (x: number, y: number): ValidTile | undefined {
    const boundingBox = this.boundingBox
    const position = boundingBox.getPosition()
    const tilePosition = positionToTilePosition(position)

    return this._requestTile(tilePosition.x + x, tilePosition.y + y)
  }

  protected requestTile (x: number, y: number): ValidTile | undefined {
    return this.getTile(x, y) ?? this._requestRelativeTile(x, y)
  }

  public getTile (x: number, y: number): ValidTile | undefined {
    return this.tiles.get(x)?.get(y)
  }

  public setTile (tile: ValidTile, tilePosition: Vec2): void {
    const tiles = this.tiles

    const row = tiles.get(tilePosition.x) ?? new Map()
    tiles.set(tilePosition.x, row)

    row.set(tilePosition.y, tile)
  }

  // Collision Detection

  public touching (other: RectangularCollider): boolean {
    const boundingBox = this.boundingBox

    if (!boundingBox.overlapping(other)) return false

    const position = boundingBox.getPosition()

    other = other.offset(position.scaled(-1))

    return Array.from(this.getTiles())
      .filter(([tileTilePosition, tile]) => tile.collidable)
      .map(([tileTilePosition, tile]) => tilePositionToPosition(tileTilePosition))
      .map(tilePosition => new RectangularCollider(tilePosition, tileSize))
      .some(collider => collider.touching(other))
  }

  public overlapping (other: RectangularCollider): boolean {
    const boundingBox = this.boundingBox

    if (!boundingBox.overlapping(other)) return false

    const position = boundingBox.getPosition()

    other = other.offset(position.scaled(-1))

    return Array.from(this.getTiles())
      .filter(([tileTilePosition, tile]) => tile.collidable)
      .map(([tileTilePosition, tile]) => tilePositionToPosition(tileTilePosition))
      .map(tilePosition => new RectangularCollider(tilePosition, tileSize))
      .some(collider => collider.overlapping(other))
  }

  public colliding (other: RectangularCollider): boolean {
    const boundingBox = this.boundingBox

    if (!boundingBox.overlapping(other)) return false

    const position = boundingBox.getPosition()

    other = other.offset(position.scaled(-1))

    return Array.from(this.getTiles())
      .filter(([tileTilePosition, tile]) => tile.collidable)
      .map(([tileTilePosition, tile]) => tilePositionToPosition(tileTilePosition))
      .map(tilePosition => new RectangularCollider(tilePosition, tileSize))
      .some(collider => collider.colliding(other))
  }
}
