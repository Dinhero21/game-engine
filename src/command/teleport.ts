import type CommandHelper from '../util/command'
import { registerCommand } from '.'
import Vec2 from '../public/engine/util/vec2'

function teleport (helper: CommandHelper): void {
  const [x, y] = helper.args

  if (typeof x !== 'number') throw new TypeError('x must be a number')
  if (typeof y !== 'number') throw new TypeError('y must be a number')

  const player = helper.sender
  const position = new Vec2(x, y)

  player.teleport(position)
}

registerCommand('tp', teleport)
registerCommand('teleport', teleport)
