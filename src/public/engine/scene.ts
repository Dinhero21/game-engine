import type Entity from './entity'
import Camera from './camera'
import Frame from './util/frame'
import Vec2 from './util/vec2'
import mouse from './util/input/mouse'
import RootEntity from '../shared/root-entity'

// TODO: Make canvas accessible from Entity
export class Scene extends RootEntity<Entity> {
  public context

  public camera = new Camera(this)

  constructor (context: CanvasRenderingContext2D) {
    super()

    this.context = context
  }

  public getRoot (): Scene {
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

  // TODO: Remove if redundant
  public getPath (): number[] {
    return []
  }

  // Position

  public getGlobalPosition (): Vec2 {
    return Vec2.ZERO
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
