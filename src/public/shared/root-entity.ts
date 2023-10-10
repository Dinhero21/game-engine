import type SharedEntity from './entity'
import Vec2 from '../engine/util/vec2'

// TODO: Find a way to make ValidRoot in ValidRoot = ValidRoot without circular dependency errors
export class RootEntity<ValidChild extends SharedEntity = SharedEntity<any, any>, ValidRoot extends RootEntity = RootEntity<any, any>> {
  // Entity Relationship

  public readonly children = new Set<ValidChild>()

  public addChild (child: ValidChild): this {
    this.children.add(child)

    child.setParent(this)

    child.ready()

    return this
  }

  public removeChild (child: ValidChild): this {
    this.children.delete(child)

    child.deleteParent()

    return this
  }

  public getChildren (): ValidChild[] {
    return Array.from(this.children)
  }

  public parent?: ValidRoot | SharedEntity

  public setParent (parent: ValidRoot): this {
    this.parent = parent

    return this
  }

  public deleteParent (): this {
    this.parent = undefined

    return this
  }

  public getRoot (): ValidRoot | undefined {
    return this.parent?.getRoot() as ValidRoot | undefined
  }

  public getPath (): number[] {
    const parent = this.parent

    if (parent === undefined) return []

    const id = Array.from(parent.children)
      .findIndex(child => child === (this as RootEntity))

    return [...parent.getPath(), id]
  }

  // Position

  public getGlobalPosition (): Vec2 {
    return Vec2.ZERO
  }
}

export default RootEntity
