import { AirTile } from './air'
import { DirtTile } from './dirt'
import { GrassTile } from './grass'
import { HyperStoneTile } from './hyperstone'
import { StoneTile } from './stone'
import { StructureTile } from './structure'
import Structures from '../structures'

export const Tiles = {
  air: new AirTile({}),
  stone: new StoneTile({}),
  hyperstone: new HyperStoneTile({}),
  dirt: new DirtTile({}),
  grass: new GrassTile({}),
  structure: new StructureTile({
    structure: Structures.test
  })
} as const

export default Tiles
