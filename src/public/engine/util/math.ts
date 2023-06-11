import Vec2 from './vec2.js'

// x from (is, ie) to (os, oe)
export function range (x: number, is: number, ie: number, os: number, oe: number): number {
  return (x - is) * (oe - os) / (ie - is) + os
}

// Linear Interpolation
export function lerp (a: number, b: number, t: number): number {
  return a - (a - b) * t
}

// 2D Linear Interpolation
export function lerp2D (a: Vec2, b: Vec2, t: number): Vec2 {
  return new Vec2(
    lerp(a.x, b.x, t),
    lerp(a.y, b.y, t)
  )
}

// PRNG
export function randomFromNumber (seed: number): number {
  const a = 56041356
  const c = 1066313161
  const m = 4294967296

  return (a * seed + c) % m
}

export function randomFromArray (seed: number[]): number {
  let n = 0

  for (const s of seed) n = randomFromNumber(s ^ n)

  return n
}

export function randomArrayFromNumber (seed: number, length: number): number[] {
  const result = []
  for (let i = 0; i < length; i++) {
    seed = randomFromNumber(seed)
    result.push(seed)
  }

  return result
}

export function randomArrayFromArray (seed: number[], length: number): number[] {
  let n = randomFromArray(seed)

  const result = []
  for (let i = 0; i < length; i++) {
    n = randomFromNumber(n)
    result.push(n)
  }

  return result
}
