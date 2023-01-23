export class Keyboard {
  #keys = new Set()

  constructor () {
    document.addEventListener('keydown', event => {
      this.#keys.add(event.key.toLowerCase())
    })

    document.addEventListener('keyup', event => {
      this.#keys.delete(event.key.toLowerCase())
    })
  }

  isKeyPressed (key) {
    key = key.toLowerCase()

    return this.#keys.has(key)
  }
}
