import RectangularCollider from './rectangular.js'
import Vec2 from '../vec2.js'

export class PointCollider extends RectangularCollider {
  constructor (position: Vec2) {
    super(position, new Vec2(0, 0))
  }
}

export default PointCollider
