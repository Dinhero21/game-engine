import Vec2 from '../../util/vec2.js'
import Entity from '../index.js'

export class UIEntity extends Entity {
  public update (delta: number): void {
    super.update(delta)

    this.setViewportPosition(new Vec2(0, 0))
  }
}

export default UIEntity
