// ! ============================ ! //
// ! === DO NOT LOAD DIRECTLY === ! //
// ! ============================ ! //

// See index

import type Vec2 from '../../../../engine/util/vec2'
import { type TileRendererData } from '../../../../engine/util/tilemap/tile'

export interface CustomTileRendererData extends TileRendererData {
  position: Vec2
  size: Vec2
  texturePath: string
  opacity: number
  meta: unknown
}

export type CustomTileRenderer = (data: CustomTileRendererData) => void

const RENDERER = new Map<string, CustomTileRenderer>()

export function register (type: string, renderer: CustomTileRenderer): void {
  RENDERER.set(type, renderer)
}

export function get (type: string): CustomTileRenderer | undefined {
  return RENDERER.get(type)
}
