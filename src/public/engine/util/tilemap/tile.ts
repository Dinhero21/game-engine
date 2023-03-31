import type Vec2 from '../vec2'

export interface TileRendererData {
  position: Vec2
  size: Vec2
}

export type TileRenderer = (context: OffscreenCanvasRenderingContext2D, data: TileRendererData) => void

export class Tile {
  public name: string
  public collidable: boolean
  public render

  constructor (name: string, collidable: boolean, render: TileRenderer) {
    this.name = name
    this.collidable = collidable
    this.render = render
  }
}

export default Tile
