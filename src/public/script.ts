import createGame from './game/index.js'

const view = document.getElementById('view')

if (view === null) throw new Error('Could not find the view element')
if (!(view instanceof HTMLCanvasElement)) throw new Error('The view element is not a canvas element')

const context = view.getContext('2d')

if (context === null) throw new Error('Could not get view context')

const game = createGame(context)

game.start()

updateViewSize()

window.addEventListener('resize', updateViewSize)

function updateViewSize (): void {
  if (view === null) throw new Error('updateViewSize called with view being null')
  if (!(view instanceof HTMLCanvasElement)) throw new Error('updateViewSize called with view not being a canvas element')

  // TODO: Resize view canvas without messing up TileMap Tile (and other entities's) size
  view.width = window.innerWidth
  view.height = window.innerHeight
}
