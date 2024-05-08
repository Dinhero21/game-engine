import { valid } from '../../none'

function getView (): HTMLCanvasElement {
  const element = valid(
    document.getElementById('view'),
    new Error('null #view')
  )

  if (!(element instanceof HTMLCanvasElement)) throw new Error('#view not HTMLCanvasElement')

  return element
}

export const view = getView()
view.addEventListener('contextmenu', event => {
  event.stopPropagation()
  event.preventDefault()
  event.stopImmediatePropagation()

  return false
})

export const context = valid(
  view.getContext('2d'),
  new Error('Failed to get canvas context')
)
