import { type Tile, Chunk } from '../util/tilemap/chunk.js'
import type Frame from '../util/frame.js'
import Vec2 from '../util/vec2.js'
import Entity from './base.js'

export class TileMapEntity extends Entity {
  protected chunks: Chunk[] = []

  public draw (frame: Frame): void {
    super.draw(frame)

    for (const chunk of this.chunks) {
      for (const tile of chunk.tiles) {
        const position = tile.position
        const size = tile.size
        const id = tile.id

        frame.drawRectRGBA(
          position.x,
          position.y,
          size.x,
          size.y,
          id % 2 === 0 ? 0x10 : 0x20,
          id % 2 === 0 ? 0x10 : 0x20,
          id % 2 === 0 ? 0x10 : 0x20
        )
      }
    }
  }

  public setTile (position: Vec2, id: number): void {
    const size = new Vec2(32, 32)

    position = position
      .floor()
      .scaled(size)

    const tile: Tile = { position, size, id }

    const chunkPosition = tile.position
      .divided(size)
      .floored()
      .scaled(size)

    let chunk = this.chunks.find(chunk => chunk.position.equals(chunkPosition))

    if (chunk === undefined) {
      chunk = new Chunk(chunkPosition, size)
      this.chunks.push(chunk)
    }

    chunk.setTile(tile)
  }
}
