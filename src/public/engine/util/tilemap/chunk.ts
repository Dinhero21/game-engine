import Vec2, { vec2ToString, stringToVec2 } from '../vec2.js'
import { TILE_SIZE, chunkPositionToTilePosition, tilePositionToPosition } from './position-conversion.js'
import RectangularCollider from '../collision/rectangular.js'
import { textureLoader } from '../../../assets/loader.js'

const tileSize = new Vec2(TILE_SIZE, TILE_SIZE)

export interface Tile {
  id: string
  collider?: RectangularCollider
}

export interface TileRendererTile {
  id: string
  position: Vec2
  size: Vec2
}

export type TileRenderer = (context: OffscreenCanvasRenderingContext2D, tile: TileRendererTile) => void

export function defaultTileRenderer (context: OffscreenCanvasRenderingContext2D, tile: TileRendererTile): void {
  const id = tile.id
  const position = tile.position
  const size = tile.size

  const texture = textureLoader.loadTexture(id)

  // TODO: Make it not specify size if texture.size === size to maybe increase performance
  context.drawImage(texture, position.x, position.y, size.x, size.y)
}

// TODO: "Global" Chunk Cache

export class Chunk {
  public tiles = new Map<string, Tile>()
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

      this.render(context, {
        id: tile.id,
        position: tilePosition,
        size: tileSize
      })
    }

    const image = canvas.transferToImageBitmap()

    if (cache) this.cache = image

    return image
  }

  private readonly render

  constructor (chunkPosition: Vec2, chunkTileSize: Vec2, renderer: TileRenderer = defaultTileRenderer) {
    const tilePosition = chunkPositionToTilePosition(chunkPosition)
    const position = tilePositionToPosition(tilePosition)

    const size = tilePositionToPosition(chunkTileSize)

    this.boundingBox = new RectangularCollider(position, size)

    this.render = renderer
  }

  public setTile (tile: Tile, tilePosition: Vec2): void {
    const id = vec2ToString(tilePosition)

    this.tiles.set(id, tile)
  }

  public touching (other: RectangularCollider): boolean {
    return this.boundingBox.touching(other) && Array.from(this.tiles.values()).some(tile => tile.collider?.touching(other))
  }

  public overlapping (other: RectangularCollider): boolean {
    return this.boundingBox.overlapping(other) && Array.from(this.tiles.values()).some(tile => tile.collider?.overlapping(other))
  }

  public colliding (other: RectangularCollider): boolean {
    return this.boundingBox.colliding(other) && Array.from(this.tiles.values()).some(tile => tile.collider?.colliding(other))
  }
}
