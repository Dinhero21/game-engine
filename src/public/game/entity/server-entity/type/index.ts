import ServerEntityEntity from './base'
import { ServerPlayerEntity } from './player'
import { type EntityClientData } from '../../../../../world/entity/base'
import Vec2 from '../../../../engine/util/vec2'
import socket from '../../../socket.io'
import { valid } from '../../../../none'
import { type PlayerClientData } from '../../../../../world/entity/player'

export type EntityFunction = (this: unknown, data: EntityClientData, entity?: ServerEntityEntity) => ServerEntityEntity

// TODO: non-awkward type-safe custom data and entity type
export const EntityTypes = {
  base (data: EntityClientData, entity = new ServerEntityEntity(data.id)) {
    entity.position = Vec2.fromArray(data.position)

    return entity
  },
  player (data: EntityClientData, entity = new ServerPlayerEntity(data.id)) {
    EntityTypes.base(data, entity)

    if (!(entity instanceof ServerPlayerEntity)) return entity

    entity.physics.position = entity.position

    entity.controllable = entity.id === socket.id

    const velocity = valid(
      (data as PlayerClientData).velocity,
      new Error('Expected ClientData<Player> to include velocity')
    )

    entity.velocity = Vec2.fromArray(velocity)

    return entity
  }
} as const satisfies Record<string, EntityFunction>
