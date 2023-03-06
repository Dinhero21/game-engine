import type Game from '../game.js'
import Frame from '../frame.js'
import Vec2 from '../vec2.js'
import type Keyboard from '../keyboard.js'

export class Entity {
  public position: Vec2 = new Vec2(0, 0)

  // Game

  protected game?: Game

  public setGameInstance (game: Game): this {
    this.game = game

    for (const child of this.children) child.setGameInstance(game)

    return this
  }

  public getKeyboard (): Keyboard | undefined {
    const game = this.game

    if (game === undefined) return

    return game.getKeyboard()
  }

  // Entity relationship

  protected readonly children = new Set<Entity>()

  public addChild (child: Entity): this {
    this.children.add(child)

    const game = this.game
    if (game !== undefined) child.setGameInstance(game)

    return this
  }

  public removeChild (child: Entity): this {
    this.children.delete(child)

    return this
  }

  public draw (frame: Frame): void {
    for (const child of this.children) {
      const childFrame = new Frame()
      childFrame.offset = child.position

      child.draw(childFrame)

      childFrame.draw(frame)
    }
  }

  public update (delta: number): void {
    for (const child of this.children) {
      child.update(delta)
    }
  }
}

export default Entity
