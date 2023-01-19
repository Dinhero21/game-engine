import Vec2 from '../vec2.js'
import BaseEntity from './base.js'

export class FixedEntity extends BaseEntity {
  update (delta) {
    // ? Should I update the position before or after super.update?
    this.setGlobalPosition(new Vec2(0, 0))

    super.update(delta)
  }
}

export default FixedEntity
