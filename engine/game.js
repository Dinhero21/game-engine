import Frame from './frame.js'
import Mouse from './mouse.js'
import Vec2 from './vec2.js'

export class Game {
  #lastTime = Date.now()

  #context
  #mouse

  #entity = null

  constructor (context) {
    this.#context = context
    
    const canvas = this.getCanvas()
    const mouse = new Mouse(canvas)

    this.#mouse = mouse

    this.gameLoop()
  }

  gameLoop() {
    const delta = Date.now() - this.#lastTime

    this.update(delta)
    this.draw()

    this.#lastTime = Date.now()

    requestAnimationFrame(() => this.gameLoop())
  }

  update (delta) {
    const entity = this.#entity

    if (entity === undefined || entity === null) return

    entity.update(delta)
  }

  draw () {
    const entity = this.#entity

    if (entity === undefined || entity === null) return

    const frame = new Frame()

    frame.offset = entity.position
    
    entity.draw(frame)

    const context = this.#context
    const canvas = context.canvas

    context.clearRect(0, 0, canvas.width, canvas.height)

    frame.draw(this.#context)
  }

  setEntity (entity) {
    entity.setGame(this)

    this.#entity = entity

    return this
  }

  getContext () {
    return this.#context
  }

  getCanvas () {
    const context = this.getContext()

    return context.canvas
  }

  getCanvasSize () {
    const canvas = this.getCanvas()

    return new Vec2(
      canvas.width,
      canvas.height
    )
  }

  getMouse () {
    return this.#mouse
  }
}

export default Game