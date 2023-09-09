import { setOrigin } from '../engine/util/debug'

export interface RawTileData {
  texture: string
  collidable: boolean
  connects: string[]
}

// TODO: Add texture as HTMLImageElement or OffscreenCanvas (or something else)
export interface TileData {
  type: string
  collidable: boolean
  texture: string
  connects: string[]
}

export class AssetLoader extends EventTarget {
  private readonly textureCache = new Map<string, HTMLImageElement>()
  public getTexture (name: string): HTMLImageElement {
    const cache = this.textureCache

    let image = cache.get(name)

    if (image !== undefined) return image

    image = new Image()

    setOrigin(image, `${this.constructor.name}.getTexture(${name})`)

    cache.set(name, image)

    image.addEventListener('load', event => {
      this.dispatchEvent(new Event('load'))
    })

    image.addEventListener('error', event => {
      if (image === undefined) throw new Error('Failed to get image during missing texture initialization')

      image.src = this.getTexture('missing').src
    })

    image.src = `asset/texture/${name}.png`

    return image
  }

  public getTileTexture (type: string): HTMLImageElement {
    return this.getTexture(`tile/${type}`)
  }

  public getItemTexture (type: string): HTMLImageElement {
    return this.getTexture(`item/${type}`)
  }

  private readonly rawTileDataCache = new Map<string, Promise<RawTileData>>()
  public async getRawTileData (type: string): Promise<RawTileData> {
    const cache = this.rawTileDataCache

    let tile = cache.get(type)

    if (tile !== undefined) return await tile

    tile = (async () => {
      const response = await fetch(`asset/tile/${type}.json`)

      return await response.json()
    })()

    cache.set(type, tile)

    return await tile
  }

  private readonly tileDataCache = new Map<string, TileData>()
  public async getTileData (type: string): Promise<TileData> {
    const cache = this.tileDataCache

    const cached = cache.get(type)

    if (cached !== undefined) return cached

    const rawTileData = await this.getRawTileData(type)

    const data = {
      type,
      collidable: rawTileData.collidable,
      texture: rawTileData.texture,
      connects: rawTileData.connects
    }

    cache.set(type, data)

    return data
  }

  public getConnects (type: string): string[] {
    const cache = this.tileDataCache

    const data = cache.get(type)

    if (data === undefined) {
      void this.getTileData(type)

      return []
    }

    return data.connects
  }
}

export const loader = new AssetLoader()
