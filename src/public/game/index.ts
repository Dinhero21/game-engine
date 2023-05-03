import type { IClientSocket as Socket } from '../../socket.io.js'
import { ViewportGenerators } from '../engine/camera.js'
import Scene from '../engine/scene.js'
import io from '../socket.io/socket.io.esm.min.js'
import Loop from '../engine/util/loop.js'
import DebugEntity from './entities/debug.js'
import WorldEntity from './entities/world.js'
import MultiplayerContainerEntity from './entities/multiplayer-container.js'
import mouse from '../engine/util/input/mouse.js'
import { positionToTilePosition } from '../engine/util/tilemap/position-conversion.js'

export default function createScene (context: CanvasRenderingContext2D): Scene {
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
    scene.update(delta)

    const mousePosition = scene.getMouseViewportPosition()

    mouseDebug.setViewportPosition(mousePosition)
  })

  // Draw = Animation Frames
  Loop.draw()(delta => {
    camera.render()
  })

  const world = new WorldEntity(socket)
  scene.addChild(world)

  mouse.addEventListener('left.down', () => {
    void (async () => {
      const mouseGlobalPosition = world.getMouseGlobalPosition()

      if (mouseGlobalPosition === undefined) return

      const globalMouseTilePosition = positionToTilePosition(mouseGlobalPosition)

      socket.emit('tile.click', globalMouseTilePosition.toArray())
    })()
  })

  const multiplayerContainer = new MultiplayerContainerEntity(socket)
  scene.addChild(multiplayerContainer)

  multiplayerContainer.setOverlapDetector(other => world.overlapping(other))

  scene.addChild(mouseDebug)

  return scene
}
