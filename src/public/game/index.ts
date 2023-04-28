import type { IClientSocket as Socket } from '../../socket.io.js'
import { ViewportGenerators } from '../engine/camera.js'
import Scene from '../engine/scene.js'
import io from '../socket.io/socket.io.esm.min.js'
import Loop from '../engine/util/loop.js'
import DebugEntity from './entities/debug.js'
import InventoryEntity from './entities/inventory.js'
import Vec2 from '../engine/util/vec2.js'

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

  const inventory = new InventoryEntity(new Vec2(3, 3), new Vec2(16, 16), new Vec2(16, 16))
  scene.addChild(inventory)

  scene.addChild(mouseDebug)

  return scene
}
