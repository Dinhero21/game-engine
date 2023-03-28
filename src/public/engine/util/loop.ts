export type Callback = (delta: number) => void

// TODO: Add an option to use performance instead of Date
export const Loop = {
  interval (ms?: number, lastTime = Date.now()) {
    return (callback: Callback) => {
      const now = Date.now()
      const delta = (now - lastTime) / 1000

      if (delta !== 0) callback(delta)

      setTimeout(() => { this.interval(ms, now)(callback) }, ms)
    }
  },
  draw (lastTime = Date.now()) {
    return (callback: Callback) => {
      const now = Date.now()
      const delta = (now - lastTime) / 1000

      if (delta !== 0) callback(delta)

      requestAnimationFrame(() => { this.draw(now)(callback) })
    }
  },
  instant () {
    return this.interval()
  }
}

export default Loop
