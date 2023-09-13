import Tiles from '.'
import { AirTileInstance } from './air'
import { Tile, TileInstance, type TileProperties } from './base'
import loop from './decorator/loop'
import once from './decorator/once'
import fixed from './decorator/fixed'
import { tilePositionToChunkPosition } from '../../public/engine/util/tilemap/position-conversion'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface WaterTileProperties {
  pressure: number
}

export class WaterTile extends Tile<WaterTileProperties> {
  public instance () {
    return (tileProperties: TileProperties) => new WaterTileInstance(tileProperties, this.properties)
  }

  public setPressure (pressure: number): WaterTile {
    return new WaterTile({
      ...this.properties,
      pressure
    })
  }
}

export class WaterTileInstance extends TileInstance<WaterTileProperties> {
  type = 'water'

  public pressure

  public last = 0

  constructor (tileProperties: TileProperties, properties: WaterTileProperties) {
    super(tileProperties, properties)

    this.pressure = properties.pressure
  }

  @once()
  @loop(true)
  @fixed(1000 / 8)
  public update (): void {
    super.update()

    if (false as boolean) {
      const now = performance.now()

      const delta = now - this.last

      this.last = now

      this.pressure += delta / 1000
      this.pressure %= 1

      this.syncTile(this)
    }

    if (true as boolean) {
      const chunk = this.getChunk()

      // Don't run if the chunk is not being loaded by any players
      if (chunk.references.size === 0) return

      const world = this.getWorld()

      const tilePosition = this.getTilePosition()

      const belowTilePosition = tilePosition.offset(0, 1)

      const belowTile = world.getTile(belowTilePosition)

      if (belowTile === undefined) return

      this.merge(belowTile)

      const pressure = this.pressure

      if (pressure < 1 / 1024) {
        world.setTile(Tiles.air.instance(), tilePosition, undefined, false)

        return
      }

      const side = Math.random() < 0.5 ? 1 : -1

      const positiveTilePosition = tilePosition.offset(side, 0)
      const positiveTile = world.getTile(positiveTilePosition)

      if (positiveTile !== undefined) this.balance(positiveTile)

      const negativeTilePosition = tilePosition.offset(-side, 0)
      const negativeTile = world.getTile(negativeTilePosition)

      if (negativeTile !== undefined) this.balance(negativeTile)
    }
  }

  public ensureTileIsWater (tile: TileInstance): WaterTileInstance | undefined {
    if (!(tile instanceof AirTileInstance) && !(tile instanceof WaterTileInstance)) return

    const position = tile.getTilePosition()

    const world = this.getWorld()

    if (tile instanceof AirTileInstance) {
      const instance = Tiles.water
        .setPressure(0)
        .instance()

      world.setTile(instance, position, undefined, true)
    }

    const newTile = world.getTile(position)

    if (newTile === undefined) throw new Error('Unexpected undefined tile')
    if (!(newTile instanceof WaterTileInstance)) throw new TypeError('Expected WaterTile')

    return newTile
  }

  public syncTile (tile: TileInstance): void {
    const world = this.getWorld()

    const tilePosition = tile.getTilePosition()
    const chunkPosition = tilePositionToChunkPosition(tilePosition)

    const chunk = world.getChunk(chunkPosition)

    chunk.emit('tile.set', tile)
  }

  public balance (instance: TileInstance): boolean {
    if (!(instance instanceof AirTileInstance) && !(instance instanceof WaterTileInstance)) return false

    const waterInstance = this.ensureTileIsWater(instance)

    if (waterInstance === undefined) return false

    const selfPressure = this.pressure

    const instancePressure = waterInstance.pressure

    const averagePressure = (selfPressure + instancePressure) / 2

    this.pressure = averagePressure

    this.syncTile(this)

    waterInstance.pressure = averagePressure

    this.syncTile(waterInstance)

    return true
  }

  public merge (instance: TileInstance): boolean {
    if (!(instance instanceof AirTileInstance) && !(instance instanceof WaterTileInstance)) return false

    const waterInstance = this.ensureTileIsWater(instance)

    if (waterInstance === undefined) return false

    const selfPressure = this.pressure
    const instancePressure = waterInstance.pressure

    const maxPressureDelta = 1 - instancePressure
    const pressureDelta = Math.min(maxPressureDelta, selfPressure)

    if (pressureDelta === 0) return false

    this.pressure -= pressureDelta
    waterInstance.pressure += pressureDelta

    this.syncTile(this)
    this.syncTile(waterInstance)

    return true
  }

  public getMeta (): number {
    let pressure = this.pressure

    if (pressure > 1 - (1 / 32)) pressure = 1

    let height = Math.floor(pressure * 8)

    if (height < 1) height = 1

    return height
  }
}
