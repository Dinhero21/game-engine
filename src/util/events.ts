import { EventEmitter } from 'events'
import { type ListenerSignature, type TypedEmitter as TypedEmitterConstructor } from 'tiny-typed-emitter'

export const TypedEmitter = EventEmitter as new<L extends ListenerSignature<L>>() => TypedEmitterConstructor<L>
