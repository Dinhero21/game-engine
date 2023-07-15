import { type StructureHelper } from './handler'

export abstract class Structure<Properties = any> {
  constructor (properties: Properties) {
    this.properties = properties
  }

  protected properties: Properties

  public abstract create (helper: StructureHelper): void
}

export default Structure
