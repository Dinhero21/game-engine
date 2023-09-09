import type Entity from './entity'
import Camera from './camera'
import Frame from './util/frame'
import Vec2 from './util/vec2'
import mouse from './util/input/mouse'

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
      const childFrame = new Frame(frame)
      childFrame.offset = child.position

      child.draw(childFrame)
    }
  }

  // Entity Relationship

  public readonly children = new Set<Entity>()

  public addChild (child: Entity): this {
    this.children.add(child)

    child.setParent(this)

    child.ready()

    return this
  }

  public removeChild (child: Entity): this {
    this.children.delete(child)

    return this
  }

  public getPath (): number[] {
    return []
  }

  // Position

  public getGlobalPosition (): Vec2 {
    return new Vec2(0, 0)
  }

  // IO

  public getMouseViewportPosition (): Vec2 {
    const camera = this.camera

    const windowSize = new Vec2(window.innerWidth, window.innerHeight)

    const viewport = camera.getViewport()
    const viewportSize = viewport.getSize()

    return mouse.getPosition()
      .divided(windowSize)
      .scaled(viewportSize)
  }
}

export default Scene
