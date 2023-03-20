import { ViewportGenerators } from './engine/camera.js'
import Loop from './engine/util/loop.js'
import createScene from './game/index.js'

const view = document.getElementById('view')

if (view === null) throw new Error('Could not find the view element')
if (!(view instanceof HTMLCanvasElement)) throw new Error('The view element is not a canvas element')

const context = view.getContext('2d')

if (context === null) throw new Error('Could not get view context')

const scene = createScene(context)
const camera = scene.camera

camera.ViewportGenerator = ViewportGenerators.Center

// Call scene.update whenever possible
Loop.instant()(delta => { scene.update(delta) })

// Call camera.render every animation frame
Loop.draw()(delta => { camera.render() })

updateViewSize()

window.addEventListener('resize', updateViewSize)

function updateViewSize (): void {
  if (view === null) throw new Error('updateViewSize called with view being null')
  if (!(view instanceof HTMLCanvasElement)) throw new Error('updateViewSize called with view not being a canvas element')

  view.width = window.innerWidth
  view.height = window.innerHeight

  if (context === null) throw new Error('updateViewSize was called with view context being null')

  // ? Should I disable Image Smoothing?
  context.imageSmoothingEnabled = false
}
