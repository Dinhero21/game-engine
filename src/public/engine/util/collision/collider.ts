// TODO: Have 1D and 2D Colliders, a 1D Collider would be a simple section with distanceNegative and distancePositive, a 2D Collider would be the equivalent of a boolean and operation on two 1D Colliders. This would allow for better performance on Uni-Directional Position Delta Calculation.

// ? Should I use any?
export abstract class Collider<ValidCollidable extends Collider<any>> {
  public abstract _distanceLeft (other: ValidCollidable): number

  public distanceLeft (other: ValidCollidable): number {
    return Math.max(this._distanceLeft(other), other._distanceRight(this))
  }

  public abstract _distanceRight (other: ValidCollidable): number

  public distanceRight (other: ValidCollidable): number {
    return Math.max(this._distanceRight(other), other._distanceLeft(this))
  }

  public abstract _distanceDown (other: ValidCollidable): number

  public distanceDown (other: ValidCollidable): number {
    return Math.max(this._distanceDown(other), other._distanceUp(this))
  }

  public abstract _distanceUp (other: ValidCollidable): number

  public distanceUp (other: ValidCollidable): number {
    return Math.max(this._distanceUp(other), other._distanceDown(this))
  }

  public distances (other: ValidCollidable): { left: number, right: number, down: number, up: number } {
    const left = this._distanceLeft(other)
    const right = this._distanceRight(other)
    const down = this._distanceDown(other)
    const up = this._distanceUp(other)

    return { left, right, down, up }
  }

  public distanceArray (other: ValidCollidable): [number, number, number, number] {
    return [
      this._distanceLeft(other),
      this._distanceRight(other),
      this._distanceUp(other),
      this._distanceDown(other)
    ]
  }

  public distance (other: ValidCollidable): number {
    const distances = this.distanceArray(other)

    return Math.max(...distances)
  }

  public overlapping (other: ValidCollidable): boolean {
    return this.distance(other) < 0
  }
}

export default Collider
