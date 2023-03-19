import type Entity from './entities/base.js'
import Camera from './camera.js'
import Frame from './util/frame.js'
import Vec2 from './util/vec2.js'
import mouse from './util/input/mouse.js'

// TODO: Make canvas accessible from Entity
export class Scene {
  public context

  public camera = new Camera(this)

  constructor (context: CanvasRenderingContext2D) {
    this.context = context
  }

  public getScene (): Scene {
    return this
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

  private readonly children = new Set<Entity>()

  public addChild (child: Entity): this {
    this.children.add(child)

    child.setParent(this)

    return this
  }

  public removeChild (child: Entity): this {
    this.children.delete(child)

    return this
  }

  // Position

  public getGlobalPosition (): Vec2 {
    return new Vec2(0, 0)
  }

  // IO

  public getMousePosition (): Vec2 {
    const windowSize = new Vec2(window.innerWidth, window.innerHeight)

    const camera = this.camera
    const viewport = camera.getViewport()

    return mouse.getPosition()
      .divided(windowSize)
      .scaled(viewport.getSize())
      .plus(viewport.getPosition())
  }
}

export default Scene
