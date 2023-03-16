import Entity from './entities/base.js'

// TODO: Make canvas accessible from Entity
export class Scene extends Entity {
  public getScene (): Scene {
    return this
  }

  public updateLoop (callback: (delta: number) => void, lastTime = Date.now()): void {
    const now = Date.now()
    const delta = (now - lastTime) / 1000

    if (delta !== 0) callback(delta)

    setTimeout(() => { this.updateLoop(callback, now) })
  }
}

export default Scene
