import DiskStructure from './disk'
import TestStructure from './test'
import TreeStructure from './tree'

export const Structures = {
  test: new TestStructure({}),
  tree: new TreeStructure({
    height: 5
  }),
  disk: new DiskStructure({
    x: 0,
    y: 0,
    radius: 3,
    tile: undefined
  })
} as const

export default Structures
