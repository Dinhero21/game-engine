import type Vec2 from '../vec2'
import { type HTMLRenderingContext2D } from '../frame'

// A Tile.getRenderer of undefined means that no rendering needs to be done

export interface TileRendererData {
  context: HTMLRenderingContext2D
  position: Vec2
  size: Vec2
  nearby: [boolean, boolean, boolean, boolean]
}

export class Tile {
  public readonly type
  public readonly meta
  public readonly collidable
  public readonly getRenderer

  constructor (type: string, meta: unknown, collidable: boolean, render: (data: TileRendererData) => VoidFunction | undefined) {
    this.type = type
    this.meta = meta
    this.collidable = collidable
    this.getRenderer = render
  }
}

export default Tile
