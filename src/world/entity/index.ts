import Entity from './base'
import Player from './player'

export const PlayerConstructor = Player(Entity)
export type IPlayerConstructor = typeof PlayerConstructor
export type IPlayer = InstanceType<IPlayerConstructor>
