import isNone from './is-none.js'
import Frame from './frame.js'
import Mouse from './mouse.js'
import { Keyboard } from './keyboard.js'

export class Game {
  #lastTime = Date.now()

  #context
  #mouse
  #keyboard

  #entity = null

  constructor (context) {
    this.#context = context

    const canvas = this.getCanvas()
    const mouse = new Mouse(canvas)

    this.#mouse = mouse

    this.#keyboard = new Keyboard()

    this.gameLoop()
  }

  // Game loop

  gameLoop () {
    const delta = Date.now() - this.#lastTime

    this.update(delta)
    this.draw()

    this.#lastTime = Date.now()

    requestAnimationFrame(() => this.gameLoop())
  }

  update (delta) {
    const entity = this.#entity

    if (isNone(entity)) return

    entity.update(delta)
  }

  draw () {
    const entity = this.#entity

    if (isNone(entity)) return

    const frame = new Frame()

    frame.offset = entity.getPosition()

    entity.draw(frame)

    const context = this.#context
    const canvas = context.canvas

    context.clearRect(0, 0, canvas.width, canvas.height)

    frame.draw(this.#context)
  }

  // Getter/Setters

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

  getMouse () {
    return this.#mouse
  }

  getKeyboard () {
    return this.#keyboard
  }
}

export default Game
