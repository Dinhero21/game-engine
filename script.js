import TestEntity from './engine/entities/test.js'
import Game from './engine/game.js'

const screen = document.getElementById('screen')
const context = screen.getContext('2d')

updateScreenSize()

window.addEventListener('resize', updateScreenSize)

const game = new Game(context)

const entity = new TestEntity()

game.setEntity(entity)

// TODO: Separate screen logic
function updateScreenSize () {
  screen.width = window.innerWidth
  screen.height = window.innerHeight
}
