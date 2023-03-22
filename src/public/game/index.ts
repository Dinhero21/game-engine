// import { MultiplayerContainerEntity } from './entities/multiplayer-container.js'
import { TileMapEntity } from '../engine/entities/tilemap.js'
import Scene from '../engine/scene.js'
import Vec2 from '../engine/util/vec2.js'
import PlayerEntity from './entities/player.js'

export default function createScene (context: CanvasRenderingContext2D): Scene {
  // const canvas = context.canvas

  const scene = new Scene(context)
  const camera = scene.camera
  const cameraSize = camera.size

  const tileMap = new TileMapEntity()
  scene.addChild(tileMap)

  for (let x = -(cameraSize.x / 2) / 32; x < (cameraSize.x / 2) / 32; x++) {
    for (let y = -(cameraSize.y / 2) / 32; y < (cameraSize.y / 2) / 32; y++) {
      const id = x ^ y

      tileMap.setTile({ id }, new Vec2(x, y))
    }
  }

  // const multiplayerContainer = new MultiplayerContainerEntity()
  // scene.addChild(multiplayerContainer)

  const player = new PlayerEntity('amogus', new Vec2(0, 0))
  player.controllable = true

  scene.addChild(player)

  return scene
}
