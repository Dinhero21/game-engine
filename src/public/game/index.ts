// import { MultiplayerContainerEntity } from './entities/multiplayer-container.js'
// import { TileMapEntity } from '../engine/entities/tilemap.js'
import Scene from '../engine/scene.js'
import Vec2 from '../engine/util/vec2.js'
import PlayerEntity from './entities/player.js'

export default function createScene (context: CanvasRenderingContext2D): Scene {
  // const canvas = context.canvas

  const scene = new Scene(context)

  // const tileMap = new TileMapEntity()
  // scene.addChild(tileMap)

  // for (let x = 0; x < canvas.width / 32; x++) {
  //   for (let y = 0; y < canvas.height / 32; y++) {
  //     const id = x ^ y

  //     tileMap.setTile(new Vec2(x, y), id)
  //   }
  // }

  // const multiplayerContainer = new MultiplayerContainerEntity()
  // scene.addChild(multiplayerContainer)

  const player = new PlayerEntity('amogus', new Vec2(0, 0))
  player.controllable = true

  scene.addChild(player)

  return scene
}
