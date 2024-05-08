type AsyncVoid = void | Promise<void>

type EventListener<T extends Event> = (event: T) => AsyncVoid

interface EventListenerObject<T extends Event> {
  handleEvent: (object: T) => AsyncVoid
}

type EventListenerOrObject<T extends Event> = EventListener<T> | EventListenerObject<T>

type EventMap<T> = { [K in keyof T]: Event }

type Stringify<T> = Extract<T, string>

export interface TypedEventTarget<M extends EventMap<M>> {
  addEventListener: <K extends Stringify<keyof M>>(
    type: K,
    callback: EventListenerOrObject<M[K]> | null,
    options?: AddEventListenerOptions | boolean
  ) => void

  dispatchEvent: <K extends Stringify<keyof M>>(event: M[K]) => boolean

  removeEventListener: <K extends Stringify<keyof M>>(
    type: K,
    callback: EventListenerOrObject<M[K]> | null,
    options?: EventListenerOptions | boolean
  ) => void
}

export class TypedEventTarget<M extends EventMap<M>> extends EventTarget {}

export default TypedEventTarget
