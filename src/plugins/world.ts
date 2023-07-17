import Plugin from './base'
import { type PluginManager } from './manager'
import { type IServerSocket as ISocket } from '../socket.io'
import { World } from '../world'
import { WorldGen } from '../world/gen'
import { sleep } from '../public/engine/util/sleep'
import Vec2 from '../public/engine/util/vec2'
import { positionToTilePosition, tilePositionToChunkPosition } from '../public/engine/util/tilemap/position-conversion'
import Tiles from '../world/tiles'

const SCREEN_SIZE = new Vec2(1920, 1080)
const HALF_SCREEN_SIZE = SCREEN_SIZE.divided(2)

export class WorldPlugin extends Plugin {
  public readonly gen
  public readonly world

  constructor (manager: PluginManager) {
    super(manager)

    const gen = new WorldGen()
    this.gen = gen

    const world = new World(gen)
    this.world = world

    this.world.on('tile.set', tile => {
      const tilePosition = tile.getTilePosition()

      manager.io.emit('tile.set', tilePosition.toArray(), tile.type)
    })

    void (async () => {
      while (true) {
        const start = performance.now()

        world.tick()

        const end = performance.now()

        const duration = end - start

        const sleepTime = (1000 / 12) - duration

        if (sleepTime < 0) console.warn(`Tick took too long! ${(-sleepTime).toPrecision(3)}ms behind`)

        await sleep(sleepTime)
      }
    })()
  }

  public onConnection (socket: ISocket): void {
    const manager = this.manager
    const plugins = manager.plugins
    const playerPlugin = plugins.player
    const player = playerPlugin.getPlayer(socket.id)

    if (player === undefined) return

    const world = this.world

    socket.on('physics.update', rawPosition => {
      const position = new Vec2(...rawPosition)

      const topLeftScreenPositionPosition = position.minus(HALF_SCREEN_SIZE)
      const bottomRightScreenPositionPosition = position.plus(HALF_SCREEN_SIZE)

      const topLeftScreenTilePosition = positionToTilePosition(topLeftScreenPositionPosition)
      const bottomRightScreenTilePosition = positionToTilePosition(bottomRightScreenPositionPosition)

      const topLeftScreenChunkPosition = tilePositionToChunkPosition(topLeftScreenTilePosition)
      const bottomRightScreenChunkPosition = tilePositionToChunkPosition(bottomRightScreenTilePosition)

      for (let chunkY = topLeftScreenChunkPosition.y; chunkY <= bottomRightScreenChunkPosition.y; chunkY++) {
        for (let chunkX = topLeftScreenChunkPosition.x; chunkX <= bottomRightScreenChunkPosition.x; chunkX++) {
          const chunkPosition = new Vec2(chunkX, chunkY)

          const chunk = world.getChunk(chunkPosition)

          if (chunk.references.has(player)) continue

          const chunkTilePosition = chunk.getTilePosition()

          const tiles = chunk.getTiles()

          for (const [relativeX, row] of tiles.entries()) {
            for (const [relativeY, tile] of row.entries()) {
              const x = relativeX + chunkTilePosition.x
              const y = relativeY + chunkTilePosition.y

              socket.emit('tile.set', [x, y], tile.type)
            }
          }

          chunk.references.add(player)
        }
      }
    })

    socket.on('chunk.remove', rawPosition => {
      const position = new Vec2(...rawPosition)

      const chunk = world.getChunk(position)

      chunk.references.delete(player)

      // TODO: Somehow delete the chunk while storing its data somewhere (file system?)
    })

    // ? Should this be in the World or Inventory Plugin?

    socket.on('tile.click', rawTilePosition => {
      const tilePosition = new Vec2(...rawTilePosition)

      const tile = world.getTile(tilePosition)

      if (tile === undefined) return

      if (tile.type === 'air') {
        const newTileType = player.inventory.getSlot(-1)?.getType() ?? 'air'

        if (!(newTileType in Tiles)) return

        const newTile = Tiles[newTileType as keyof typeof Tiles]

        world.setTile(newTile.instance(), tilePosition, true, true)

        player.inventory.removeAmount(-1, 1)

        return
      }

      if (player.inventory.addItem(tile.type, 1)) world.setTile(Tiles.air.instance(), tilePosition, true, true)
    })
  }
}

export default WorldPlugin
