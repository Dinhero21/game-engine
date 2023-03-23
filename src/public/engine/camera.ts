import type Scene from './scene.js'
import { Camera as CameraGlobals } from '../globals.js'
import Frame from './util/frame.js'
import Vec2 from './util/vec2.js'
import RectangularCollider from './util/collision/rectangular.js'

const INTEGER_APPROXIMATION = CameraGlobals.integer_approximation

export type ViewportGenerator = (camera: Camera) => RectangularCollider

export const ViewportGenerators = {
  TopLeftCorner: (camera: Camera) => new RectangularCollider(camera.position, camera.size),
  Center: (camera: Camera) => new RectangularCollider(camera.position.minus(camera.size.divided(2)), camera.size)
}

export class Camera {
  public position = new Vec2(0, 0)
  public size = new Vec2(1920, 1080)

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

    // TODO: Make this less ugly
    const position = viewportPosition.minus(this.position).scaled(targetSize.divided(viewportSize)).scaled(scale).plus(this.position)

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

    // Scene -> Frame -> Camera Context -> Context

    const frame = new Frame()
    frame.offset = viewport.getPosition().scaled(-1)

    // Scene -> Frame
    scene.draw(frame)

    const viewportCanvas = new OffscreenCanvas(viewportSize.x, viewportSize.y)
    const viewportContext = viewportCanvas.getContext('2d')

    if (viewportContext === null) return

    // Frame -> Camera Context
    frame.draw(viewportContext)

    context.clearRect(0, 0, canvasSize.x, canvasSize.y)

    // Camera Context -> Context
    context.drawImage(viewportCanvas, 0, 0, canvasSize.x, canvasSize.y)
  }
}

export default Camera
