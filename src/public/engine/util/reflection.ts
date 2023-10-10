import { type ArrayToIntersection } from './types'

export function * getPrototypeChain (object: object): Iterable<any> {
  while (true) {
    yield object

    object = Object.getPrototypeOf(object)

    if (object === null) break
  }
}

export function dumpPrototypeChain (object: object): void {
  console.info('--- PROTOTYPE CHAIN DUMP ---')

  for (const prototype of getPrototypeChain(object)) {
    console.group(`${String(prototype?.name)} (${String(prototype?.constructor?.name)})`)

    for (const name of Object.getOwnPropertyNames(prototype)) {
      console.info(name)
    }

    console.groupEnd()
  }

  console.info('----------------------------')
}

export function getPropertyDescriptors (object: object): Map<string, PropertyDescriptor> {
  const descriptors = new Map<string, PropertyDescriptor>()

  for (const prototype of getPrototypeChain(object)) {
    for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(prototype))) {
      if (descriptors.has(key)) continue

      descriptors.set(key, descriptor)
    }
  }

  return descriptors
}

export function assignFull (target: object, object: object): void {
  const map = getPropertyDescriptors(object)

  for (const [key, descriptor] of map) {
    try {
      Object.defineProperty(target, key, descriptor)
    } catch (error) {
      if (error instanceof TypeError) continue
    }
  }
}

// (c > b > a) -> c
export function assign3 (a: object | null, b: object | null, c: object, assign = Object.assign): void {
  const intermediate = Object.create(null)

  assign(intermediate, a)
  assign(intermediate, b)
  assign(intermediate, c)

  assign(c, intermediate)
}

export function createMergedClone<T extends Array<object | null>> (...objects: T): ArrayToIntersection<T> {
  const descriptors = Object.create(null)

  for (const object of objects) {
    if (object === null) continue

    Object.assign(
      descriptors,
      Object.getOwnPropertyDescriptors(object)
    )
  }

  return Object.create(
    null,
    descriptors
  )
}

export function assignPrototypeChain (a: object | null, b: object | null, c: object): void {
  assign3(a, b, c)

  if (a === null && b === null) return

  const aPrototype = getPrototypeOf(a)
  const bPrototype = getPrototypeOf(b)

  const prototype = createMergedClone(
    aPrototype,
    bPrototype,
    getPrototypeOf(c),
    {
      name: merged(
        getNameOf(aPrototype),
        getNameOf(bPrototype)
      )
    }
  )

  assignPrototypeChain(
    aPrototype,
    bPrototype,
    prototype
  )

  Object.setPrototypeOf(c, prototype)

  function getPrototypeOf (object: object | null): object | null {
    if (object === null) return null

    return Object.getPrototypeOf(object)
  }

  function getNameOf (object: object | null): any {
    if (object === null) return
    if ('name' in object) return object.name
    if ('constructor' in object) return object.constructor.name
  }

  function merged (a: string, b: string): string {
    if (a === b) return a

    return `${a} & ${b}`
  }
}

export type Constructor<T extends any[], U> = new (...args: T) => U

// Apparently it already mutates (wtf?) so yeah...
// // TODO: Make it so C mutates when A or B mutates (would require watch-ing or Proxy-ing)
// // TODO: If a flag is implemented, have it use macros instead of IF-ELSE (or SWITCH) for performance
// // TODO: Maybe some flag to determine the Merge Strategy:
// //       - assign (fastest,   doesn't mutate)
// //       - watch  (reactive,  mutates       )
// //       - proxy  (proactive, mutates       )
export function Merge<T extends any[], TA extends Constructor<T, any>, TB extends Constructor<T, any>, IA extends InstanceType<TA>, IB extends InstanceType<TB>> (A: TA, B: TB): Constructor<T, IA & IB> & (TA & TB) {
  const name = `${A.name} & ${B.name}`

  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  class C {
    static name = name

    constructor (...args: T) {
      const a = new A(...args)
      const b = new B(...args)

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let c: any = this

      while (true) {
        if (c === null) {
          // ? Should I warn or error?
          console.warn(`Could not find Merged (${name}) for ${JSON.stringify(this.constructor.name)} (see below), assuming C = this`)
          dumpPrototypeChain(this)

          // eslint-disable-next-line @typescript-eslint/no-this-alias
          c = this

          break
        }

        if (c.constructor === C) break

        c = Object.getPrototypeOf(c)
      }

      assignPrototypeChain(a, b, c)
    }
  }

  assign3(A, B, C, assignFull)

  return C as unknown as Constructor<T, IA & IB> & (TA & TB)
}
