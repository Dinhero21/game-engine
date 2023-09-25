// TODO: Better Abstraction

export type Container = Map<any, any> | Set<any>

export abstract class Collection2D {
  protected abstract _map: Map<any, Container>

  public get width (): number {
    return this._map.size
  }

  public get size (): number {
    let size = 0

    for (const value of this._map.values()) {
      size += value.size
    }

    return size
  }

  public clear (): void {
    this._map.clear()
  }
}

export class Map2D<KX, KY, T> extends Collection2D {
  // Collection

  protected _map = new Map<KX, Map<KY, T>>()

  protected getRow (x: KX): Map<KY, T> | undefined {
    return this._map.get(x)
  }

  public delete (x: KX, y: KY): boolean {
    return this.getRow(x)?.delete(y) ?? false
  }

  public get (x: KX, y: KY): T | undefined {
    return this.getRow(x)?.get(y)
  }

  public has (x: KX, y: KY): boolean {
    return this.getRow(x)?.has(y) ?? false
  }

  protected ensureRow (x: KX): Map<KY, T> {
    const row = this.getRow(x) ?? new Map()
    this._map.set(x, row)

    return row
  }

  public set (x: KX, y: KY, value: T): this {
    const row = this.ensureRow(x)
    row.set(y, value)

    return this
  }

  // Iterable

  public [Symbol.iterator] (): IterableIterator<[[KX, KY], T]> {
    return this.entries()
  }

  public * entries (): IterableIterator<[[KX, KY], T]> {
    for (const [x, row] of this._map.entries()) {
      for (const [y, v] of row.entries()) {
        yield [[x, y], v]
      }
    }
  }

  public * keys (): IterableIterator<[KX, KY]> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [k, v] of this.entries()) yield k
  }

  public * values (): IterableIterator<T> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [k, v] of this.entries()) yield v
  }
}

export class Set2D<X, Y> extends Collection2D {
  // Collection

  protected _map = new Map<X, Set<Y>>()

  protected getRow (x: X): Set<Y> | undefined {
    return this._map.get(x)
  }

  public delete (x: X, y: Y): boolean {
    return this.getRow(x)?.delete(y) ?? false
  }

  public has (x: X, y: Y): boolean {
    return this.getRow(x)?.has(y) ?? false
  }

  protected ensureRow (x: X): Set<Y> {
    const row = this.getRow(x) ?? new Set()
    this._map.set(x, row)

    return row
  }

  public add (x: X, y: Y): this {
    const set = this.ensureRow(x)
    set.add(y)

    return this
  }

  // Iterable

  public [Symbol.iterator] (): IterableIterator<[X, Y]> {
    return this.entries()
  }

  public * entries (): IterableIterator<[X, Y]> {
    for (const [x, row] of this._map.entries()) {
      for (const y of row) {
        yield [x, y]
      }
    }
  }

  public * keys (): IterableIterator<X> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [k, v] of this.entries()) yield k
  }

  public * values (): IterableIterator<Y> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [k, v] of this.entries()) yield v
  }
}

// TODO: Weak[Map|Set]2D
