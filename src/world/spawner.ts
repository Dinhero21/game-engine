import { type World } from '.'
import { PLAYERS } from '../plugin/player'
import { positionToTilePosition, tilePositionToChunkPosition } from '../public/engine/util/tilemap/position-conversion'

export class Spawner {
  private readonly world

  constructor (world: World) {
    this.world = world
  }

  public spawnEntities (): void {
    const world = this.world

    for (const chunk of world.getChunks()) {
      // To avoid entities "popping in", exclude
      // all chunks within players's view range.
      if (chunk.references.size !== 0) continue

      const chunkChunkPosition = chunk.getChunkPosition()

      let nearestPlayerDistance = Infinity

      for (const player of PLAYERS.values()) {
        const playerPosition = player.position
        const playerTilePosition = positionToTilePosition(playerPosition)
        const playerChunkPosition = tilePositionToChunkPosition(playerTilePosition)

        const distance = Math.min(
          Math.abs(playerChunkPosition.x - chunkChunkPosition.x),
          Math.abs(playerChunkPosition.y - chunkChunkPosition.y)
        )

        if (distance < nearestPlayerDistance) {
          nearestPlayerDistance = distance
        }
      }

      if (nearestPlayerDistance > 64) continue
    }
  }
}

export default Spawner
