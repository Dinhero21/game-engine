import Frame from './frame.js'

export class Game {
  #lastTime = Date.now()
  #context

  #entity = null

  constructor (context) {
    this.#context = context

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
    this.#entity = entity

    return this
  }
}

export default Game