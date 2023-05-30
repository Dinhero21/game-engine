import { type OuterPatchHelper } from './index.js'
import type Entity from '../entities/index.js'
import align from './align.js'

export function center (entity: Entity, relative?: boolean): OuterPatchHelper {
  return align(entity, 0.5, relative)
}

export default center
