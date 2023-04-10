import type Scene from '../scene.js'
import RectangularCollider from '../util/collision/rectangular.js'
import Frame from '../util/frame.js'
import Vec2 from '../util/vec2.js'

export class Entity<ValidChild extends Entity = Entity<any>> {
  // Game LoopZ

  public update (delta: number): void {
    for (const child of this.children) child.update(delta)
  }

  public draw (frame: Frame): void {
    for (const child of this.children) {
      const childFrame = new Frame()
      childFrame.offset = child.position

      child.draw(childFrame)

      childFrame.draw(frame)
    }
  }

  // Entity Relationship

  protected readonly children = new Set<ValidChild>()

  public addChild (child: ValidChild): this {
    this.children.add(child)

    child.setParent(this)

    return this
  }

  public removeChild (child: ValidChild): this {
    this.children.delete(child)

    return this
  }

  protected parent?: Entity | Scene

  public setParent (parent: Entity | Scene): this {
    this.parent = parent

    return this
  }

  public getScene (): Scene | undefined {
    return this.parent?.getScene()
  }

  // Position

  public position: Vec2 = new Vec2(0, 0)

  protected getParentGlobalPosition (): Vec2 {
    return this.parent?.getGlobalPosition() ?? new Vec2(0, 0)
  }

  public getGlobalPosition (): Vec2 {
    return this.position.plus(this.getParentGlobalPosition())
  }

  public setGlobalPosition (position: Vec2): this {
    this.position = position.minus(this.getParentGlobalPosition())

    return this
  }

  public getViewportPosition (): Vec2 {
    const scene = this.getScene()

    if (scene === undefined) return new Vec2(0, 0)

    const camera = scene.camera
    const viewport = camera.getViewport()
    const viewportPosition = viewport.getPosition()

    const globalPosition = this.getGlobalPosition()

    return globalPosition.minus(viewportPosition)
  }

  public setViewportPosition (position: Vec2): this {
    const scene = this.getScene()

    if (scene === undefined) return this

    const camera = scene.camera
    const viewport = camera.getViewport()
    const viewportPosition = viewport.getPosition()

    this.setGlobalPosition(position.plus(viewportPosition))

    return this
  }

  // Collision Detection

  // TODO: Find a better name
  public getConstantCollider (): RectangularCollider {
    return new RectangularCollider(new Vec2(0, 0), new Vec2(0, 0))
  }

  public getParentRelativeCollider (): RectangularCollider {
    const collider = this.getConstantCollider()

    const position = this.position

    return collider.offset(position)
  }

  public getGlobalCollider (): RectangularCollider {
    const collider = this.getConstantCollider()

    const globalPosition = this.getGlobalPosition()

    return collider.offset(globalPosition)
  }

  public getViewportCollider (): RectangularCollider {
    const collider = this.getConstantCollider()

    const viewportPosition = this.getViewportPosition()

    return collider.offset(viewportPosition)
  }

  // IO

  protected getMousePosition (): Vec2 | undefined {
    return this.getScene()?.getMousePosition()
  }

  public getGlobalMousePosition (): Vec2 | undefined {
    return this.getMousePosition()?.minus(this.getGlobalPosition())
  }
}

export default Entity
