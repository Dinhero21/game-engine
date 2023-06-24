import type RectangularCollider from '../util/collision/rectangular.js'
import Vec2 from '../util/vec2.js'
import Entity from './index.js'

export class ViewportEntity<ValidChild extends Entity = Entity> extends Entity<ValidChild> {
  public getConstantCollider (): RectangularCollider {
    const scene = this.getScene()

    if (scene === undefined) throw new Error('ViewportEntity.getConstantCollider called before scene initialization')

    let parentPosition = new Vec2(0, 0)

    if (this.parent instanceof Entity) parentPosition = this.parent.getViewportPosition()

    const camera = scene.camera

    const viewport = camera.getViewport()

    return viewport.offset(parentPosition)
  }

  public update (delta: number): void {
    super.update(delta)

    this.setViewportPosition(new Vec2(0, 0))
  }
}

export default ViewportEntity
