import type Entity from './base'
import { Merge } from '../../public/engine/util/reflection'
import { type ListenerSignature, TypedEmitter } from 'tiny-typed-emitter'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Emitting<L extends ListenerSignature<L>> (E: typeof Entity) {
  // Wrapper so TypedEmitter does not get constructed
  // with world (shouldn't matter anyways)
  class Emitter extends TypedEmitter<L> {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor () {
      super()
    }
  }

  return Merge(Emitter, E)
}

export default Emitting
