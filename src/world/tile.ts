import tiles, { type TileType, type Tiles } from './tiles/index.js'

export function getTile<Name extends TileType> (type: Name): Tiles[Name] {
  return tiles[type]
}
