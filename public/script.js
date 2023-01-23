import TestEntity from './engine/entities/test.js'
import BaseEntity from './engine/entities/base.js'
import Game from './engine/game.js'

const screen = document.getElementById('screen')
const context = screen.getContext('2d')

updateScreenSize()

window.addEventListener('resize', updateScreenSize)

const game = new Game(context)

const base = new BaseEntity()
game.setEntity(base)

const entity = new TestEntity()

base.addChild(entity)

// TODO: Separate screen logic
function updateScreenSize () {
  screen.width = window.innerWidth
  screen.height = window.innerHeight
}
