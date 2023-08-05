import type { IClientSocket as Socket } from '../../socket.io'
import MultiplayerContainerEntity from './entities/multiplayer-container'
import WorldEntity from './entities/world'
import UserInterfaceEntity from './entities/user-interface'
import DebugEntity from './entities/debug'
import { ViewportGenerators } from '../engine/camera'
import { lerp } from '../engine/util/math'
import { PrioritizedMouse } from '../engine/util/input/mouse/prioritization'
import { positionToTilePosition } from '../engine/util/tilemap/position-conversion'
import Scene from '../engine/scene'
import Loop from '../engine/util/loop'
import globals from '../globals'
import io from 'socket.io-client'

const GamePerformance = {
  averageUpdateDelta: 0,
  averageDrawDelta: 0,
  averageUpdateTime: 0,
  averageDrawTime: 0
}

declare global {
  interface Window {
    GamePerformance: typeof GamePerformance
  }
}

window.GamePerformance = GamePerformance

export default function createScene (context: CanvasRenderingContext2D): Scene {
  let running = true

  window.addEventListener('error', event => {
    running = false

    const error = event.error

    prettyPrintError(error)
  })

  const socket: Socket = io()

  socket.on('disconnect', reason => {
    document.write(`Disconnected: ${reason}`)

    location.reload()
  })

  socket.on('connect_error', error => {
    document.write(`Connect Error: ${error.message}`)

    location.reload()
  })

  const scene = new Scene(context)
  const camera = scene.camera

  camera.ViewportGenerator = ViewportGenerators.Center

  const mouseDebug = new DebugEntity('Mouse')

  // Instant = Fastest Javascript Allows
  Loop.instant()(delta => {
    const averageUpdateDelta = GamePerformance.averageUpdateDelta
    GamePerformance.averageUpdateDelta = lerp(averageUpdateDelta, delta, 0.1)

    if (!running) return

    const start = performance.now()

    scene.update(delta)

    const end = performance.now()

    const updateTime = (end - start) / 1000

    const averageUpdateTime = GamePerformance.averageUpdateTime
    GamePerformance.averageUpdateTime = lerp(averageUpdateTime, updateTime, 0.1)

    const mousePosition = scene.getMouseViewportPosition()

    mouseDebug.setViewportPosition(mousePosition)
  })

  // Draw = Animation Frames
  Loop.draw()(delta => {
    const averageDrawDelta = GamePerformance.averageDrawDelta
    GamePerformance.averageDrawDelta = lerp(averageDrawDelta, delta, 0.1)

    if (!running) return

    const start = performance.now()

    camera.render()

    const end = performance.now()

    const drawTime = (end - start) / 1000

    const averageDrawTime = GamePerformance.averageDrawTime
    GamePerformance.averageDrawTime = lerp(averageDrawTime, drawTime, 0.1)

    if (!globals.experiments['3d']) return

    const canvas = context.canvas

    const buffer = new OffscreenCanvas(canvas.width, canvas.height)

    const bufferContext = buffer.getContext('2d')

    if (bufferContext === null) return

    context.strokeStyle = 'red'
    context.lineWidth = 1
    context.strokeRect(0, 0, canvas.width, canvas.height)

    bufferContext.drawImage(canvas, 0, 0)

    context.clearRect(0, 0, canvas.width, canvas.height)

    context.imageSmoothingEnabled = false

    for (let i = -0.1; i < 0; i += 0.001) {
      const zoom = i

      const x = Math.floor(canvas.width * zoom)
      const y = Math.floor(canvas.height * zoom)

      context.drawImage(
        buffer,
        0, 0,
        canvas.width, canvas.height,
        -x, -y,
        canvas.width + x * 2, canvas.height + y * 2
      )
    }
  })

  const world = new WorldEntity(socket)
  scene.addChild(world)

  new PrioritizedMouse(() => world.getPath()).addEventListener('left.down', () => {
    const mouseGlobalPosition = world.getMouseGlobalPosition()

    if (mouseGlobalPosition === undefined) return

    const globalMouseTilePosition = positionToTilePosition(mouseGlobalPosition)

    socket.emit('tile.click', globalMouseTilePosition.toArray())
  })

  const multiplayerContainer = new MultiplayerContainerEntity(socket)
  scene.addChild(multiplayerContainer)

  multiplayerContainer.setOverlapDetector(other => world.overlapping(other))

  const ui = new UserInterfaceEntity(socket)
  scene.addChild(ui)

  ui.crafting.manager.addEventListener('crafted', event => {
    socket.emit('recipe.crafted', event.recipe)
  })

  scene.addChild(mouseDebug)

  return scene

  function prettyPrintError (error: Error): void {
    Loop.draw()(delta => {
      context.font = '32px monospace'
      context.fillStyle = 'red'

      const stack = error.stack ?? 'undefined'
      const lines = stack.split('\n')

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const y = (i + 1) * 32

        context.fillText(line, 0, y)
      }
    })
  }
}
