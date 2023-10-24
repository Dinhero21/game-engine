import { valid } from './none'

const message = valid(
  document.getElementById('message'),
  new Error('null #message')
)

message.innerText += '\nloading canvas renderer'

let text = ''
let progress = 0

// TODO: Make this a separate file shared between /bootstrap and /plugin/bootstrap
const view = valid(
  document.getElementById('view'),
  new Error('null #view')
)

if (!(view instanceof HTMLCanvasElement)) throw new Error('#view not HTMLCanvasElement')

const context = valid(
  view.getContext('2d'),
  new Error('Failed to get canvas context')
)

function render (): void {
  if (!(view instanceof HTMLCanvasElement)) throw new Error('#view not HTMLCanvasElement')

  context.clearRect(
    0, 0,
    view.width, view.height
  )

  context.fillStyle = 'white'
  context.fillRect(
    0, 0,
    view.width * progress, view.height
  )

  context.globalCompositeOperation = 'xor'

  context.font = '64px monospace'
  context.fillText(text, 0, view.height)
}

updateViewSize()

window.addEventListener('resize', updateViewSize)

function updateViewSize (): void {
  if (!(view instanceof HTMLCanvasElement)) throw new Error('#view not HTMLCanvasElement')

  view.width = window.innerWidth
  view.height = window.innerHeight
}

message.innerText += '\nfetching bundle'

const response = await fetch('bundle.js')

message.innerText = 'parsing response'

const reader = valid(
  response.body?.getReader(),
  new Error('Failed to get response body reader while initializing bundle')
)

const contentLength = parseInt(valid(
  response.headers.get('Content-Length'),
  new Error('Failed to get bundle size')
))

message.remove()

let receivedLength = 0

const chunks = []
while (true) {
  const { done, value } = await reader.read()

  if (done) break

  chunks.push(value)
  receivedLength += value.length

  progress = receivedLength / contentLength
  text = `${(progress * 100).toPrecision(3)}%`

  render()
}

const blob = new Blob(chunks, { type: 'application/javascript' })

const script = document.createElement('script')
script.src = URL.createObjectURL(blob)

document.head.appendChild(script)

// * Required to make this a module
export {}
