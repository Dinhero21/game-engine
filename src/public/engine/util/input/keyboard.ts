import { TypedEventTarget } from '../typed-event-target'

type KeyType = 'up' | 'down'
type KeyboardEventType = `key.${KeyType}`

type KeyFilter = string | ((event: KeyboardEventTargetEvent) => boolean)

// TODO: Find a better name for this (that doesn't conflict with KeyboardEvent)
class KeyboardEventTargetEvent extends Event {
  public readonly key
  public readonly code

  constructor (type: KeyType, key: string, code: string) {
    super(`key.${type}`)

    this.key = key
    this.code = code
  }

  public isNumpad (): boolean {
    return this.code.startsWith('Numpad')
  }

  public getNumber (): number {
    return parseInt(this.key)
  }
}

type KeyboardEventMap = Record<KeyboardEventType, KeyboardEventTargetEvent>

export class Keyboard extends TypedEventTarget<KeyboardEventMap> {
  constructor () {
    super()

    window.addEventListener('keydown', event => { this.onKeyDown(event) })
    window.addEventListener('keyup', event => { this.onKeyUp(event) })
  }

  private readonly keys = new Set<string>()

  private onKeyDown (event: KeyboardEvent): void {
    const keys = this.keys

    const { key, code } = event

    keys.add(key.toLowerCase())
    keys.add(code.toLowerCase())

    // ? Should I dispatch before or after the set add?
    this.dispatchTypedEvent('key.down', new KeyboardEventTargetEvent('down', key, code))
  }

  private onKeyUp (event: KeyboardEvent): void {
    const keys = this.keys

    const { key, code } = event

    keys.delete(event.key.toLowerCase())
    keys.delete(event.code.toLowerCase())

    // ? Should I dispatch before or after the set add?
    this.dispatchTypedEvent('key.up', new KeyboardEventTargetEvent('up', key, code))
  }

  public isKeyDown (key: string): boolean {
    const keys = this.keys

    return keys.has(key.toLowerCase())
  }

  public async wait (type: keyof KeyboardEventMap, filter: KeyFilter): Promise<void> {
    if (typeof filter === 'string') {
      filter = filter.toLowerCase()

      filter = event => event.key.toLowerCase() === filter || event.code.toLowerCase() === filter
    }

    // Necessary for TypeScript to recognize that filter isn't a string anymore
    const predicate = filter

    await new Promise<void>(resolve => {
      this.addEventListener(type, event => {
        if (!predicate(event)) return

        resolve()
      })
    })
  }

  public async waitForKeyDown (filter: KeyFilter): Promise<void> {
    await this.wait('key.down', filter)
  }

  public async waitForKeyUp (filter: KeyFilter): Promise<void> {
    await this.wait('key.up', filter)
  }
}

export default new Keyboard()
