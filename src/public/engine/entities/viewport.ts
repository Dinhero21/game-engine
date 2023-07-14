import Entity from '.'
import RectangularCollider from '../util/collision/rectangular'
import Vec2 from '../util/vec2'

export class ViewportEntity<ValidChild extends Entity = Entity> extends Entity<ValidChild> {
  public getConstantCollider (): RectangularCollider {
    const scene = this.getScene()

    if (scene === undefined) throw new Error('ViewportEntity.getConstantCollider called before scene initialization')

    const parentGlobalPosition = this.getParentGlobalPosition()

    const camera = scene.camera

    const viewport = camera.getViewport()
    const size = viewport.getSize()

    return new RectangularCollider(parentGlobalPosition, size)
  }

  public update (delta: number): void {
    super.update(delta)

    this.setViewportPosition(new Vec2(0, 0))
  }
}

export default ViewportEntity
