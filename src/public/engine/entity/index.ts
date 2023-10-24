import type Scene from '../scene'
import type RectangularCollider from '../util/collision/rectangular'
import Frame from '../util/frame'
import { randomArrayFromNumber, randomFromArray } from '../util/math'
import Vec2 from '../util/vec2'
import { Debug as DebugGlobals } from '../../globals'
import AbstractEntity from '../../shared/abstract-entity'

const DEBUG = DebugGlobals.entity

export class Entity<ValidChild extends Entity = Entity<any>> extends AbstractEntity<ValidChild, Scene> {
  // Game Loop

  public draw (frame: Frame): void {
    for (const child of this.children) {
      const childFrame = new Frame(frame)
      childFrame.offset = child.position

      child.draw(childFrame)
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

  declare public parent?: Scene | Entity

  public getRoot (): Scene | undefined {
    return super.getRoot()
  }

  // Position

  public getViewportPosition (): Vec2 {
    const scene = this.getRoot()

    if (scene === undefined) return Vec2.ZERO

    const camera = scene.camera
    const viewport = camera.getViewport()
    const viewportPosition = viewport.getPosition()

    const globalPosition = this.getGlobalPosition()

    return globalPosition.minus(viewportPosition)
  }

  public setViewportPosition (position: Vec2): this {
    const scene = this.getRoot()

    if (scene === undefined) return this

    const camera = scene.camera
    const viewport = camera.getViewport()
    const viewportPosition = viewport.getPosition()

    this.setGlobalPosition(position.plus(viewportPosition))

    return this
  }

  // Collision Detection

  // TODO: Make this accurate (does not work when screen resizes)
  public getViewportCollider (): RectangularCollider | undefined {
    const scene = this.getRoot()

    if (scene === undefined) return

    const collider = this.getGlobalCollider()

    const camera = scene.camera
    const viewport = camera.getViewport()
    const viewportPosition = viewport.getPosition()

    return collider.offset(viewportPosition.scaled(-1))
  }

  // IO

  protected getMouseViewportPosition (): Vec2 | undefined {
    return this.getRoot()?.getMouseViewportPosition()
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

    const scene = this.getRoot()

    if (scene === undefined) return

    const camera = scene.camera
    const viewport = camera.getViewport()
    const viewportPosition = viewport.getPosition()

    return mouseViewportPosition.plus(viewportPosition)
  }
}

export default Entity
