import type Tile from './tile'
import { CHUNK_SIZE, chunkPositionToTilePosition, positionToTilePosition, tilePositionToPosition } from './position-conversion'
import Vec2 from '../vec2'
import RectangularCollider from '../collision/rectangular'
import { loader } from '../../../assets/loader'
import { setOrigin } from '../../../game/util/debug'
import { TILE_TEXTURE_SIZE } from '../../../game/tile'

export interface TileRendererTile {
  position: Vec2
  size: Vec2
}

// TODO: "Global" Chunk Cache

export class Chunk<ValidTile extends Tile = Tile> {
  public tiles = new Map<number, Map<number, ValidTile>>()
  public boundingBox

  protected getTiles (): Map<Vec2, ValidTile> {
    const map = new Map<Vec2, ValidTile>()

    const tiles = this.tiles

    for (const [x, row] of tiles) {
      for (const [y, tile] of row) {
        map.set(new Vec2(x, y), tile)
      }
    }

    return map
  }

  // TODO: Multiple Caches (Animation)
  private cache?: OffscreenCanvas

  public clearCache (): this {
    this.cache = undefined

    return this
  }

  public getImage (cache: boolean = true): OffscreenCanvas | undefined {
    if (cache && this.cache !== undefined) return this.cache

    const CANVAS_SIZE = CHUNK_SIZE * TILE_TEXTURE_SIZE

    const canvas = new OffscreenCanvas(
      CANVAS_SIZE,
      CANVAS_SIZE
    )

    const context = canvas.getContext('2d')

    // ? Should I warn or throw an Error?
    if (context === null) return

    context.imageSmoothingEnabled = false

    for (const [tileTilePosition, tile] of this.getTiles()) {
      const tilePosition = tileTilePosition.scaled(TILE_TEXTURE_SIZE)

      // ? Should I make translating and resizing the tile's responsibility?
      tile.render(context, {
        position: tilePosition,
        nearby: this.getNearby(tileTilePosition.x, tileTilePosition.y)
      })
    }

    const boundingBox = this.boundingBox
    const size = boundingBox.getSize()

    const scaledCanvas = new OffscreenCanvas(
      size.x,
      size.y
    )

    setOrigin(scaledCanvas, `${this.constructor.name}.getImage`)

    const scaledContext = scaledCanvas.getContext('2d')

    if (scaledContext === null) return

    scaledContext.imageSmoothingEnabled = false

    scaledContext.drawImage(
      canvas,
      0, 0,
      size.x, size.y
    )

    if (cache) this.cache = scaledCanvas

    return scaledCanvas
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
}
