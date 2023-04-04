import Tile from './base.js'

export class TestTile extends Tile {
  public type = 'test'

  public update (): void {
    const chunk = this.getChunk()
    const world = chunk.getWorld()

    const tilePosition = this.getTilePosition()

    world.setTile('sus', tilePosition, 'change', Math.random() < 0.35 ? 'change' : false)
  }
}

export default TestTile
