import ProgressBarEntity, { type Colors } from '../../progress-bar'
import Vec2 from '../../../../engine/util/vec2'
import ButtonEntity from '../../../../engine/entities/button'
import center from '../../../../engine/patches/center'
import AnchorEntity from '../../../../engine/entities/anchor'
import DebugEntity from '../../debug'

export class CraftingProgressEntity extends ProgressBarEntity {
  public readonly button

  constructor (size: Vec2, color: Colors) {
    super({ size, color })

    const progressCenter = new AnchorEntity(new Vec2(0.5, 0.5))
    this.addChild(progressCenter)

    const button = new ButtonEntity(new Vec2(64, 32))
    progressCenter.addChild(button)
    center(button)

    this.button = button

    const debug = new DebugEntity('🔨🔨🔨', button, false)
    button.addChild(debug)
  }
}

export default CraftingProgressEntity
