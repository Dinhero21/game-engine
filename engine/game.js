import Vec2 from './vec2.js'

export class Game {
  #lastTime = Date.now()
  #context

  #entity

  constructor (context) {
    this.#context = context

    const canvas = context.canvas

    const screenSize = new Vec2(
      canvas.width,
      canvas.height
    )

    this.gameLoop()
  }

  gameLoop () {
    const context = this.#context
    const canvas = context.canvas

    // TODO: Make this configurable
    context.clearRect(0, 0, canvas.width, canvas.height)

    if (this.#entity !== null && this.#entity !== undefined) {
      const delta = Date.now() - this.#lastTime

      this.#entity.update(delta)
      this.#entity.draw(context)

      this.#lastTime = Date.now()
    }

    requestAnimationFrame(() => {
      this.gameLoop()
    })
  }

  setEntity (entity) {
    entity.setGame(this)

    this.#entity = entity
  }

  getContext () {
    return this.#context
  }

  getCanvas () {
    const context = this.getContext()

    return context.canvas
  }

  getScreenSize () {
    const canvas = this.getCanvas()

    const screenSize = new Vec2(
      canvas.width,
      canvas.height
    )

    return screenSize
  }
}

export default Game