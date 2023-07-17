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
  protected getTexturePath (name: string): string {
    return `assets/textures/${name}.png`
  }

  private readonly textureCache = new Map<string, HTMLImageElement>()
  public getTexture (name: string): HTMLImageElement {
    const cache = this.textureCache

    let image = cache.get(name)

    if (image !== undefined) return image

    console.log('Requesting texture:', name)

    image = new Image()

    cache.set(name, image)

    image.addEventListener('load', event => {
      if (name === window.localStorage.getItem('bricked')) location.reload()

      const complete = image?.complete

      console.log(
        complete === undefined ? '❓' : complete ? '✅' : '❌',
        'Texture Loaded:', name
      )

      this.dispatchEvent(new Event('load'))
    })

    image.addEventListener('error', event => {
      console.table({
        Name: name,
        Event: 'error'
      })

      console.error(event.error)

      if (image === undefined) throw new Error('Failed to get image during missing texture initialization')

      image.src = this.getTexturePath('missing')
    })

    image.src = this.getTexturePath(name)

    return image
  }

  public getTileTexture (type: string): HTMLImageElement {
    return this.getTexture(`tile/${type}`)
  }

  public getItemTexture (type: string): HTMLImageElement {
    return this.getTexture(`item/${type}`)
  }

  protected getTileDataPath (type: string): string {
    return `assets/tiles/${type}.json`
  }

  private readonly rawTileDataCache = new Map<string, Promise<RawTileData>>()
  public async getRawTileData (type: string): Promise<RawTileData> {
    const cache = this.rawTileDataCache

    let tile = cache.get(type)

    if (tile !== undefined) return await tile

    tile = (async () => {
      const path = this.getTileDataPath(type)
      const response = await fetch(path)

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
