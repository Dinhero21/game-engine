import type Vec2 from '../vec2'

export interface TileRendererData {
  position: Vec2
  nearby: [boolean, boolean, boolean, boolean]
}

export type TileRenderer = (context: OffscreenCanvasRenderingContext2D, data: TileRendererData) => void

export class Tile {
  public readonly type
  public readonly meta
  public readonly collidable
  public readonly render

  constructor (type: string, meta: unknown, collidable: boolean, render: TileRenderer) {
    this.type = type
    this.meta = meta
    this.collidable = collidable
    this.render = render
  }
}

export default Tile
