import Vec2 from '../vec2.js'
import BaseEntity from './base.js'

export class CameraEntity extends BaseEntity {
  size = new Vec2()

  setGame (game) {
    super.setGame(game)

    game.setCamera(this)
  }
}

export default CameraEntity