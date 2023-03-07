import type Vec2 from './vec2.js'

export class BoundingBox {
  protected position: Vec2
  protected size: Vec2

  public getPosition (): Vec2 {
    return this.position
  }

  public getSize (): Vec2 {
    return this.size
  }

  public getStart (): Vec2 {
    return this.getPosition()
  }

  public getEnd (): Vec2 {
    const start = this.getStart()
    const size = this.getSize()

    return start.plus(size)
  }

  constructor (position: Vec2, size: Vec2) {
    this.position = position
    this.size = size
  }

  public isCollidingWith (boundingBox: BoundingBox): boolean {
    const start = this.getStart()
    const end = this.getEnd()

    const otherStart = boundingBox.getStart()
    const otherEnd = boundingBox.getEnd()

    return (
      start.x <= otherEnd.x &&
      end.x >= otherStart.x &&
      start.y <= otherEnd.y &&
      end.y >= otherStart.y
    )
  }
}

export default BoundingBox
