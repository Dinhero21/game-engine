import { type RandomFn, createNoise2D } from 'simplex-noise'
import Vec2 from '../../public/engine/util/vec2.js'

export function random (random: RandomFn, seed: number): RandomFn {
  return () => (random() + seed) % 1
}

export interface NoiseSettings {
  random?: RandomFn
  scale?: number | Vec2
  strength?: number
}

export class Noise {
  private readonly cache = new Map<string, number>()

  protected readonly noise

  protected readonly scale
  protected readonly strength

  constructor (settings: NoiseSettings) {
    this.noise = createNoise2D(settings.random)

    this.scale = settings.scale ?? 1
    this.strength = settings.strength ?? 1
  }

  public get (position: Vec2): number {
    const key = `${position.x}|${position.y}`

    const cached = this.cache.get(key)

    if (cached !== undefined) return cached

    const scaledPosition = position.scaled(this.scale)

    const noise = this.noise(scaledPosition.x, scaledPosition.y)

    const output = noise * this.strength

    this.cache.set(key, output)

    return output
  }
}

export class Noise2D {
  protected readonly x
  protected readonly y

  constructor (settings: NoiseSettings) {
    const scale = settings.scale
    const strength = settings.strength

    const r = settings.random ?? Math.random

    const rX = random(r, 0.5675685101336085)
    const rY = random(r, 0.7131651318580985)

    this.x = new Noise({ random: rX, scale, strength })
    this.y = new Noise({ random: rY, scale, strength })
  }

  public get (position: Vec2): Vec2 {
    const x = this.x.get(position)
    const y = this.y.get(position)

    return new Vec2(x, y)
  }
}

export class DistortedNoise extends Noise {
  protected readonly distortion

  constructor (settings: NoiseSettings, distortion: Noise2D) {
    super(settings)

    this.distortion = distortion
  }

  public get (position: Vec2): number {
    const distortion = this.distortion.get(position)

    const distortedPosition = position.plus(distortion)

    return super.get(distortedPosition)
  }
}
