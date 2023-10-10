export type Vec2Array = [number, number]

export class Vec2 {
  public x: number
  public y: number

  constructor (x: number, y: number) {
    this.x = x
    this.y = y
  }

  // Methods

  public set (x: number, y: number): this {
    this.x = x
    this.y = y

    return this
  }

  public update (other: Vec2): this {
    this.x = other.x
    this.y = other.y

    return this
  }

  public rounded (): Vec2 {
    return new Vec2(Math.round(this.x), Math.round(this.y))
  }

  public round (): this {
    this.x = Math.round(this.x)
    this.y = Math.round(this.y)

    return this
  }

  public floored (): Vec2 {
    return new Vec2(Math.floor(this.x), Math.floor(this.y))
  }

  public floor (): this {
    this.x = Math.floor(this.x)
    this.y = Math.floor(this.y)

    return this
  }

  public offset (dx: number, dy: number): Vec2 {
    return new Vec2(this.x + dx, this.y + dy)
  }

  public translate (dx: number, dy: number): this {
    this.x += dx
    this.y += dy

    return this
  }

  public add (other: Vec2): this {
    this.x += other.x
    this.y += other.y

    return this
  }

  public subtract (other: Vec2): this {
    this.x -= other.x
    this.y -= other.y

    return this
  }

  public multiply (other: Vec2): this {
    this.x *= other.x
    this.y *= other.y

    return this
  }

  public divide (value: number | Vec2): this {
    value = this.vectorize(value)

    this.x /= value.x
    this.y /= value.y

    return this
  }

  public divided (value: number | Vec2): Vec2 {
    value = this.vectorize(value)

    return new Vec2(this.x / value.x, this.y / value.y)
  }

  public plus (other: Vec2): Vec2 {
    return this.offset(other.x, other.y)
  }

  public minus (other: Vec2): Vec2 {
    return this.offset(-other.x, -other.y)
  }

  public scaled (scalar: number | Vec2): Vec2 {
    scalar = this.vectorize(scalar)

    return new Vec2(this.x * scalar.x, this.y * scalar.y)
  }

  public abs (): Vec2 {
    return new Vec2(Math.abs(this.x), Math.abs(this.y))
  }

  public area (): number {
    return this.x * this.y
  }

  public mod (other: Vec2 | number): Vec2 {
    other = this.vectorize(other)

    return new Vec2(
      euclideanMod(this.x, other.x),
      euclideanMod(this.y, other.y)
    )
  }

  public distanceTo (other: Vec2): number {
    const distanceSquared = this.distanceSquared(other)

    return Math.sqrt(distanceSquared)
  }

  public distanceSquared (other: Vec2): number {
    const dx = other.x - this.x
    const dy = other.y - this.y

    return dx * dx + dy * dy
  }

  public equals (other: Vec2): boolean {
    return this.x === other.x && this.y === other.y
  }

  public toString (): string {
    return `(${this.x}, ${this.y})`
  }

  public clone (): Vec2 {
    return this.offset(0, 0)
  }

  public min (other: Vec2): Vec2 {
    return new Vec2(Math.min(this.x, other.x), Math.min(this.y, other.y))
  }

  public max (other: Vec2): Vec2 {
    return new Vec2(Math.max(this.x, other.x), Math.max(this.y, other.y))
  }

  public length (): number {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  public dot (other: Vec2): number {
    return this.x * other.x + this.y * other.y
  }

  public unit (): this | Vec2 {
    const length = this.length()

    if (length === 0) {
      return this.clone()
    } else {
      return this.divided(length)
    }
  }

  public capped (maximumLength: number): Vec2 {
    const length = this.length()

    if (length < maximumLength) return this.clone()

    return this.unit().scaled(maximumLength)
  }

  public cap (maximumLength: number): this {
    this.update(this.capped(maximumLength))

    return this
  }

  public normalize (): this {
    const norm = this.length()

    if (norm !== 0) {
      this.x /= norm
      this.y /= norm
    }

    return this
  }

  public scale (scalar: number | Vec2): this {
    scalar = this.vectorize(scalar)

    this.x *= scalar.x
    this.y *= scalar.y

    return this
  }

  public innerProduct (other: Vec2): number {
    return this.x * other.x + this.y * other.y
  }

  public manhattanDistanceTo (other: Vec2): number {
    return Math.abs(other.x - this.x) + Math.abs(other.y - this.y)
  }

  public toArray (): Vec2Array {
    return [this.x, this.y]
  }

  public vectorize (value: number | Vec2): Vec2 {
    if (typeof value === 'number') value = new Vec2(value, value)

    return value
  }

  // Static Methods

  public static fromArray (array: Vec2Array): Vec2 {
    return new Vec2(...array)
  }

  // Static Getters

  static get ZERO (): Vec2 {
    return new Vec2(0, 0)
  }

  static get ONE (): Vec2 {
    return new Vec2(1, 1)
  }

  static get UP (): Vec2 {
    return new Vec2(0, -1)
  }

  static get DOWN (): Vec2 {
    return new Vec2(0, 1)
  }

  static get LEFT (): Vec2 {
    return new Vec2(-1, 0)
  }

  static get RIGHT (): Vec2 {
    return new Vec2(1, 0)
  }

  static get CENTER (): Vec2 {
    return new Vec2(0.5, 0.5)
  }
}

export function euclideanMod (numerator: number, denominator: number): number {
  const result = numerator % denominator
  return result < 0 ? result + denominator : result
}

export default Vec2
