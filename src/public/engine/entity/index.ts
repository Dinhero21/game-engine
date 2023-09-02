import type Scene from '../scene'
import RectangularCollider from '../util/collision/rectangular'
import Frame from '../util/frame'
import { randomArrayFromNumber, randomFromArray } from '../util/math'
import Vec2 from '../util/vec2'
import { Debug as DebugGlobals } from '../../globals'

const DEBUG = DebugGlobals.entity

export class Entity<ValidChild extends Entity = Entity<any>> {
  // Game Loop

  public ready (): void {}

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

    const path = this.getPath()

    const random = randomFromArray(path)

    const [r, g, b] = randomArrayFromNumber(random, 3)
      .map(i => Math.abs(i / 4294967296) * 0xFF)

    if (DEBUG.tree) {
      const position = this.position

      frame.drawLineRGBA(-position.x, -position.y, 0, 0, r, g, b, 0.5, 3)
    }

    if (DEBUG.path) {
      frame.drawText(path.join('.'), 0, 0, 'white', '16px cursive')
    }

    if (DEBUG.collider) {
      const collider = this.getConstantCollider()
      const position = collider.getPosition()
      const size = collider.getSize()

      frame.drawFancyRectRGBA(
        position.x, position.y,
        size.x, size.y,
        r, g, b, 0.5,
        1
      )
    }
  }

  // Entity Relationship

  public readonly children = new Set<ValidChild>()

  public addChild (child: ValidChild): this {
    this.children.add(child)

    child.setParent(this)

    child.ready()

    return this
  }

  public removeChild (child: ValidChild): this {
    this.children.delete(child)

    child.deleteParent()

    return this
  }

  public getChildren (): ValidChild[] {
    return Array.from(this.children)
  }

  public parent?: Entity | Scene

  public setParent (parent: Entity | Scene): this {
    this.parent = parent

    return this
  }

  public deleteParent (): this {
    this.parent = undefined

    return this
  }

  public getScene (): Scene | undefined {
    return this.parent?.getScene()
  }

  public getPath (): number[] {
    const parent = this.parent

    if (parent === undefined) return []

    const id = Array.from(parent.children)
      .findIndex(child => child === this)

    return [...parent.getPath(), id]
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

  // TODO: Make this accurate (does not work when screen resizes)
  public getViewportCollider (): RectangularCollider | undefined {
    const scene = this.getScene()

    if (scene === undefined) return

    const collider = this.getGlobalCollider()

    const camera = scene.camera
    const viewport = camera.getViewport()
    const viewportPosition = viewport.getPosition()

    return collider.offset(viewportPosition.scaled(-1))
  }

  // IO

  protected getMouseViewportPosition (): Vec2 | undefined {
    return this.getScene()?.getMouseViewportPosition()
  }

  public getMouseParentRelativePosition (): Vec2 | undefined {
    const mouseViewportPosition = this.getMouseViewportPosition()

    if (mouseViewportPosition === undefined) return

    const viewportPosition = this.getViewportPosition()

    return mouseViewportPosition.minus(viewportPosition)
  }

  public getMouseGlobalPosition (): Vec2 | undefined {
    const mouseViewportPosition = this.getMouseViewportPosition()

    if (mouseViewportPosition === undefined) return

    const scene = this.getScene()

    if (scene === undefined) return

    const camera = scene.camera
    const viewport = camera.getViewport()
    const viewportPosition = viewport.getPosition()

    return mouseViewportPosition.plus(viewportPosition)
  }
}

export default Entity
