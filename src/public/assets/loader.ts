export class TextureLoader extends EventTarget {
  private readonly cache = new Map<string, HTMLImageElement>()

  public loadTexture (name: string): HTMLImageElement {
    const cache = this.cache

    let image = cache.get(name)

    if (image !== undefined) return image

    image = new Image()
    image.src = `assets/textures/${name}.png`

    cache.set(name, image)

    image.addEventListener('load', event => {
      this.dispatchEvent(new Event('load'))
    })

    return image
  }
}

export const textureLoader = new TextureLoader()

export interface Tile {
  texture: string
  collidable: boolean
}

const tileCache = new Map<string, Tile>()

export async function loadTile (name: string): Promise<Tile> {
  let tile = tileCache.get(name)

  if (tile !== undefined) return tile

  const response = await fetch(`assets/tiles/${name}.json`)

  tile = await response.json() as Tile

  tileCache.set(name, tile)

  return tile
}
