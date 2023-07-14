import type Entity from '../entities'
import { type OuterPatchHelper } from '.'
import align from './align'

export function center (entity: Entity, relative?: boolean): OuterPatchHelper {
  return align(entity, 0.5, relative)
}

export default center
