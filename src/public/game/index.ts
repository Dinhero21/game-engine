import { MultiplayerContainerEntity } from './entities/multiplayer-container.js'
import { TileMapEntity } from '../engine/entities/tilemap.js'
import Scene from '../engine/scene.js'
import Vec2 from '../engine/util/vec2.js'

export default function createScene (context: CanvasRenderingContext2D): Scene {
  const canvas = context.canvas

  const scene = new Scene()

  const tileMap = new TileMapEntity()
  scene.addChild(tileMap)

  for (let x = 0; x < canvas.width / 32; x++) {
    for (let y = 0; y < canvas.height / 32; y++) {
      const id = x ^ y

      tileMap.setTile(new Vec2(x, y), id)
    }
  }

  const multiplayerContainer = new MultiplayerContainerEntity()
  scene.addChild(multiplayerContainer)

  return scene
}
