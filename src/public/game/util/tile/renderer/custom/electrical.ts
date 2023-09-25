import { type CustomTileRenderer, register } from '../map'

const ELECTRICAL_TILES = ['wire', 'switch', 'light']

const electrical: CustomTileRenderer = data => {
  const active = data.meta

  data.texturePath += `.${String(active)}`
}

for (const tile of ELECTRICAL_TILES) {
  register(
    tile,
    electrical
  )
}
