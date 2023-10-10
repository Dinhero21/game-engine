import ProgressBarEntity, { type Colors } from '../../progress-bar'
import Vec2 from '../../../../engine/util/vec2'
import ButtonEntity from '../../../../engine/entity/button'
import center from '../../../../engine/patch/center'
import AnchorEntity from '../../../../engine/entity/anchor'
import DebugEntity from '../../debug'

export class CraftingProgressEntity extends ProgressBarEntity {
  public readonly button

  constructor (size: Vec2, color: Colors) {
    super({ size, color })

    const progressCenter = new AnchorEntity(Vec2.CENTER)
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
