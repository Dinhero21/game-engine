import type Frame from '../../../../engine/util/frame'
import type WorldEntity from '../../world'
import Entity from '../../../../engine/entity'

export class ServerEntityEntity extends Entity<any> {
  public id

  constructor (id: any) {
    super()

    this.id = id
  }

  public draw (frame: Frame): void {
    super.draw(frame)

    const collider = this.getConstantCollider()
    const size = collider.getSize()

    frame.drawText('Server Entity', -size.x / 2, -((size.y / 2) + 8), 'white', '32px cursive')
  }

  public world?: WorldEntity
}

export default ServerEntityEntity
