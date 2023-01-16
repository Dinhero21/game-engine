import Frame from '../frame.js'
import Vec2 from '../vec2.js'

export class BaseEntity {
  #children = []

  #game = null
  #mouse = null
  #keyboard = null

  position = new Vec2(0, 0)

  // Game loop

  update (delta) {
    for (const child of this.#children) {
      child.update(delta)
    }
  }

  draw (frame) {
    for (const child of this.#children) {
      const childFrame = new Frame()

      child.draw(childFrame)

      childFrame.offset = child.position

      childFrame.draw(frame)
    }
  }

  // Entity relationship

  addChild (child) {
    child.setGame(this.#game)

    this.#children.push(child)
  }

  removeChild (child) {
    this.#children = this.#children
      .filter(entity => entity !== child)
  }

  // Getter/Setters

  setGame (game) {
    this.#game = game

    this.#mouse = game.getMouse()
    this.#keyboard = game.getKeyboard()

    for (const child of this.#children) {
      child.setGame(game)
    }

    return this
  }

  getGame () {
    return this.#game
  }

  getMouse () {
    return this.#mouse
  }

  getKeyboard () {
    return this.#keyboard
  }
}

export default BaseEntity
