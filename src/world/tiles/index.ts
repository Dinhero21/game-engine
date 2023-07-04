import { AirTile } from './air.js'
import { DirtTile } from './dirt.js'
import { GrassTile } from './grass.js'
import { HyperStoneTile } from './hyperstone.js'
import { StoneTile } from './stone.js'

export const Tiles = {
  air: new AirTile({}),
  stone: new StoneTile({}),
  hyperstone: new HyperStoneTile({}),
  dirt: new DirtTile({}),
  grass: new GrassTile({})
} as const

export default Tiles
