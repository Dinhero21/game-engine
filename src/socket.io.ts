import { type Tile } from './public/engine/util/tilemap/chunk.js'

// Engine.io will strip the function methods from Vec2
export type Vec2 = [number, number]

// ? Should I define Player here?
export interface Player {
  id: string
  position: Vec2
  velocity: Vec2
}

// Server -> Client
export interface ServerToClientEvents {
  'player.add': (player: Player) => void
  'player.remove': (player: Player) => void
  'player.physics.update': (player: Player) => void
  'tile.set': (tile: Tile, tilePosition: Vec2) => void
}

// Client -> Server
export interface ClientToServerEvents {
  'physics.update': (position: Vec2, velocity: Vec2) => void
}

// Server -> Server
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InterServerEvents {}

// socket.data
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SocketData {}
