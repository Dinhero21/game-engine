import RectangularCollider from './rectangular'
import Vec2 from '../vec2'

export class PointCollider extends RectangularCollider {
  constructor (position: Vec2) {
    super(position, Vec2.ZERO)
  }
}

export default PointCollider
