import type Vec2 from '../../engine/util/vec2'
import Tile, { type TileRendererData } from '../../engine/util/tilemap/tile'
import { loader } from '../../asset/loader'
import { TILE_SIZE } from '../../engine/util/tilemap/position-conversion'
import { Experiments } from '../../globals'
import _ from 'lodash'

export interface CustomTileRendererData extends TileRendererData {
  position: Vec2
  size: Vec2
  texturePath: string
}

export type CustomTileRenderer = (data: CustomTileRendererData) => void

export const TILE_TEXTURE_SIZE = 8

export async function createTile (type: string, meta: unknown): Promise<Tile> {
  let oldState: readonly any[] = []

  const tileData = await loader.getTileData(type)

  // TODO: Use import * to dynamically define custom renderers

  const RENDERER = new Map<string, CustomTileRenderer>()

  RENDERER.set(
    'water',
    data => {
      if (typeof meta !== 'number') throw new TypeError('Expected WaterTile.meta to be a number')

      const position = data.position
      const size = data.size

      const [up, left, right, down] = data.nearby

      const start = position.clone()
      const end = start.plus(size)

      // Range: [0,8]
      const pressure = meta
      const normalizedPressure = pressure / 8
      const normalizedDelta = 1 - normalizedPressure
      const delta = normalizedDelta * TILE_SIZE

      let deltaStartX = 0
      let deltaStartY = 0
      let deltaEndX = 0
      let deltaEndY = 0

      if (Experiments.cursed_water) {
        if (!up) {
          deltaStartY += delta
        }

        if (!left) {
          deltaStartX += delta
        }

        if (!right) {
          deltaEndX -= delta
        }

        if (!down) {
          deltaEndY -= delta
        }

        if (!up && !down) {
          deltaStartY /= 2
          deltaEndY /= 2
        }

        if (!left && !right) {
          deltaStartX /= 2
          deltaEndX /= 2
        }
      } else {
        if (!up) {
          deltaStartY += delta
        }
      }

      start.x += deltaStartX
      start.y += deltaStartY
      end.x += deltaEndX
      end.y += deltaEndY

      position.update(start)

      size.update(end.minus(start))
    }
  )

  const ELECTRICAL_TILES = ['wire', 'switch']

  const electrical: CustomTileRenderer = data => {
    const active = meta

    data.texturePath += `.${String(active)}`
  }

  for (const tile of ELECTRICAL_TILES) {
    RENDERER.set(
      tile,
      electrical
    )
  }

  const tile = new Tile(type, meta, tileData.collidable, getRenderer)

  return tile

  function getRenderer (data: TileRendererData): VoidFunction | undefined {
    const nearby = data.nearby

    const tileX = (Number(nearby[0]) << 0) + (Number(nearby[1]) << 1)
    const tileY = (Number(nearby[2]) << 0) + (Number(nearby[3]) << 1)

    const x = tileX * TILE_TEXTURE_SIZE
    const y = tileY * TILE_TEXTURE_SIZE

    const position = data.position.clone()
    const size = data.size.clone()

    let texturePath = tileData.texture

    const renderer = RENDERER.get(tileData.type)

    if (renderer !== undefined) {
      const rendererData = {
        ...data,
        position,
        size,
        texturePath
      }

      renderer(rendererData)

      texturePath = rendererData.texturePath
    }

    const texture = loader.getTileTexture(texturePath)

    const context = data.context

    const oldGlobalAlpha = context.globalAlpha

    const STATE = [
      texture,
      x, y,
      position.x, position.y,
      size.x, size.y,
      loader.state
    ] as const

    // TODO: Use some method that is array-specific
    if (_.isEqual(oldState, STATE)) return

    oldState = STATE

    return () => {
      context.drawImage(
        texture,
        x, y,
        TILE_TEXTURE_SIZE, TILE_TEXTURE_SIZE,
        position.x, position.y,
        size.x, size.y
      )

      context.globalAlpha = oldGlobalAlpha
    }
  }
}
