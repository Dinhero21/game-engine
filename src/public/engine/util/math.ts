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
