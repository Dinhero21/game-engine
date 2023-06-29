import { AirTile } from './air.js'
import { HyperStoneTile } from './hyperstone.js'
import { StoneTile } from './stone.js'

export const Tiles = {
  air: new AirTile({}),
  stone: new StoneTile({}),
  hyperstone: new HyperStoneTile({})
} as const

export default Tiles
