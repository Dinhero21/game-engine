import type Entity from './entities/base.js'
import { type None, isNone } from '../none.js'
import Frame from './frame.js'

export class Game {
  private readonly context: CanvasRenderingContext2D
  private lastTime = Date.now()

  public root?: Entity | None

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
}

export default Game
