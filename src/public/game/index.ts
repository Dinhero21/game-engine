import type { IClientSocket as Socket } from '../../socket.io.js'
import type Tile from '../engine/util/tilemap/tile.js'
import Vec2, { stringToVec2 } from '../engine/util/vec2.js'
import { CHUNK_SIZE, positionToTilePosition, tilePositionToChunkPosition, TILE_SIZE } from '../engine/util/tilemap/position-conversion.js'
import { animatePosition, TRANSFORMATIONS } from '../engine/patchers/animate.js'
import { ViewportGenerators } from '../engine/camera.js'
import { Chunk } from '../engine/util/tilemap/chunk.js'
import { Center } from '../engine/mixins/center.js'
import { loader } from '../assets/loader.js'
import { createTile } from './tile.js'
import mouse from '../engine/util/input/mouse.js'
import Scene from '../engine/scene.js'
import io from '../socket.io/socket.io.esm.min.js'
import Loop from '../engine/util/loop.js'
import MultiplayerContainerEntity from './entities/multiplayer-container.js'
import TileMapEntity from '../engine/entities/tilemap.js'
import GridContainerEntity from './entities/grid-container.js'
import DebugEntity from './entities/debug.js'

const chunkSize = new Vec2(CHUNK_SIZE, CHUNK_SIZE)

export default function createScene (context: CanvasRenderingContext2D): Scene {
  const socket: Socket = io()

  const scene = new Scene(context)
  const camera = scene.camera

  camera.ViewportGenerator = ViewportGenerators.Center

  const mouseDebug = new DebugEntity('Mouse', new Vec2(0, 0))

  // Instant = Fastest Javascript Allows
  Loop.instant()(delta => {
    scene.update(delta)

    const position = mouse.getPosition()

    mouseDebug.setViewportPosition(position)
  })

  // Draw = Animation Frames
  Loop.draw()(delta => {
    camera.render()
  })

  const tileMap = new TileMapEntity()

  loader.addEventListener('load', event => {
    tileMap.clearCache()
  })

  socket.on('chunk.set', async (rawChunk, rawChunkPosition) => {
    const chunkPosition = new Vec2(...rawChunkPosition)

    const chunk = new Chunk<Tile>(chunkPosition, chunkSize)

    for (const [tileId, tileName] of rawChunk) {
      const tilePosition = stringToVec2(tileId)

      const tile = await createTile(tileName)

      chunk.setTile(tile, tilePosition)
    }

    tileMap.setChunk(chunk, chunkPosition)
  })

  socket.on('tile.set', async (name, rawTilePosition) => {
    const tilePosition = new Vec2(...rawTilePosition)

    const tile = await createTile(name)

    tileMap.setTile(tile, tilePosition)
  })

  Loop.interval(1000 / 12)(() => {
    const chunks = tileMap.getChunks()

    const viewport = camera.getViewport()

    for (const chunk of chunks) {
      const boundingBox = chunk.boundingBox

      if (boundingBox.distance(viewport) < TILE_SIZE * CHUNK_SIZE) continue

      const position = boundingBox.getPosition()
      const tilePosition = positionToTilePosition(position)
      const chunkPosition = tilePositionToChunkPosition(tilePosition)

      socket.emit('chunk.remove', chunkPosition.toArray())

      tileMap.removeChunk(chunkPosition)
    }
  })

  mouse.addEventListener('left.down', () => {
    void (async () => {
      const globalMousePosition = tileMap.getGlobalMousePosition()

      if (globalMousePosition === undefined) return

      const globalMouseTilePosition = positionToTilePosition(globalMousePosition)

      // const tile = await createTile('air')

      // tileMap.setTile(tile, globalMouseTilePosition)

      socket.emit('tile.click', globalMouseTilePosition.toArray())
    })()
  })

  scene.addChild(tileMap)

  const multiplayerContainer = new MultiplayerContainerEntity(socket)
  scene.addChild(multiplayerContainer)

  multiplayerContainer.setOverlapDetector(other => tileMap.overlapping(other))

  const inventory = new (Center(GridContainerEntity))(new Vec2(64, 64), new Vec2(32, 32), (x, y) => new DebugEntity(`${x} ${y}`, new Vec2(128, 128)))
  scene.addChild(inventory)

  const linearAnimationDebug = new DebugEntity('Animation (Linear)')
  scene.addChild(linearAnimationDebug)

  const quadraticAnimationDebug = new DebugEntity('Animation (Quadratic)')
  scene.addChild(quadraticAnimationDebug)

  const cubicAnimationDebug = new DebugEntity('Animation (Cubic)')
  scene.addChild(cubicAnimationDebug)

  const quarticAnimationDebug = new DebugEntity('Animation (Quartic)')
  scene.addChild(quarticAnimationDebug)

  const quinticAnimationDebug = new DebugEntity('Animation (Quintic)')
  scene.addChild(quinticAnimationDebug)

  void (async () => {
    while (true) {
      await Promise.all([
        animatePosition(linearAnimationDebug, new Vec2(512, 0), new Vec2(512 + 64, 0), 1, TRANSFORMATIONS.Linear),
        animatePosition(quadraticAnimationDebug, new Vec2(512, -128), new Vec2(512 + 64, -128), 1, TRANSFORMATIONS.EaseQuadratic),
        animatePosition(cubicAnimationDebug, new Vec2(512, -256), new Vec2(512 + 64, -256), 1, TRANSFORMATIONS.EaseCubic),
        animatePosition(quarticAnimationDebug, new Vec2(512, -384), new Vec2(512 + 64, -384), 1, TRANSFORMATIONS.EaseQuartic),
        animatePosition(quinticAnimationDebug, new Vec2(512, -512), new Vec2(512 + 64, -512), 1, TRANSFORMATIONS.EaseQuintic)
      ])
    }
  })()

  scene.addChild(mouseDebug)

  return scene
}
