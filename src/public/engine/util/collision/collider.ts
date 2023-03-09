export abstract class Collider {
  public abstract _distanceLeft (other: this): number

  public distanceLeft (other: this): number {
    return Math.max(this._distanceLeft(other), other._distanceRight(this))
  }

  public abstract _distanceRight (other: this): number

  public distanceRight (other: this): number {
    return Math.max(this._distanceRight(other), other._distanceLeft(this))
  }

  public abstract _distanceDown (other: this): number

  public distanceDown (other: this): number {
    return Math.max(this._distanceDown(other), other._distanceUp(this))
  }

  public abstract _distanceUp (other: this): number

  public distanceUp (other: this): number {
    return Math.max(this._distanceUp(other), other._distanceDown(this))
  }

  public distances (other: this): { left: number, right: number, down: number, up: number } {
    const left = this._distanceLeft(other)
    const right = this._distanceRight(other)
    const down = this._distanceDown(other)
    const up = this._distanceUp(other)

    return { left, right, down, up }
  }

  public distanceArray (other: this): [number, number, number, number] {
    return [
      this._distanceLeft(other),
      this._distanceRight(other),
      this._distanceUp(other),
      this._distanceDown(other)
    ]
  }

  public distance (other: this): number {
    const distances = this.distanceArray(other)

    return Math.max(...distances)
  }

  public touching (other: this): boolean {
    return this.distance(other) === 0
  }

  public overlapping (other: this): boolean {
    return this.distance(other) < 0
  }

  public colliding (other: this): boolean {
    return this.distance(other) <= 0
  }
}
