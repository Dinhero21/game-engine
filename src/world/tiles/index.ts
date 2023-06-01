import AirTile from './air.js'
import DebugTile from './debug.js'
import StoneTile from './stone.js'
import SusTile from './sus.js'

export const tiles = {
  air: AirTile,
  debug: DebugTile,
  stone: StoneTile,
  sus: SusTile
} as const

export type Tiles = typeof tiles
export type TileType = keyof Tiles
export type TileConstructor = Tiles[TileType]
export type Tile = InstanceType<TileConstructor>

export const TileTypes = Object.keys(tiles) as TileType[]

export default tiles
