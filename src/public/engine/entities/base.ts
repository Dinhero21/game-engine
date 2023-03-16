import type Scene from '../scene.js'
import mouse from '../util/input/mouse.js'
import RectangularCollider from '../util/collision/rectangular.js'
import Frame from '../util/frame.js'
import Vec2 from '../util/vec2.js'

export class Entity<Children extends Entity = Entity<any>> {
  public update (delta: number): void {
    for (const child of this.children) {
      child.update(delta)
    }
  }

  public draw (frame: Frame): void {
    for (const child of this.children) {
      const childFrame = new Frame()
      childFrame.offset = child.position

      child.draw(childFrame)

      childFrame.draw(frame)
    }
  }

  public getScene (): Scene | undefined {
    const parent = this.parent

    if (parent === undefined) return

    return parent.getScene()
  }

  // Entity Relationship

  protected readonly children = new Set<Children>()

  public addChild (child: Children): this {
    this.children.add(child)

    child.setParent(this)

    return this
  }

  public removeChild (child: Children): this {
    this.children.delete(child)

    return this
  }

  protected parent?: Entity

  public setParent (parent: Entity): this {
    this.parent = parent

    return this
  }

  // Position

  public position: Vec2 = new Vec2(0, 0)

  protected getParentGlobalPosition (): Vec2 {
    return this.parent?.getGlobalPosition() ?? new Vec2(0, 0)
  }

  public getGlobalPosition (): Vec2 {
    return this.position.plus(this.getParentGlobalPosition())
  }

  // Collision Detection

  protected size: Vec2 = new Vec2(0, 0)

  public getBoundingBox (): RectangularCollider {
    return new RectangularCollider(
      this.position,
      this.size
    )
  }

  // IO

  protected getMousePosition (): Vec2 | undefined {
    return mouse.getPosition()
  }

  protected getGlobalMousePosition (): Vec2 | undefined {
    const mousePosition = this.getMousePosition()

    if (mousePosition === undefined) return

    return mousePosition.minus(this.getGlobalPosition())
  }
}

export default Entity
