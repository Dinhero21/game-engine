import PlayerInventoryEntity from './entities/player-inventory.js'
import type { IClientSocket as Socket } from '../../socket.io.js'
import { ViewportGenerators } from '../engine/camera.js'
import { positionToTilePosition } from '../engine/util/tilemap/position-conversion.js'
import Scene from '../engine/scene.js'
import io from '../socket.io/socket.io.esm.min.js'
import Loop from '../engine/util/loop.js'
import DebugEntity from './entities/debug.js'
import WorldEntity from './entities/world.js'
import MultiplayerContainerEntity from './entities/multiplayer-container.js'
import Vec2 from '../engine/util/vec2.js'
import ViewportRelativeEntity from '../engine/entities/viewport.js'
import { PrioritizedMouse } from '../engine/util/input/mouse/prioritization.js'
import CraftingEntity from './entities/crafting.js'
import { UserInterfaceEntity } from './entities/ui.js'

export default function createScene (context: CanvasRenderingContext2D): Scene {
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

  const mouseDebug = new DebugEntity('Mouse')

  // Instant = Fastest Javascript Allows
  Loop.instant()(delta => {
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

  scene.addChild(mouseDebug)

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
