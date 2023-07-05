export type Callback = (delta: number) => void

// TODO: Add an option to use performance instead of Date
export const Loop = {
  interval (ms?: number, lastTime = performance.now()) {
    return (callback: Callback) => {
      const now = performance.now()
      const delta = (now - lastTime) / 1000

      if (delta !== 0) callback(delta)

      setTimeout(() => { this.interval(ms, now)(callback) }, ms)
    }
  },
  draw (lastTimestamp = 0, timestamp = 0) {
    return (callback: Callback) => {
      const delta = (timestamp - lastTimestamp) / 1000

      // Avoid divisions by 0
      if (delta !== 0) callback(delta)

      requestAnimationFrame(newTimestamp => { this.draw(timestamp, newTimestamp)(callback) })
    }
  },
  instant () {
    return this.interval()
  }
}

export default Loop
