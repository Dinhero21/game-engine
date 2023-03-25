import { loadTexture } from '../assets/loader.js'

export function getTileTexture (name: string): HTMLImageElement {
  return loadTexture(name)
}
