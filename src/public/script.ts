import createGame from './game/index.js'

const view = document.getElementById('view')

if (view === null) throw new Error('Could not find the view element')
if (!(view instanceof HTMLCanvasElement)) throw new Error('The view element is not a canvas element')

const context = view.getContext('2d')

if (context === null) throw new Error('Could not get view context')

/* const game = */ createGame(context)

updateViewSize()

window.addEventListener('resize', updateViewSize)

function updateViewSize (): void {
  if (view === null) throw new Error('updateViewSize called with view being null')
  if (!(view instanceof HTMLCanvasElement)) throw new Error('updateViewSize called with context not being not being a canvas element')
  if (context === null) throw new Error('updateViewSize called with context being null')

  view.width = window.innerWidth
  view.height = window.innerHeight
}
