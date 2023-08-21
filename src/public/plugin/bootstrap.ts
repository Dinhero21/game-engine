import createScene from '../game'

const view = document.getElementById('view')

if (view === null) throw new Error('null #view')
if (!(view instanceof HTMLCanvasElement)) throw new Error('#view not HTMLCanvasElement')

view.addEventListener('contextmenu', event => {
  event.stopPropagation()
  event.preventDefault()
  event.stopImmediatePropagation()

  return false
})

const context = view.getContext('2d')

if (context === null) throw new Error('null #view context')

export const scene = createScene(context)

updateViewSize()

window.addEventListener('resize', updateViewSize)

function updateViewSize (): void {
  if (view === null) throw new Error('null #view')
  if (!(view instanceof HTMLCanvasElement)) throw new Error('#view not HTMLCanvasElement')

  view.width = window.innerWidth
  view.height = window.innerHeight
}
