import { get } from './renderer'
import Tile, { type Nearby, type TileRendererData } from '../../../engine/util/tilemap/tile'
import { loader } from '../../../asset/loader'
import _ from 'lodash'

// TODO: Better system for blacklisted textures
const BLACKLIST = new Set([
  'air'
])

export const TILE_TEXTURE_SIZE = 8

export async function createTile (type: string, light: number, meta: unknown): Promise<Tile> {
  let oldState: readonly any[] = []

  const tileData = await loader.getTileData(type)

  // TODO: Use import * to dynamically define custom renderers

  const tile = new Tile(type, light, meta, tileData.collidable, getRenderer)

  return tile

  function getRenderer (data: TileRendererData): VoidFunction | undefined {
    if (BLACKLIST.has(tileData.type)) {
      if (isStateUnchanged([undefined])) return

      return () => {}
    }

    const [x, y] = getTexturePosition(data.nearby)

    const position = data.position.clone()
    const size = data.size.clone()

    let texturePath = tileData.texture
    let opacity = 1

    const renderer = get(tileData.type)

    if (renderer !== undefined) {
      const rendererData = {
        ...data,
        position,
        size,
        texturePath,
        opacity,
        meta
      }

      renderer(rendererData)

      texturePath = rendererData.texturePath
      opacity = rendererData.opacity
    }

    const texture = loader.getTileTexture(texturePath)

    if (isStateUnchanged([
      texture,
      x, y,
      position.x, position.y,
      size.x, size.y,
      loader.state
    ])) return

    const context = data.context

    return () => {
      const oldFilter = context.filter

      context.filter = `brightness(${Math.min(light ** 2, 1)})`

      const oldGlobalAlpha = context.globalAlpha

      context.globalAlpha = opacity

      context.drawImage(
        texture,
        x, y,
        TILE_TEXTURE_SIZE, TILE_TEXTURE_SIZE,
        position.x, position.y,
        size.x, size.y
      )

      context.globalAlpha = oldGlobalAlpha

      context.filter = oldFilter
    }
  }

  function getTexturePosition (nearby: Nearby): [number, number] {
    const tileX = (Number(nearby[0]) << 0) + (Number(nearby[1]) << 1)
    const tileY = (Number(nearby[2]) << 0) + (Number(nearby[3]) << 1)

    const x = tileX * TILE_TEXTURE_SIZE
    const y = tileY * TILE_TEXTURE_SIZE

    return [x, y]
  }

  function isStateUnchanged (state: any[]): boolean {
    // TODO: Use some method that is array-specific
    const equal = _.isEqual(oldState, state)

    oldState = state

    return equal
  }
}
