import { register } from '../map'

register(
  'debug',
  data => {
    const context = data.context

    const fillStyle = data.meta

    if (typeof fillStyle !== 'string') throw new TypeError('Expected meta to be a string')

    context.fillStyle = fillStyle

    const position = data.position
    const size = data.size

    context.fillRect(
      position.x, position.y,
      size.x, size.y
    )
  }
)
