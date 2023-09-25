
import { TILE_SIZE } from '../../../../../engine/util/tilemap/position-conversion'
import { Experiments } from '../../../../../globals'
import { type CustomTileRenderer, register } from '../map'

const LIQUID_TILES = ['water']

const liquid: CustomTileRenderer = data => {
  // Range: [0,8]
  const pressure = data.meta

  if (typeof pressure !== 'number') throw new TypeError('Expected WaterTile.meta to be a number')

  const position = data.position
  const size = data.size

  const [up, left, right, down] = data.nearby

  const start = position.clone()
  const end = start.plus(size)

  const normalizedPressure = pressure / 8
  const normalizedDelta = 1 - normalizedPressure
  const delta = normalizedDelta * TILE_SIZE

  let deltaStartX = 0
  let deltaStartY = 0
  let deltaEndX = 0
  let deltaEndY = 0

  if (Experiments.cursed_water) {
    if (!up) {
      deltaStartY += delta
    }

    if (!left) {
      deltaStartX += delta
    }

    if (!right) {
      deltaEndX -= delta
    }

    if (!down) {
      deltaEndY -= delta
    }

    if (!up && !down) {
      deltaStartY /= 2
      deltaEndY /= 2
    }

    if (!left && !right) {
      deltaStartX /= 2
      deltaEndX /= 2
    }
  } else {
    if (!up) {
      deltaStartY += delta
    }
  }

  start.x += deltaStartX
  start.y += deltaStartY
  end.x += deltaEndX
  end.y += deltaEndY

  position.update(start)

  size.update(end.minus(start))
}

for (const tile of LIQUID_TILES) {
  register(
    tile,
    liquid
  )
}
