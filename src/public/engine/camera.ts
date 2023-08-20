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

  // ! See https://stackoverflow.com/questions/63138513/canvas-drawimage-slow-first-time-another-canvas-is-used-as-the-source-argument
  protected readonly VIEWPORT_CANVAS = new OffscreenCanvas(0, 0)
  protected readonly VIEWPORT_CONTEXT = this.VIEWPORT_CANVAS.getContext('2d')

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

    if (DebugGlobals.camera.movable) frame.offset.add(scene.getMouseViewportPosition().minus(viewport.getSize().divided(2)))

    // Scene -> Frame
    scene.draw(frame)

    const viewportCanvas = this.VIEWPORT_CANVAS
    if (viewportCanvas.width !== viewportSize.x) viewportCanvas.width = viewportSize.x
    if (viewportCanvas.height !== viewportSize.y) viewportCanvas.height = viewportSize.y

    const viewportContext = this.VIEWPORT_CONTEXT

    if (viewportContext === null) throw new Error('Failed to get canvas context')

    if (this.clear) {
      viewportContext.clearRect(
        0, 0,
        viewportSize.x, viewportSize.y
      )
    }

    // Frame -> Camera Context
    frame.draw(viewportContext)

    if (this.clear) {
      context.clearRect(
        0, 0,
        canvasSize.x, canvasSize.y
      )
    }

    // Camera Context -> Context
    context.drawImage(
      viewportCanvas,
      0, 0,
      canvasSize.x, canvasSize.y
    )
  }
}

export default Camera
