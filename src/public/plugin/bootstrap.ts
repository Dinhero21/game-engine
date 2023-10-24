import createScene from '../game'
import { valid } from '../none'

const view = valid(
  document.getElementById('view'),
  new Error('null #view')
)

if (!(view instanceof HTMLCanvasElement)) throw new Error('#view not HTMLCanvasElement')

view.addEventListener('contextmenu', event => {
  event.stopPropagation()
  event.preventDefault()
  event.stopImmediatePropagation()

  return false
})

const context = valid(
  view.getContext('2d'),
  new Error('Failed to get canvas context')
)

export const scene = createScene(context)
