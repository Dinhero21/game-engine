import { AirTile } from './air'
import { DirtTile } from './dirt'
import { GrassTile } from './grass'
import { HyperStoneTile } from './hyperstone'
import { LeavesTile } from './leaves'
import { StoneTile } from './stone'
import { StructureTile } from './structure'
import { TrunkTile } from './trunk'

export const Tiles = {
  air: new AirTile({}),
  stone: new StoneTile({}),
  hyperstone: new HyperStoneTile({}),
  dirt: new DirtTile({}),
  grass: new GrassTile({}),
  structure: new StructureTile({
    structure: undefined,
    safeTiles: new Set([
      'structure',
      'air'
    ])
  }),
  leaves: new LeavesTile({}),
  trunk: new TrunkTile({})
} as const

export default Tiles
