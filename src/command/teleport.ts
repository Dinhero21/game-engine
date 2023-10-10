import type CommandHelper from '../util/command'
import { registerCommand } from '.'

function teleport (helper: CommandHelper): void {
  const [x, y] = helper.args

  if (typeof x !== 'number') throw new TypeError('x must be a number')
  if (typeof y !== 'number') throw new TypeError('y must be a number')

  const player = helper.sender
  const position = player.position

  position.set(x, y)

  player.sync()
}

registerCommand('tp', teleport)
registerCommand('teleport', teleport)
