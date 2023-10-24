import { type SlotAmount, type SlotType } from './public/game/util/inventory'
import { type Recipe } from './public/asset/recipe'
import { type BaseSerializedTile, type SerializedTile } from './plugin/world'
import { type EntityClientData } from './world/entity/base'
import { type Vec2Array } from './public/engine/util/vec2'
import { type Socket as ServerSocket, type Server as ServerServer } from 'socket.io'
import { type Socket as ClientSocket } from 'socket.io-client'

export const TILE_CLICK_BUTTONS = ['left', 'right'] as const
export type TileClickButtons = typeof TILE_CLICK_BUTTONS
export type TileClickButton = TileClickButtons[number]

// I really did want to use "Sparse Array"s instead of Objects but
// engine.io (or socket.io) didn't support them and simply replaced
// all instances of "empty" with null which probably reverted the
// possible performance improvements gained from this.
export type TileMap = Record<string, Record<string, BaseSerializedTile>>

// Server -> Client
export interface ServerToClientEvents {
  'entity.add': (entity: EntityClientData) => void
  'entity.remove': (id: any) => void
  'entity.update': (entity: EntityClientData) => void
  'tile.set[]': (tiles: TileMap) => void
  'chunk.set': (chunkPosition: Vec2Array, tiles: Array<SerializedTile | null>) => void
  'slot.set': (id: number, type: SlotType, amount: SlotAmount) => void
  'chat.message': (message: string) => void
}

// Client -> Server
export interface ClientToServerEvents {
  'physics.update': (position: Vec2Array, velocity: Vec2Array, acceleration: Vec2Array) => void
  // ? Should I make Chunk Removal the client's responsibility?
  'chunk.remove': (chunkPosition: Vec2Array) => void
  'tile.click': (tilePosition: Vec2Array, button: TileClickButton) => void
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
