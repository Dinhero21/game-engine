import type Scene from './scene.js'
import Frame from './util/frame.js'
import Vec2 from './util/vec2.js'

export class Camera {
  public position = new Vec2(0, 0)
  public size = new Vec2(1920, 1080)

  private readonly scene

  constructor (scene: Scene) {
    this.scene = scene
  }

  public drawLoop (callback: () => void): void {
    callback()

    setTimeout(() => { this.drawLoop(callback) })
  }

  public draw (context: CanvasRenderingContext2D): void {
    const scene = this.scene

    const canvas = context.canvas

    const canvasSize = new Vec2(canvas.width, canvas.height)

    const position = this.position

    const cameraSize = this.size

    // Scene -> Camera Context -> Context

    const frame = new Frame()

    // Scene -> Frame
    scene.draw(frame)

    const cameraCanvas = document.createElement('canvas')
    cameraCanvas.width = cameraSize.x
    cameraCanvas.height = cameraSize.y

    const cameraContext = cameraCanvas.getContext('2d')

    if (cameraContext === null) return

    // Frame -> Camera Context
    frame.draw(cameraContext)

    context.clearRect(0, 0, canvasSize.x, canvasSize.y)

    // Camera Context -> Context
    context.drawImage(cameraCanvas, -position.x, -position.y, canvasSize.x, canvasSize.y)
  }
}

export default Camera
