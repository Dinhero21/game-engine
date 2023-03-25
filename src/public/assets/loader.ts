const textureCache = new Map<string, HTMLImageElement>()

export function loadTexture (name: string): HTMLImageElement {
  let image = textureCache.get(name)

  if (image !== undefined) return image

  image = new Image()
  image.src = `assets/textures/${name}.png`

  textureCache.set(name, image)

  return image
}

export async function loadTextureAsync (name: string): Promise<HTMLImageElement> {
  const texture = loadTexture(name)

  if (texture.complete) return texture

  return await new Promise((resolve, reject) => {
    texture.addEventListener('error', event => {
      reject(new Error(event.error))
    }, { once: true })

    texture.addEventListener('load', event => {
      resolve(texture)
    }, { once: true })
  })
}

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
