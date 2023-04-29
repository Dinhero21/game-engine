import type Entity from '../entities/index.js'
import align from './align.js'

export function center (entity: Entity): void {
  align(entity, 0.5)
}

export default center
