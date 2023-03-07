import type Game from '../game.js'
import Frame from '../util/frame.js'
import Vec2 from '../vec2.js'
import type Keyboard from '../util/input/keyboard.js'
import type Mouse from '../mouse.js'
import { BoundingBox } from '../bounding-box.js'

export class Entity {
  // Entity Relationship

  protected readonly children = new Set<Entity>()

  public addChild (child: Entity): this {
    this.children.add(child)

    const game = this.game
    if (game !== undefined) child.setGameInstance(game)

    child.setParent(this)

    return this
  }

  public removeChild (child: Entity): this {
    this.children.delete(child)

    return this
  }

  protected parent?: Entity

  public setParent (parent: Entity): this {
    this.parent = parent

    return this
  }

  public position: Vec2 = new Vec2(0, 0)

  protected getParentGlobalPosition (): Vec2 {
    return this.parent?.getGlobalPosition() ?? new Vec2(0, 0)
  }

  public getGlobalPosition (): Vec2 {
    return this.position.plus(this.getParentGlobalPosition())
  }

  // Collision Detection

  public getBoundingBox (): BoundingBox {
    return new BoundingBox(
      this.position,
      new Vec2(0, 0)
    )
  }

  // Game

  protected game?: Game

  public setGameInstance (game: Game): this {
    this.game = game

    for (const child of this.children) child.setGameInstance(game)

    return this
  }

  public getGlobalContext (): CanvasRenderingContext2D | undefined {
    const game = this.game

    if (game === undefined) return

    return game.getContext()
  }

  public getKeyboard (): Keyboard | undefined {
    const game = this.game

    if (game === undefined) return

    return game.getKeyboard()
  }

  public getMouse (): Mouse | undefined {
    const game = this.game

    if (game === undefined) return

    return game.getMouse()
  }

  public getMousePosition (): Vec2 | undefined {
    const mouse = this.getMouse()

    if (mouse === undefined) return

    return mouse.getPosition()
  }

  public getGlobalMousePosition (): Vec2 | undefined {
    const mousePosition = this.getMousePosition()

    if (mousePosition === undefined) return

    return mousePosition.minus(this.getGlobalPosition())
  }

  // Game Loop

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
