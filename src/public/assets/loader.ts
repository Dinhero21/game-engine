export interface RawTileData {
  texture: string
  collidable: boolean
}

// TODO: Add texture as HTMLImageElement or OffscreenCanvas (or something else)
export interface TileData {
  type: string
  collidable: boolean
  texture: string
}

export class AssetLoader extends EventTarget {
  private readonly textureCache = new Map<string, HTMLImageElement>()
  public getTexture (name: string): HTMLImageElement {
    const cache = this.textureCache

    let image = cache.get(name)

    if (image !== undefined) return image

    image = new Image()
    image.src = `assets/textures/${name}.png`

    cache.set(name, image)

    image.addEventListener('load', event => {
      this.dispatchEvent(new Event('load'))
    })

    image.addEventListener('error', event => {
      if (image === undefined) throw new Error('Failed to get image during missing texture initialization')

      image.src = this.getTexture('missing').src
    })

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
      const response = await fetch(`assets/tiles/${type}.json`)

      return await response.json()
    })()

    cache.set(type, tile)

    return await tile
  }

  public async getTileData (type: string): Promise<TileData> {
    const rawTileData = await this.getRawTileData(type)

    return {
      type,
      collidable: rawTileData.collidable,
      texture: rawTileData.texture
    }
  }
}

export const loader = new AssetLoader()
