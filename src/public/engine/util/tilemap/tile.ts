import type Vec2 from '../vec2'

export interface TileRendererData {
  position: Vec2
  nearby: [boolean, boolean, boolean, boolean]
}

export type TileRenderer = (context: OffscreenCanvasRenderingContext2D, data: TileRendererData) => void

export class Tile {
  public readonly type: string
  public readonly collidable: boolean
  public readonly render

  constructor (type: string, collidable: boolean, render: TileRenderer) {
    this.type = type
    this.collidable = collidable
    this.render = render
  }
}

export default Tile
