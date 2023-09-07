import { EventEmitter } from 'events'
import { type ListenerSignature, type TypedEmitter as TypedEmitterConstructor } from 'tiny-typed-emitter'

export const TypedEmitter = EventEmitter as new<L extends ListenerSignature<L>>() => TypedEmitterConstructor<L>

export type AsyncVoid = void | Promise<void>

export type EventMap<T> = { [K in keyof T]: (...args: any[]) => AsyncVoid }

export class EventHandler<T extends EventMap<T>> {
  protected map = new Map<keyof T, Set<T[keyof T]>>()

  protected async _emit<E extends keyof T> (name: E, ...data: Parameters<T[E]>): Promise<void> {
    const map = this.map

    const set = map.get(name)

    if (set === undefined) return

    for (const listener of set) await listener(...data)
  }

  public register<E extends keyof T> (name: E, callback: T[E]): void {
    const map = this.map

    const set = map.get(name) ?? new Set()
    map.set(name, set)

    set.add(callback)
  }

  public unregister<E extends keyof T> (name: E, callback: T[E]): void {
    const map = this.map

    const set = map.get(name)

    if (set === undefined) return

    set.delete(callback)
  }

  public clear (): void {
    const map = this.map

    map.clear()
  }
}
