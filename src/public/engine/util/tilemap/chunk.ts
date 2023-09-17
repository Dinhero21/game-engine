import type Tile from './tile'
import { TILE_SIZE, chunkPositionToTilePosition, positionToTilePosition, tilePositionToChunkPosition, tilePositionToPosition } from './position-conversion'
import Vec2 from '../vec2'
import RectangularCollider from '../collision/rectangular'
import { loader } from '../../../asset/loader'
import { setOrigin } from '../debug'
import { valid } from '../../../none'

const TILE_SIZE_VECTOR = new Vec2(TILE_SIZE, TILE_SIZE)

export interface TileRendererTile {
  position: Vec2
  size: Vec2
}

// TODO: "Global" Chunk Cache

// TODO: Make it so you don't need position
export class Chunk<ValidTile extends Tile = Tile> {
  public canvas

  constructor (chunkPosition: Vec2, chunkTileSize: Vec2, getChunk: (x: number, y: number) => Chunk<ValidTile> | undefined) {
    const tilePosition = chunkPositionToTilePosition(chunkPosition)
    const position = tilePositionToPosition(tilePosition)

    const size = tilePositionToPosition(chunkTileSize)

    this.boundingBox = new RectangularCollider(position, size)

    this.getChunk = getChunk

    const canvas = new OffscreenCanvas(
      size.x,
      size.y
    )

    this.canvas = canvas

    setOrigin(canvas, `${this.constructor.name}.canvas`)

    const context = valid(
      canvas.getContext('2d'),
      new Error('Failed to get canvas context')
    )

    context.imageSmoothingEnabled = false
  }

  // Tile Manipulation

  public tiles = new Map<number, Map<number, ValidTile>>()
  public boundingBox

  protected getChunk

  protected getNearby (tileTilePosition: Vec2): [boolean, boolean, boolean, boolean] {
    const tile = this.getTile(tileTilePosition.x, tileTilePosition.y)

    if (tile === undefined) return [false, false, false, false]

    const connects = loader.getConnects(tile.type)

    const upTile = this.requestTile(tileTilePosition.offset(0, -1))
    const leftTile = this.requestTile(tileTilePosition.offset(-1, 0))
    const rightTile = this.requestTile(tileTilePosition.offset(1, 0))
    const downTile = this.requestTile(tileTilePosition.offset(0, 1))

    const up = connects.includes(String(upTile?.type))
    const left = connects.includes(String(leftTile?.type))
    const right = connects.includes(String(rightTile?.type))
    const down = connects.includes(String(downTile?.type))

    return [up, left, right, down]
  }

  protected _requestTile (tileTilePosition: Vec2): ValidTile | undefined {
    const tileChunkPosition = tilePositionToChunkPosition(tileTilePosition)

    const chunk = this.getChunk(tileChunkPosition.x, tileChunkPosition.y)

    if (chunk === undefined) return

    const chunkTilePosition = chunkPositionToTilePosition(tileChunkPosition)

    // ? Should I mutate?
    tileTilePosition.subtract(chunkTilePosition)

    return chunk.getTile(tileTilePosition.x, tileTilePosition.y)
  }

  protected _requestRelativeTile (tileTilePosition: Vec2): ValidTile | undefined {
    const boundingBox = this.boundingBox
    const position = boundingBox.getPosition()
    const selfTilePosition = positionToTilePosition(position)

    // ? Should I mutate?
    tileTilePosition.add(selfTilePosition)

    return this._requestTile(tileTilePosition)
  }

  protected requestTile (tileTilePosition: Vec2): ValidTile | undefined {
    return this.getTile(tileTilePosition.x, tileTilePosition.y) ?? this._requestRelativeTile(tileTilePosition)
  }

  public getTile (x: number, y: number): ValidTile | undefined {
    return this.tiles.get(x)?.get(y)
  }

  public _setTile (tile: ValidTile, x: number, y: number): void {
    const tiles = this.tiles

    const row = tiles.get(x) ?? new Map()
    tiles.set(x, row)

    row.set(y, tile)
  }

  public setTile (tile: ValidTile, tileTilePosition: Vec2): void {
    const { x, y } = tileTilePosition

    this._setTile(tile, x, y)

    this.queueTile(x, y)

    // Nearby

    const boundingBox = this.boundingBox
    const position = boundingBox.getPosition()
    const selfTilePosition = positionToTilePosition(position)

    // ? Should I mutate?
    tileTilePosition.add(selfTilePosition)

    this.queueTileGlobal(tileTilePosition.offset(-1, 0))
    this.queueTileGlobal(tileTilePosition.offset(1, 0))

    this.queueTileGlobal(tileTilePosition.offset(0, -1))
    this.queueTileGlobal(tileTilePosition.offset(0, 1))
  }

  // Tile Rendering

  //                               x           y       Should the tile be cleared?
  //                               |           |       |
  //                               v           v       v
  private readonly queue = new Map<number, Map<number, boolean>>()

  public queueTile (x: number, y: number): void {
    const tile = this.getTile(x, y)

    const isEmpty = tile === undefined // || tile.type === 'air'

    const queue = this.queue

    const tiles = queue.get(x) ?? new Map()
    queue.set(x, tiles)

    tiles.set(y, !isEmpty)
  }

  public queueTileGlobal (tileTilePosition: Vec2): void {
    const tileChunkPosition = tilePositionToChunkPosition(tileTilePosition)

    const chunk = this.getChunk(tileChunkPosition.x, tileChunkPosition.y)

    if (chunk === undefined) return

    const chunkTilePosition = chunkPositionToTilePosition(tileChunkPosition)

    // ? Should I mutate?
    tileTilePosition.subtract(chunkTilePosition)

    chunk.queueTile(tileTilePosition.x, tileTilePosition.y)
  }

  public queueAll (): void {
    const tiles = this.tiles

    for (const [x, row] of tiles) {
      for (const [y] of row) {
        this.queueTile(x, y)
      }
    }
  }

  public renderQueue (): void {
    const canvas = this.canvas

    const context = canvas.getContext('2d')

    if (context === null) return

    const queue = this.queue

    for (const [x, tiles] of queue) {
      for (const [y, clear] of tiles) {
        const tile = this.getTile(x, y)

        if (tile === undefined) return

        const tileTilePosition = new Vec2(x, y)

        const tilePosition = tilePositionToPosition(tileTilePosition)

        const render = tile.getRenderer({
          context,
          position: tilePosition,
          size: TILE_SIZE_VECTOR,
          nearby: this.getNearby(tileTilePosition)
        })

        if (render === undefined) continue

        if (clear) {
          context.clearRect(
            tilePosition.x, tilePosition.y,
            TILE_SIZE_VECTOR.x, TILE_SIZE_VECTOR.y
          )
        }

        render()
      }
    }

    queue.clear()
  }
}
