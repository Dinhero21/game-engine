import Game from './engine/game.js'
import ContainerEntity from './engine/entities/container.js'
import TestEntity from './engine/entities/test.js'

const screen = document.getElementById('screen')
const context = screen.getContext('2d')

const game = new Game(context)

const container = new ContainerEntity()
game.setEntity(container)

const entity = new TestEntity()
container.addChild(entity)