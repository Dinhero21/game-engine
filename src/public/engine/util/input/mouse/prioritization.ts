import { type MouseEventEmitter, type MouseEventEmitterEventMap } from './index.js'
import { TypedEventTarget } from '../../typed-event-target.js'
import { Mouse } from './index.js'

/*
a instanceof PrioritizedMouseEventEmitter
b instanceof PrioritizedMouseEventEmitter

a !== b

---

Example 1: Event.stopPropagation()

a.addEventListener('mousedown', event => {
  e.stopPropagation()

  // Gets executed!
})

a.addEventListener('mousedown', event => {
  // Gets executed!
})

b.addEventListener('mousedown', event => {
  // Does not get executed :(
})

Example 2: Stop immediate propagation

a.addEventListener('mousedown', event => {
  e.stopImmediatePropagation()

  // Gets executed!
})

a.addEventListener('mousedown', event => {
  // Does not get executed :(
})

b.addEventListener('mousedown', event => {
  // Gets executed!
})
*/

type Priority = () => number[]

interface PrioritizedMouseEvent {
  callback: (event: MouseEvent) => void
  priority: Priority
}

const prioritizedEventMap = new Map<MouseEventEmitter, Set<PrioritizedMouseEvent>>()

export class PrioritizedMouseEventEmitter extends TypedEventTarget<MouseEventEmitterEventMap> implements MouseEventEmitter {
  public readonly free

  constructor (priority: Priority, emitter: MouseEventEmitter = window) {
    super()

    const first = !prioritizedEventMap.has(emitter)

    const prioritizedEvents = prioritizedEventMap.get(emitter) ?? new Set()
    prioritizedEventMap.set(emitter, prioritizedEvents)

    const event = {
      callback: (event: MouseEvent) => {
        const type = event.type as keyof MouseEventEmitterEventMap

        const subEvent = new MouseEvent(type, event)

        subEvent.stopPropagation = () => {
          event.stopImmediatePropagation()
        }

        this.dispatchTypedEvent(type, subEvent)
      },
      priority
    }

    prioritizedEvents.add(event)

    this.free = () => {
      prioritizedEvents.delete(event)
    }

    if (!first) return

    for (const type of ['mousemove', 'mousedown', 'mouseup'] as const) {
      emitter.addEventListener(type, event => {
        const prioritizedEventArray = Array.from(prioritizedEvents)

        prioritizedEventArray.sort((a, b) => {
          const aPriorityArray = a.priority()
          const bPriorityArray = b.priority()

          const length = Math.max(aPriorityArray.length, bPriorityArray.length)
          for (let i = 0; i < length; i++) {
            const aPriority = aPriorityArray[i] ?? -1
            const bPriority = bPriorityArray[i] ?? -1

            if (aPriority === bPriority) continue

            return bPriority - aPriority
          }

          return 0
        })

        const subEvent = new MouseEvent(event.type, event)

        let running = true

        subEvent.stopImmediatePropagation = () => {
          running = false
        }

        for (const prioritizedEvent of prioritizedEventArray) {
          if (!running) break

          prioritizedEvent.callback(subEvent)
        }
      })
    }
  }
}

export class PrioritizedMouse extends Mouse {
  private readonly _emitter

  constructor (priority: Priority, emitter?: MouseEventEmitter) {
    const _emitter = new PrioritizedMouseEventEmitter(priority, emitter)

    super(_emitter)

    this._emitter = _emitter
  }

  public free (): this {
    this._emitter.free()

    super.free()

    return this
  }
}

// const a = new PrioritizedMouseEventEmitter([0], window)
// const b = new PrioritizedMouseEventEmitter([1], window)

// {
//   a.addEventListener('mousedown', e => {
//     e.stopPropagation()

//     console.log('a1')
//   })

//   a.addEventListener('mousedown', e => {
//     console.log('a2')
//   })

//   b.addEventListener('mousedown', e => {
//     console.log('b')
//   })
// }

// {
//   a.addEventListener('mousedown', e => {
//     e.stopImmediatePropagation()

//     console.log('a1')
//   })

//   a.addEventListener('mousedown', e => {
//     console.log('a2')
//   })

//   b.addEventListener('mousedown', e => {
//     console.log('b')
//   })
// }
