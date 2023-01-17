import isNone from '../is-none.js'
import Frame from '../frame.js'
import Vec2 from '../vec2.js'

export class BaseEntity {
  #children = []

  #game = null
  #mouse = null
  #keyboard = null

  #parent = null

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
    child.setParent(this)

    this.#children.push(child)
  }

  removeChild (child) {
    this.#children = this.#children
      .filter(entity => entity !== child)
  }

  isRoot () {
    return isNone(this.#parent)
  }

  isLeaf () {
    return this.#children.length === 0
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

  setParent (parent) {
    this.#parent = parent

    return this
  }

  getMouse () {
    return this.#mouse
  }

  getKeyboard () {
    return this.#keyboard
  }
}

export default BaseEntity
