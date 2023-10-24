import { io } from './web'
import { getPlayer } from './player'
import world from './world'
import Vec2 from '../public/engine/util/vec2'
import Tiles from '../world/tile'

io.on('connection', socket => {
  const player = getPlayer(socket.id)

  if (player === undefined) return

  socket.on('tile.click', (rawTilePosition, button) => {
    const tilePosition = Vec2.fromArray(rawTilePosition)

    switch (button) {
      case 'left':
        onLeftClick(tilePosition)
        break
      case 'right':
        onRightClick(tilePosition)
        break
      default:
        // ? Should I throw an error here? This might lead to a server-crashing exploit.
        throw new Error(`Unknown tile click button: ${JSON.stringify(button)}`)
    }
  })

  function onLeftClick (tilePosition: Vec2): void {
    if (player === undefined) return

    const tile = world.getTile(tilePosition, true)

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
  }

  function onRightClick (tilePosition: Vec2): void {
    if (player === undefined) return

    const tile = world.getTile(tilePosition, true)

    if (tile === undefined) return

    tile.onInteraction(player)
  }
})
