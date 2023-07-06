import { type Socket as ServerSocket, type Server as ServerServer } from 'socket.io'
import { type Socket as ClientSocket } from 'socket.io-client'
import { type SlotAmount, type SlotType } from './public/game/util/inventory.js'
import { type Recipe } from './public/assets/recipes.js'

// Engine.ioified methods

export type Vec2 = [number, number]

// TODO: Make it possible to dynamically generate this using index.js's chunk
export type Chunk = Array<[string, string]>

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
  'tile.set': (tilePosition: Vec2, type: string) => void
  'slot.set': (id: number, type: SlotType, amount: SlotAmount) => void
}

// Client -> Server
export interface ClientToServerEvents {
  'physics.update': (position: Vec2, velocity: Vec2) => void
  // ? Should I make Chunk Removal the client's responsibility?
  'chunk.remove': (chunkPosition: Vec2) => void
  'tile.click': (tilePosition: Vec2) => void
  'slot.click': (id: number) => void
  'recipe.crafted': (recipe: Recipe) => void
}

// Server -> Server
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InterServerEvents {}

// socket.data
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SocketData {}

export type IServerSocket = ServerSocket<ServerToClientEvents, ClientToServerEvents>

export type IClientSocket = ClientSocket<ServerToClientEvents, ClientToServerEvents>

export type IServerServer = ServerServer<
ClientToServerEvents,
ServerToClientEvents,
InterServerEvents,
SocketData
>
