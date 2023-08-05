export class EventFrame<Emitter extends EventTarget> {
  private readonly emitter: Emitter

  private readonly _listeners = new Set<Parameters<Emitter['removeEventListener']> | Parameters<Emitter['removeEventListener']>>()

  constructor (emitter: Emitter) {
    this.emitter = emitter
  }

  public addEventListener (...args: Parameters<Emitter['addEventListener']>): ReturnType<Emitter['addEventListener']> {
    this._listeners.add(args)

    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    return this.emitter.addEventListener.apply(this.emitter, args) as ReturnType<Emitter['addEventListener']>
  }

  public removeEventListener (...args: Parameters<Emitter['removeEventListener']>): ReturnType<Emitter['removeEventListener']> {
    this._listeners.delete(args)

    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    return this.emitter.removeEventListener.apply(this.emitter, args) as ReturnType<Emitter['removeEventListener']>
  }

  public dispatchEvent (...args: Parameters<Emitter['dispatchEvent']>): ReturnType<Emitter['dispatchEvent']> {
    return this.emitter.dispatchEvent.apply(this.emitter, args) as ReturnType<Emitter['dispatchEvent']>
  }

  public free (): void {
    for (const listener of this._listeners) this.removeEventListener(...listener)
  }
}
