import type { IClientSocket as Socket } from '../../socket.io.js'
import { ViewportGenerators } from '../engine/camera.js'
import Scene from '../engine/scene.js'
import io from '../socket.io/socket.io.esm.min.js'
import Loop from '../engine/util/loop.js'
import DebugEntity from './entities/debug.js'
import UserInterfaceEntity from './entities/user-interface/index.js'
import { lerp } from '../engine/util/math.js'

export default function createScene (context: CanvasRenderingContext2D): Scene {
  let averageUpdateDelta = 0
  let averageDrawDelta = 0

  let running = true

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

  // Instant = Fastest Javascript Allows
  Loop.instant()(delta => {
    averageUpdateDelta = lerp(averageUpdateDelta, delta, 0.1)

    if (!running) return

    try {
      scene.update(delta)
    } catch (error) {
      if (!(error instanceof Error)) throw error as any

      prettyPrintError(error)

      running = false

      throw error
    }

    const mousePosition = scene.getMouseViewportPosition()

    mouseDebug.setViewportPosition(mousePosition)
  })

  // Draw = Animation Frames
  Loop.draw()(delta => {
    averageDrawDelta = lerp(averageDrawDelta, delta, 0.1)

    if (!running) return

    try {
      camera.render()
    } catch (error) {
      if (!(error instanceof Error)) throw error as any

      prettyPrintError(error)

      running = false

      throw error
    }
  })

  // Loop.interval(1000 / 6)(() => {
  //   console.clear()
  //   console.table({
  //     update: Math.floor(1 / averageUpdateDelta),
  //     draw: Math.floor(1 / averageDrawDelta)
  //   })
  // })

  const mouseDebug = new DebugEntity('Mouse')

  // const world = new WorldEntity(socket)
  // scene.addChild(world)

  // new PrioritizedMouse(() => world.getPath()).addEventListener('left.down', () => {
  //   const mouseGlobalPosition = world.getMouseGlobalPosition()

  //   if (mouseGlobalPosition === undefined) return

  //   const globalMouseTilePosition = positionToTilePosition(mouseGlobalPosition)

  //   socket.emit('tile.click', globalMouseTilePosition.toArray())
  // })

  // const multiplayerContainer = new MultiplayerContainerEntity(socket)
  // scene.addChild(multiplayerContainer)

  // multiplayerContainer.setOverlapDetector(other => world.overlapping(other))

  const ui = new UserInterfaceEntity(socket)
  scene.addChild(ui)

  // scene.addChild(mouseDebug)

  // globals.debug.entity.collider = true

  return scene

  function prettyPrintError (error: Error): void {
    let i = 0
    let linesDrawn = 0

    Loop.draw()(delta => {
      i += delta * 36

      context.font = '32px cursive'
      context.fillStyle = `hsl(${i},100%,50%)`

      const stack = error.stack ?? 'undefined'
      const lines = stack.split('\n')

      for (let i = 0; i < lines.length && i < linesDrawn; i++) {
        const line = lines[i]
        const y = (i + 1) * 32

        context.fillText(line, 0, y)
      }
    })

    setInterval(() => {
      linesDrawn++
    }, 10)
  }
}
