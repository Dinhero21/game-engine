import Vec2 from '../util/vec2.js'
import Entity from './index.js'

export class ViewportRelativeEntity<ValidChild extends Entity = Entity> extends Entity<ValidChild> {
  protected anchor

  constructor (anchor: Vec2 = new Vec2(0, 0)) {
    super()

    this.anchor = anchor
  }

  public update (delta: number): void {
    super.update(delta)

    const scene = this.getScene()

    if (scene === undefined) return

    const camera = scene.camera
    const viewport = camera.getViewport()
    const viewportSize = viewport.getSize()

    const anchor = this.anchor

    const position = viewportSize.scaled(anchor)

    this.setViewportPosition(position)
  }
}

export default ViewportRelativeEntity
