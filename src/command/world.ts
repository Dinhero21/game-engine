import { registerCommand } from '.'
import chat from '../plugin/chat'
import world from '../plugin/world'

registerCommand('world', helper => {
  const player = helper.sender

  const [subcommand] = helper.args

  if (typeof subcommand !== 'string') throw new TypeError('subcommand must be a string')

  const SUBCOMMANDS = new Map<string, VoidFunction>()

  SUBCOMMANDS.set('sync', () => {
    let tiles = 0

    for (const chunk of world.getChunks()) {
      if (!chunk.references.has(player)) continue

      for (const tile of chunk.getTiles()) {
        tiles++

        world.syncTile(tile)
      }
    }

    chat.writeMessage(`Synced ${tiles} tiles`)
  })

  SUBCOMMANDS.set('clear', () => {
    world.getChunkMap().clear()
  })

  const f = SUBCOMMANDS.get(subcommand)

  if (f === undefined) throw new Error(`Unknown subcommand${JSON.stringify(subcommand)}`)

  f()
})
