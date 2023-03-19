import type Scene from './scene.js'
import Frame from './util/frame.js'
import Vec2 from './util/vec2.js'
import RectangularCollider from './util/collision/rectangular.js'

export type ViewportGenerator = (camera: Camera) => RectangularCollider

export const ViewportGenerators = {
  TopLeftCorner: (camera: Camera) => new RectangularCollider(camera.position, camera.size),
  Center: (camera: Camera) => {
    const scene = camera.scene
    const context = scene.context
    const canvas = context.canvas

    const size = new Vec2(canvas.width, canvas.height)

    return new RectangularCollider(camera.position.minus(size.divided(2)), camera.size)
  }
}

export class Camera {
  public position = new Vec2(0, 0)
  public size = new Vec2(1920, 1080)

  public ViewportGenerator: ViewportGenerator = ViewportGenerators.TopLeftCorner

  public getViewport (): RectangularCollider {
    return this.ViewportGenerator(this)
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

    // Scene -> Camera Context -> Context

    const frame = new Frame()
    frame.offset = viewport.getPosition().scaled(-1)

    // Scene -> Frame
    scene.draw(frame)

    const cameraSize = viewport.getSize()

    const cameraCanvas = document.createElement('canvas')
    cameraCanvas.width = cameraSize.x
    cameraCanvas.height = cameraSize.y

    const cameraContext = cameraCanvas.getContext('2d')

    if (cameraContext === null) return

    // Frame -> Camera Context
    frame.draw(cameraContext)

    context.clearRect(0, 0, canvasSize.x, canvasSize.y)

    // Camera Context -> Context
    context.drawImage(cameraCanvas, 0, 0, canvasSize.x, canvasSize.y)
  }
}

export default Camera
