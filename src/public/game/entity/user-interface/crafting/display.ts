import DebugEntity, { type DebugCollider } from '../../debug'

export class DisplayEntity extends DebugEntity {
  constructor (collider: DebugCollider) {
    super('Display', collider, false)
  }
}

export default DisplayEntity
