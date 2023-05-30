import type Scene from './scene.js'
import { Camera as CameraGlobals, Debug as DebugGlobals } from '../globals.js'
import Frame from './util/frame.js'
import Vec2 from './util/vec2.js'
import RectangularCollider from './util/collision/rectangular.js'

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

    if (DebugGlobals.movable_camera) frame.offset.add(scene.getMouseViewportPosition().minus(viewport.getSize().divided(2)))

    // Scene -> Frame
    scene.draw(frame)

    const viewportCanvas = new OffscreenCanvas(viewportSize.x, viewportSize.y)
    const viewportContext = viewportCanvas.getContext('2d')

    if (viewportContext === null) return

    // Frame -> Camera Context
    frame.draw(viewportContext)

    if (this.clear) context.clearRect(0, 0, canvasSize.x, canvasSize.y)

    // Camera Context -> Context
    context.drawImage(viewportCanvas, 0, 0, canvasSize.x, canvasSize.y)
  }
}

export default Camera
