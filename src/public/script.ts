import createScene from './game/index.js'

const view = document.getElementById('view')

if (view === null) throw new Error('Could not find the view element')
if (!(view instanceof HTMLCanvasElement)) throw new Error('The view element is not a canvas element')

view.addEventListener('contextmenu', event => {
  event.stopPropagation()
  event.preventDefault()
  event.stopImmediatePropagation()

  return false
})

const context = view.getContext('2d')

if (context === null) throw new Error('Could not get view context')

createScene(context)

updateViewSize()

window.addEventListener('resize', updateViewSize)

function updateViewSize (): void {
  if (view === null) throw new Error('updateViewSize called with view being null')
  if (!(view instanceof HTMLCanvasElement)) throw new Error('updateViewSize called with view not being a canvas element')

  view.width = window.innerWidth
  view.height = window.innerHeight
}
