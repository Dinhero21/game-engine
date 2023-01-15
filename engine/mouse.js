import Vec2 from "./vec2.js"

export class Mouse extends EventTarget {
  #position = new Vec2()
  #buttons = 0

  #element

  constructor (element) {
    super()

    this.#element = element

    element.addEventListener('mousedown', event => this.onMouseDown(event), true)
    element.addEventListener('mouseup', event => this.onMouseUp(event), true)

    element.addEventListener('mousemove', event => this.onMouseMove(event), true)
  }

  onMouseDown (event) {
    this.#buttons = event.buttons
  }

  onMouseUp (event) {
    this.#buttons = event.buttons
  }

  onMouseMove (event) {
    const position = this.#position
    const element = this.#element

    position.set(
      event.clientX,
      event.clientY
    )

    position.divide(
      new Vec2(
        window.innerWidth,
        window.innerHeight
      )
    )

    position.scale(
      new Vec2(
        element.width,
        element.height
      )
    )

    // position.subtract(
    //   new Vec2(
    //     element.offsetLeft,
    //     element.offsetTop
    //   )
    // )
  }

  getPosition () {
    return this.#position
  }

  isButtonPressed (id) {
    return Boolean(this.#buttons & (1 << id))
  }

  isLeftButtonPressed () {
    return this.isButtonPressed(0)
  }

  isRightButtonPressed () {
    return this.isButtonPressed(1)
  }

  isMiddleButtonPressed () {
    return this.isButtonPressed(2)
  }
}

export default Mouse