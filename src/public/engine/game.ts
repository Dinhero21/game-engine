import type Entity from './entities/base.js'
import { type None, isNone } from '../none.js'
import Frame from './util/frame.js'
import Keyboard from './util/input/keyboard.js'
import Mouse from './mouse.js'

export class Game {
  private lastTime = Date.now()

  private readonly context: CanvasRenderingContext2D
  public getContext (): CanvasRenderingContext2D {
    return this.context
  }

  constructor (context: CanvasRenderingContext2D) {
    this.context = context

    this.gameLoop()
  }

  private gameLoop (): void {
    const lastTime = this.lastTime
    const now = Date.now()
    const delta = (now - lastTime) / 1000

    this.lastTime = now

    this.update(delta)
    this.draw()

    requestAnimationFrame(() => { this.gameLoop() })
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

  // Entity relationship

  private root: Entity | None

  public setRoot (entity: Entity): this {
    entity.setGameInstance(this)

    this.root = entity

    return this
  }

  public getRoot (): Entity | None {
    return this.root
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
