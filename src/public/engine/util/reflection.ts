import { type AnyFunction, type ArrayToIntersection } from './types'

export function * getPrototypeChain (object: object): Iterable<object> {
  while (true) {
    yield object

    object = Object.getPrototypeOf(object)

    if (object === null) break
  }
}

export function dumpPrototypeChain (object: object, dumpPropertyNames: boolean = false): void {
  console.info('--- PROTOTYPE CHAIN DUMP ---')

  let i = 0

  for (const prototype of getPrototypeChain(object)) {
    i++

    const isConstructor = typeof prototype === 'function'

    console.group(`${i}. ${
      (
        isConstructor
        ? prototype?.name
        : prototype?.constructor?.name
      ) + (
        isConstructor
        ? ' (constructor)'
        : ' (instance)'
      )
    }`)

    if (dumpPropertyNames) {
      for (const name of Object.getOwnPropertyNames(prototype)) {
        console.info(name)
      }
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

// TODO: Make it so its possible to clone the entire prototype chain and not only the instance properties
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

      // TODO: Flag to allow you to choose between assign3 or assignPrototypeChain
      // TODO: Benchmark assign3 vs assignPrototypeChain
      // Time Complexities (Speculation):
      //   assign3              : property count (only own)
      //   assign3 (full)       : property count
      //   assignPrototypeChain : property count (including duplicates) + prototype chain size
      // * By assign3 I mean assign3 (full)
      // assign3 should be faster but might introduce bugs when
      // prototype of A|B uses super as it would try to access
      // its prototype, which is not what it was expecting.
      // instead, it should have used this as all the methods
      // are flattened.
      // assignPrototypeChain does not have that problem but it
      // is *considerably* slower so its output should always be
      // cached.
      // ? assign3 or assignPrototypeChain?
      assignPrototypeChain(a, b, c)
    }
  }

  assign3(A, B, C, assignFull)

  return C as unknown as Constructor<T, IA & IB> & (TA & TB)
}

export function nameFunction<T extends AnyFunction> (name: string, original: T): T {
  return {
    [name] (...args: Parameters<T>): ReturnType<T> {
      return original.apply(this, args)
    }
  }[name] as T
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export function nameClass<T extends Constructor<any, any>> (name: string, original?: T): T {
  // TODO: Find a way to do this without eval
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  return new Function(
    'original',
    `return class ${name} ${original === undefined ? '' : 'extends original'} {}`
  )(original)
}

export function setName (name: string, object: object): void {
  const prototype = Object.create(
    Object.getPrototypeOf(object),
    {
      constructor: {
        value: nameClass(name)
      }
    }
  )

  Object.setPrototypeOf(object, prototype)
}
