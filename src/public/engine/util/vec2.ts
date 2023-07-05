export class Vec2 {
  public x: number
  public y: number

  constructor (x: number, y: number) {
    this.x = x
    this.y = y
  }

  set (x: number, y: number): this {
    this.x = x
    this.y = y

    return this
  }

  update (other: Vec2): this {
    this.x = other.x
    this.y = other.y

    return this
  }

  rounded (): Vec2 {
    return new Vec2(Math.round(this.x), Math.round(this.y))
  }

  round (): this {
    this.x = Math.round(this.x)
    this.y = Math.round(this.y)

    return this
  }

  floored (): Vec2 {
    return new Vec2(Math.floor(this.x), Math.floor(this.y))
  }

  floor (): this {
    this.x = Math.floor(this.x)
    this.y = Math.floor(this.y)

    return this
  }

  offset (dx: number, dy: number): Vec2 {
    return new Vec2(this.x + dx, this.y + dy)
  }

  translate (dx: number, dy: number): this {
    this.x += dx
    this.y += dy

    return this
  }

  add (other: Vec2): this {
    this.x += other.x
    this.y += other.y

    return this
  }

  subtract (other: Vec2): this {
    this.x -= other.x
    this.y -= other.y

    return this
  }

  multiply (other: Vec2): this {
    this.x *= other.x
    this.y *= other.y

    return this
  }

  divide (value: number | Vec2): this {
    value = this.vectorize(value)

    this.x /= value.x
    this.y /= value.y

    return this
  }

  divided (value: number | Vec2): Vec2 {
    value = this.vectorize(value)

    return new Vec2(this.x / value.x, this.y / value.y)
  }

  plus (other: Vec2): Vec2 {
    return this.offset(other.x, other.y)
  }

  minus (other: Vec2): Vec2 {
    return this.offset(-other.x, -other.y)
  }

  scaled (scalar: number | Vec2): Vec2 {
    scalar = this.vectorize(scalar)

    return new Vec2(this.x * scalar.x, this.y * scalar.y)
  }

  abs (): Vec2 {
    return new Vec2(Math.abs(this.x), Math.abs(this.y))
  }

  area (): number {
    return this.x * this.y
  }

  mod (other: Vec2 | number): Vec2 {
    other = this.vectorize(other)

    return new Vec2(
      euclideanMod(this.x, other.x),
      euclideanMod(this.y, other.y)
    )
  }

  distanceTo (other: Vec2): number {
    const distanceSquared = this.distanceSquared(other)

    return Math.sqrt(distanceSquared)
  }

  distanceSquared (other: Vec2): number {
    const dx = other.x - this.x
    const dy = other.y - this.y

    return dx * dx + dy * dy
  }

  equals (other: Vec2): boolean {
    return this.x === other.x && this.y === other.y
  }

  toString (): string {
    return `(${this.x}, ${this.y})`
  }

  clone (): Vec2 {
    return this.offset(0, 0)
  }

  min (other: Vec2): Vec2 {
    return new Vec2(Math.min(this.x, other.x), Math.min(this.y, other.y))
  }

  max (other: Vec2): Vec2 {
    return new Vec2(Math.max(this.x, other.x), Math.max(this.y, other.y))
  }

  length (): number {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  dot (other: Vec2): number {
    return this.x * other.x + this.y * other.y
  }

  unit (): this | Vec2 {
    const length = this.length()

    if (length === 0) {
      return this.clone()
    } else {
      return this.divided(length)
    }
  }

  capped (maximumLength: number): Vec2 {
    const length = this.length()

    if (length < maximumLength) return this.clone()

    return this.unit().scaled(maximumLength)
  }

  cap (maximumLength: number): this {
    this.update(this.capped(maximumLength))

    return this
  }

  normalize (): this {
    const norm = this.length()

    if (norm !== 0) {
      this.x /= norm
      this.y /= norm
    }

    return this
  }

  scale (scalar: number | Vec2): this {
    scalar = this.vectorize(scalar)

    this.x *= scalar.x
    this.y *= scalar.y

    return this
  }

  innerProduct (other: Vec2): number {
    return this.x * other.x + this.y * other.y
  }

  manhattanDistanceTo (other: Vec2): number {
    return Math.abs(other.x - this.x) + Math.abs(other.y - this.y)
  }

  toArray (): [number, number] {
    return [this.x, this.y]
  }

  vectorize (value: number | Vec2): Vec2 {
    if (typeof value === 'number') value = new Vec2(value, value)

    return value
  }
}

export function euclideanMod (numerator: number, denominator: number): number {
  const result = numerator % denominator
  return result < 0 ? result + denominator : result
}

export default Vec2
