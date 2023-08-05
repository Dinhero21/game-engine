// TODO: Promises (Wait for key state)
export class Keyboard {
  private readonly keys = new Set<string>()

  constructor () {
    window.addEventListener('keydown', event => { this.onKeyDown(event) })
    window.addEventListener('keyup', event => { this.onKeyUp(event) })
  }

  private onKeyDown (event: KeyboardEvent): void {
    const keys = this.keys

    keys.add(event.key.toLowerCase())
    keys.add(event.code.toLowerCase())
  }

  private onKeyUp (event: KeyboardEvent): void {
    const keys = this.keys

    keys.delete(event.key.toLowerCase())
    keys.delete(event.code.toLowerCase())
  }

  public isKeyDown (key: string): boolean {
    const keys = this.keys

    return keys.has(key.toLowerCase())
  }
}

export default new Keyboard()
