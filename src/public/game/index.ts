import type { IClientSocket as Socket } from '../../socket.io.js'
import type Tile from '../engine/util/tilemap/tile.js'
import Vec2, { stringToVec2 } from '../engine/util/vec2.js'
import { CHUNK_SIZE, positionToTilePosition, tilePositionToChunkPosition, TILE_SIZE } from '../engine/util/tilemap/position-conversion.js'
import { animatePosition, TRANSFORMATIONS } from '../engine/patchers/animate.js'
import { ViewportGenerators } from '../engine/camera.js'
import { Chunk } from '../engine/util/tilemap/chunk.js'
import { loader } from '../assets/loader.js'
import { createTile } from './tile.js'
import { InventoryEntity } from './entities/inventory.js'
import mouse from '../engine/util/input/mouse.js'
import Scene from '../engine/scene.js'
import io from '../socket.io/socket.io.esm.min.js'
import Loop from '../engine/util/loop.js'
import MultiplayerContainerEntity from './entities/multiplayer-container.js'
import TileMapEntity from '../engine/entities/tilemap.js'
import DebugEntity from './entities/debug.js'
import ButtonEntity from '../engine/entities/button.js'

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

  const button = new ButtonEntity(new Vec2(256, 256))
  const buttonDebug = new DebugEntity('Button', new Vec2(256, 256))

  button.position.x = -512
  buttonDebug.position.x = -512

  // Instant = Fastest Javascript Allows
  Loop.instant()(delta => {
    scene.update(delta)

    const mousePosition = scene.getMouseViewportPosition()

    mouseDebug.setViewportPosition(mousePosition)
  })

  // Draw = Animation Frames
  Loop.draw()(delta => {
    buttonDebug.title = [
      'Button'
      // `Left: ${(button as any).clickStates.left as string}`,
      // `Right: ${(button as any).clickStates.right as string}`,
      // `Middle: ${(button as any).clickStates.middle as string}`
    ]

    camera.render()
  })

  scene.addChild(mouseDebug)

  scene.addChild(button)

  scene.addChild(buttonDebug)

  return scene
}
