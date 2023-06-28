import { type Recipe } from '../../../../assets/recipes.js'
import { TypedEventTarget } from '../../../../engine/util/typed-event-target.js'

export class CraftingEvent extends Event {
  public readonly recipe: Recipe

  constructor (recipe: Recipe) {
    super('crafted')

    this.recipe = recipe
  }
}

export interface CraftingManagerEventMap {
  'crafted': CraftingEvent
}

export class CraftingManager extends TypedEventTarget<CraftingManagerEventMap> {
  public onCrafted (recipe: Recipe): void {
    this.dispatchTypedEvent('crafted', new CraftingEvent(recipe))
  }
}

export default CraftingManager
