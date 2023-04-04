import type Vec2 from '../public/engine/util/vec2.js'
import type Chunk from './chunk.js'
import { chunkPositionToTilePosition, positionToTilePosition, tilePositionToPosition } from '../public/engine/util/tilemap/position-conversion.js'

// ? Should I call this TileData or just Data?

export interface TileData {
  position: Vec2
  type: string
}

export class Tile {
  private readonly chunk

  public getChunk (): Chunk {
    return this.chunk
  }

  private readonly type

  public getType (): string {
    return this.type
  }

  constructor (chunk: Chunk, data: TileData) {
    this._position = data.position

    this.type = data.type
    this.chunk = chunk
  }

  // Position

  private _position

  // Position (Relative) (Getters)

  public getRelativeTilePosition (): Vec2 {
    return this._position
  }

  public getRelativePosition (): Vec2 {
    const tilePosition = this.getRelativeTilePosition()
    const position = tilePositionToPosition(tilePosition)

    return position
  }

  // Position (Relative) (Setters)

  public setRelativeChunkPosition (chunkPosition: Vec2): void {
    const tilePosition = chunkPositionToTilePosition(chunkPosition)

    this.setRelativeTilePosition(tilePosition)
  }

  public setRelativeTilePosition (tilePosition: Vec2): void {
    // ? Should I update via reference or value?
    // Reference: position.update(value)
    // Value:     position = value
    this._position = tilePosition
  }

  public setRelativePosition (position: Vec2): void {
    const tilePosition = positionToTilePosition(position)

    this.setRelativeTilePosition(tilePosition)
  }

  // Position (Absolute) (Getters)

  public getChunkPosition (): Vec2 {
    const chunk = this.getChunk()

    return chunk.getChunkPosition()
  }

  // ? Should I call it getTilePosition or getAbsoluteTilePosition?
  public getTilePosition (): Vec2 {
    const chunk = this.getChunk()

    const chunkTilePosition = chunk.getTilePosition()
    const relativeTilePosition = this.getRelativeTilePosition()

    return relativeTilePosition.plus(chunkTilePosition)
  }

  // ? Should I call it getPosition or getAbsolutePosition?
  public getPosition (): Vec2 {
    const chunk = this.getChunk()

    const chunkPosition = chunk.getPosition()
    const relativePosition = this.getRelativePosition()

    return relativePosition.plus(chunkPosition)
  }

  // Data Update

  public update (): void {
    const chunk = this.getChunk()
    const world = chunk.getWorld()

    const tilePosition = this.getTilePosition()

    world.setTile('sus', tilePosition, 'change', Math.random() < 0.35 ? 'change' : false)
  }
}

export default Tile
