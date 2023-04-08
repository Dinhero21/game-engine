import { type Constructor } from './index.js'
import type Entity from '../entities/index.js'
import Vec2 from '../util/vec2.js'
import Align from './align.js'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Center<T extends Constructor<Entity>> (BaseEntity: T) {
  return Align<T>(BaseEntity, new Vec2(0.5, 0.5))
}

export default Align
