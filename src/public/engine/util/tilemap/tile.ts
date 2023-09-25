import type Vec2 from '../vec2'
import { type HTMLRenderingContext2D } from '../frame'

// A Tile.getRenderer of undefined means that no rendering needs to be done

export type Nearby = [boolean, boolean, boolean, boolean]

export interface TileRendererData {
  context: HTMLRenderingContext2D
  position: Vec2
  size: Vec2
  nearby: Nearby
}

export class Tile {
  public readonly type
  public readonly light
  public readonly meta
  public readonly collidable
  public readonly getRenderer

  constructor (type: string, light: number, meta: unknown, collidable: boolean, render: (data: TileRendererData) => VoidFunction | undefined) {
    this.type = type
    this.light = light
    this.meta = meta
    this.collidable = collidable
    this.getRenderer = render
  }
}

export default Tile
