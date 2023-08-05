import RectangularCollider from './rectangular'
import Vec2 from '../vec2'

export class PointCollider extends RectangularCollider {
  constructor (position: Vec2) {
    super(position, new Vec2(0, 0))
  }
}

export default PointCollider
