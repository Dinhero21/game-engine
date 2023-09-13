import type Scene from './scene'
import Frame from './util/frame'
import Vec2 from './util/vec2'
import RectangularCollider from './util/collision/rectangular'
import { Camera as CameraGlobals, Debug as DebugGlobals } from '../globals'

const INTEGER_APPROXIMATION = CameraGlobals.integer_approximation

export type ViewportGenerator = (camera: Camera) => RectangularCollider

const Align = (anchor: Vec2) => (camera: Camera) => new RectangularCollider(camera.position.minus(camera.size.scaled(anchor)), camera.size)
const TopLeftCorner = Align(new Vec2(0, 0))
const Center = Align(new Vec2(0.5, 0.5))

export const ViewportGenerators = { Align, TopLeftCorner, Center }

export class Camera {
  public clear: boolean = true

  public position: Vec2 = new Vec2(0, 0)
  public size: Vec2 = new Vec2(1920, 1080)

  public ViewportGenerator: ViewportGenerator = ViewportGenerators.TopLeftCorner

  public getViewport (): RectangularCollider {
    const viewport = this.ViewportGenerator(this)

    const viewportSize = viewport.getSize()
    const viewportPosition = viewport.getPosition()

    const scene = this.scene
    const context = scene.context
    const canvas = context.canvas

    const targetSize = new Vec2(canvas.width, canvas.height)

    const scale = Math.min(viewportSize.x / targetSize.x, viewportSize.y / targetSize.y)

    const size = targetSize.scaled(scale)

    const position = viewportPosition
      .minus(this.position)
      .scaled(targetSize.divided(viewportSize))
      .scaled(scale)
      .plus(this.position)

    if (INTEGER_APPROXIMATION) {
      size.floor()
      position.floor()
    }

    return new RectangularCollider(position, size)
  }

  public readonly scene

  constructor (scene: Scene) {
    this.scene = scene
  }

  public render (): void {
    const scene = this.scene
    const context = scene.context
    const canvas = context.canvas

    const canvasSize = new Vec2(canvas.width, canvas.height)

    const viewport = this.getViewport()
    const viewportSize = viewport.getSize()

    // Scene -> Frame -> Context

    if (this.clear) {
      context.clearRect(
        0, 0,
        canvasSize.x, canvasSize.y
      )
    }

    const transform = context.getTransform()

    // When the screen is in a different resolution then used in development (for me, 16:9) we do not want every UI element to resize as that would cause, among other things, alignment issues and overlapping, to prevent that the game is rendered at a constant scaling and clipped and resized at runtime. This is what the code below is for.
    context.scale(
      canvasSize.x / viewportSize.x,
      canvasSize.y / viewportSize.y
    )

    const viewportPosition = viewport.getPosition()

    const frame = new Frame(context)
    frame.offset = viewportPosition.scaled(-1)

    if (DebugGlobals.camera.movable) {
      const viewportSize = viewport.getSize()

      const mousePosition = scene.getMouseViewportPosition()

      const offset = mousePosition.minus(viewportSize.divided(2))

      frame.offset.add(offset)
    }

    // Scene -> Frame
    scene.draw(frame)

    context.setTransform(transform)
  }
}

export default Camera
