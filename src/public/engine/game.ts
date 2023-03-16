import { type None, isNone } from '../none.js'
import type Entity from './entities/base.js'
import RectangularCollider from './util/collision/rectangular.js'
import Frame from './util/frame.js'
import Keyboard from './util/input/keyboard.js'
import Mouse from './util/input/mouse.js'
import Vec2 from './util/vec2.js'

// TODO: Separate Physics and Rendering logic into 2 separate classes (Game and Camera)
export class Game {
  private readonly context: CanvasRenderingContext2D
  public getContext (): CanvasRenderingContext2D {
    return this.context
  }

  constructor (context: CanvasRenderingContext2D) {
    this.context = context
  }

  public start (): void {
    this.gameLoop()
  }

  private gameLoop (lastTime = Date.now()): void {
    const now = Date.now()
    const delta = (now - lastTime) / 1000

    if (delta !== 0) {
      this.update(delta)
      this.draw()
    }

    requestAnimationFrame(() => { this.gameLoop(now) })
  }

  private update (delta: number): void {
    const root = this.root

    if (isNone(root)) return

    root.update(delta)
  }

  private draw (): void {
    const root = this.root

    if (isNone(root)) return

    const frame = new Frame()
    frame.offset = root.position

    root.draw(frame)

    const context = this.context
    const canvas = context.canvas

    context.clearRect(0, 0, canvas.width, canvas.height)

    frame.draw(context)
  }

  // Entity Relationship

  private root: Entity | None

  public setRoot (entity: Entity): this {
    entity.setGameInstance(this)

    this.root = entity

    return this
  }

  public getRoot (): Entity | None {
    return this.root
  }

  // Collision Detection

  public getBoundingBox (): RectangularCollider {
    const context = this.context
    const canvas = context.canvas

    return new RectangularCollider(
      new Vec2(0, 0),
      new Vec2(canvas.width, canvas.height)
    )
  }

  // IO

  private readonly keyboard: Keyboard = new Keyboard()
  public getKeyboard (): Keyboard {
    return this.keyboard
  }

  private readonly mouse: Mouse = new Mouse()
  public getMouse (): Mouse {
    return this.mouse
  }
}

export default Game
