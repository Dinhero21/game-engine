import { AirTile } from './air'
import { DirtTile } from './dirt'
import { GrassTile } from './grass'
import { HyperStoneTile } from './hyperstone'
import { StoneTile } from './stone'

export const Tiles = {
  air: new AirTile({}),
  stone: new StoneTile({}),
  hyperstone: new HyperStoneTile({}),
  dirt: new DirtTile({}),
  grass: new GrassTile({})
} as const

export default Tiles
