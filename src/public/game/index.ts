import Entity from '../engine/entities/base.js'
import Game from '../engine/game.js'
import Player from './entities/player.js'

export default function createGame (context: CanvasRenderingContext2D): Game {
  const game = new Game(context)

  const root = new Entity()
  game.setRoot(root)

  const player = new Player()
  root.addChild(player)

  return game
}
