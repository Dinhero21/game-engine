import isNone from '../is-none.js'
import Frame from '../frame.js'
import Vec2 from '../vec2.js'

export class BaseEntity {
  #children = []

  #game = null
  #mouse = null
  #keyboard = null

  #parent = null

  #position = new Vec2(0, 0)

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

      childFrame.offset = child.getPosition()

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
    const parent = this.getParent()

    return isNone(parent)
  }

  isLeaf () {
    return this.#children.length === 0
  }

  setParent (parent) {
    this.#parent = parent

    return this
  }

  getParent () {
    return this.#parent
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

  getPosition () {
    return this.#position.clone()
  }

  setPosition (position) {
    this.#position = position

    return this
  }

  getGlobalPosition () {
    const position = this.getPosition()

    if (this.isRoot()) return position

    const parent = this.getParent()
    const parentGlobalPosition = parent.getGlobalPosition()

    const globalPosition = position.plus(parentGlobalPosition)

    return globalPosition
  }

  setGlobalPosition (globalPosition) {
    if (this.isRoot()) {
      this.setPosition(globalPosition)

      return this
    }

    const parent = this.getParent()
    const parentGlobalPosition = parent.getGlobalPosition()

    const position = globalPosition.minus(parentGlobalPosition)

    this.setPosition(position)

    return this
  }

  // IO

  // Mouse

  getMousePosition () {
    const mouse = this.getMouse()

    return mouse.getPosition()
  }

  getMouseGlobalPosition () {
    const mousePosition = this.getMousePosition()

    return mousePosition.plus(this.getGlobalPosition())
  }

  // Collision

  getBoundingBox () {
    return new Vec2(256, 256)
  }

  isCollidingWith (entity) {
    const position = this.getPosition()
    const boundingBox = this.getBoundingBox()

    const entityPosition = entity.getPosition()
    const entityBoundingBox = entity.getBoundingBox()

    return (
      position.x < entityPosition.x + entityBoundingBox.x &&
      position.x + boundingBox.x > entityPosition.x &&
      position.y < entityPosition.y + entityBoundingBox.y &&
      boundingBox.y + position.y > entityPosition.y
    )
  }
}

export default BaseEntity
