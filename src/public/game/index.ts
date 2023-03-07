import Entity from '../engine/entities/base.js'
import Game from '../engine/game.js'
import PlayerEntity from './entities/player.js'
import TestEntity from './entities/test.js'

export default function createGame (context: CanvasRenderingContext2D): Game {
  const game = new Game(context)

  const root = new Entity()
  game.setRoot(root)

  const player = new PlayerEntity()
  root.addChild(player)

  const test = new TestEntity()
  player.addChild(test)

  return game
}
