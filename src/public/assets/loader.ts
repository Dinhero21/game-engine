export interface RawTileData {
  texture: string
  collidable: boolean
}

// TODO: Add texture as HTMLImageElement or OffscreenCanvas (or something else)
export interface TileData {
  name: string
  collidable: boolean
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
      throw new Error(`Could not load ${name}`)
    })

    return image
  }

  private readonly rawTileDataCache = new Map<string, Promise<RawTileData>>()
  public async getRawTileData (name: string): Promise<RawTileData> {
    const cache = this.rawTileDataCache

    let tile = cache.get(name)

    if (tile !== undefined) return await tile

    tile = (async () => {
      const response = await fetch(`assets/tiles/${name}.json`)

      return await response.json()
    })()

    cache.set(name, tile)

    return await tile
  }

  public async getTileData (name: string): Promise<TileData> {
    const rawTileData = await this.getRawTileData(name)

    return {
      name,
      collidable: rawTileData.collidable
    }
  }
}

export const loader = new AssetLoader()
