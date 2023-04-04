import AirTile from './air.js'
import TestTile from './test.js'
import SusTile from './sus.js'

export const tiles = {
  air: AirTile,
  test: TestTile,
  sus: SusTile
} as const

export type Tiles = typeof tiles
export type TileType = keyof Tiles
export type TileConstructor = Tiles[TileType]
export type Tile = InstanceType<TileConstructor>

export default tiles
