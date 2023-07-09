import type Vec2 from '../vec2.js'

// TODO: Make TileMapEntity get these values on construction
export const TILE_SIZE = 32
export const CHUNK_SIZE = 8

export function positionToTilePosition (position: Vec2): Vec2 {
  return position
    .divided(TILE_SIZE)
    .floored()
}

export function tilePositionToPosition (tilePosition: Vec2): Vec2 {
  return tilePosition.scaled(TILE_SIZE)
}

export function tilePositionToChunkPosition (tilePosition: Vec2): Vec2 {
  return tilePosition
    .divided(CHUNK_SIZE)
    .floored()
}

export function chunkPositionToTilePosition (chunkPosition: Vec2): Vec2 {
  return chunkPosition.scaled(CHUNK_SIZE)
}
