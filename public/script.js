import MouseEntity from './engine/entities/mouse.js'
import BaseEntity from './engine/entities/base.js'
import Game from './engine/game.js'
import ExampleEntity from './engine/entities/example.js'
import Vec2 from './engine/vec2.js'

const screen = document.getElementById('screen')
const context = screen.getContext('2d')

updateScreenSize()

window.addEventListener('resize', updateScreenSize)

const game = new Game(context)

const base = new BaseEntity()
game.setEntity(base)

const example = new ExampleEntity()
base.addChild(example)

const mouse = new MouseEntity()
example.addChild(mouse)

example.setPosition(new Vec2(256, 256))

// TODO: Separate screen logic
function updateScreenSize () {
  screen.width = window.innerWidth
  screen.height = window.innerHeight
}
