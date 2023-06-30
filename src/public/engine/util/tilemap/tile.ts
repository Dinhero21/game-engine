import type Vec2 from '../vec2'

export interface TileRendererData {
  position: Vec2
  size: Vec2
}

export type TileRenderer = (context: OffscreenCanvasRenderingContext2D, data: TileRendererData) => void

export class Tile {
  public type: string
  public collidable: boolean
  public render

  constructor (type: string, collidable: boolean, render: TileRenderer) {
    this.type = type
    this.collidable = collidable
    this.render = render
  }
}

export default Tile
