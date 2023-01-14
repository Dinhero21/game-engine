import Vec2 from '../vec2.js'

export class BaseEntity {
  position = new Vec2(0, 0)
  #game = null
  #parent = null
  #children = []

  // TODO: Find a better description
  // Entity relationship (Parent/Children)

  setParent (entity) {
    this.#parent = entity

    return this
  }

  getParent () {
    return this.#parent
  }

  addChild (child) {
    child.setParent(this)

    this.#children.push(child)

    return this
  }

  removeChild (child) {
    this.#children = this.#children
      .filter(e => e !== child)
  }

  isRoot () {
    return this.#parent === null
  }

  isLeaf () {
    return this.#children.length === 0
  }

  // Game

  setGame (game) {
    this.#game = game
    
    for (const child of this.#children) {
      child.setGame(game)
    }

    return this
  }

  getGame () {
    return this.#game
  }

  getScreenSize () {
    const game = this.getGame()

    return game.getScreenSize()
  }

  // Physics

  getBoundingBoxSize () {
    return screenSize
  }

  colliding (entity) {
    return (
      this.x < entity.x + entity.boundingBoxSize.x &&
      this.x + this.boundingBoxSize.x > entity.x &&
      this.y < entity.y + entity.boundingBoxSize.y &&
      this.x + this.boundingBoxSize.x > entity.y
    )
  }

  // Game Loop

  update (delta) {
    for (const child of this.#children) {
      child.update(delta)
    }
  }

  draw (context) {
    for (const child of this.#children) {
      const entityCanvas = document.createElement('canvas')
      const entityContext = entityCanvas.getContext('2d')

      const boundingBoxSize = child.getBoundingBoxSize()

      entityCanvas.width = boundingBoxSize.x
      entityCanvas.height = boundingBoxSize.y

      child.draw(entityContext)

      const entityScreenPosition = child.position.clone()

      context.drawImage(entityCanvas, entityScreenPosition.x, entityScreenPosition.y)
    }
  }
}

export default BaseEntity