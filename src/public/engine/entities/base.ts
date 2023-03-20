import type Scene from '../scene.js'
import type RectangularCollider from '../util/collision/rectangular.js'
import Frame from '../util/frame.js'
import Vec2 from '../util/vec2.js'

export class Entity<Children extends Entity = Entity<any>> {
  public getScene (): Scene | undefined {
    return this.parent?.getScene()
  }

  // Game Loop

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

  protected parent?: Entity | Scene

  public setParent (parent: Entity | Scene): this {
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

  public getBoundingBox (): RectangularCollider | null {
    return null
  }

  // IO

  protected getMousePosition (): Vec2 | undefined {
    return this.getScene()?.getMousePosition()
  }

  protected getGlobalMousePosition (): Vec2 | undefined {
    return this.getMousePosition()?.minus(this.getGlobalPosition())
  }
}

export default Entity
