export function range (x: number, is: number, ie: number, os: number, oe: number): number {
  return (x - is) * (oe - os) / (ie - is) + os
}
