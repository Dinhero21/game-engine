import { type SlotAmount, type SlotType } from './public/game/util/inventory'
import { type Recipe } from './public/asset/recipe'
import { type Socket as ServerSocket, type Server as ServerServer } from 'socket.io'
import { type Socket as ClientSocket } from 'socket.io-client'

// engine.io-friendly types

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
  'tile.set': (tilePosition: Vec2, type: string, meta: unknown) => void
  'chunk.set': (chunkPosition: Vec2, tiles: Array<[string, unknown] | null>) => void
  'slot.set': (id: number, type: SlotType, amount: SlotAmount) => void
  'chat.message': (message: string) => void
}

// Client -> Server
export interface ClientToServerEvents {
  'physics.update': (position: Vec2, velocity: Vec2) => void
  // ? Should I make Chunk Removal the client's responsibility?
  'chunk.remove': (chunkPosition: Vec2) => void
  'tile.click': (tilePosition: Vec2) => void
  'slot.click': (id: number) => void
  'recipe.crafted': (recipe: Recipe) => void
  'chat.message': (message: string) => void
}

// Server -> Server
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InterServerEvents {}

// socket.data
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SocketData {}

export type IServerSocket = ServerSocket<ClientToServerEvents, ServerToClientEvents>

export type IClientSocket = ClientSocket<ServerToClientEvents, ClientToServerEvents>

export type IServerServer = ServerServer<
ClientToServerEvents,
ServerToClientEvents,
InterServerEvents,
SocketData
>
