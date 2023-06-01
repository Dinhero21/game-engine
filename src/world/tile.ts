import tiles, { type TileType, type Tiles } from './tiles/index.js'

export function getTile<Type extends TileType> (type: Type): Tiles[Type] {
  return tiles[type]
}
