import { scene, camera } from './main'
import { createStat, DebugGUI } from './gui'
import Loop from '../../../../engine/util/loop'
import { valid } from '../../../../none'
import { context } from '../../canvas'

export const GAME_LOOP_OPTIONS = {
  // TODO: Make the loop interval configurable
  UPDATE_INTERVAL: 0,
  RUNNING: true
}

export interface Phase {
  frame: number
  delta: number
}

// ? Should delta be initialized as NaN
export const GameLoop: {
  update: Phase
  draw: Phase
} = {
  update: {
    frame: 0,
    delta: NaN
  },
  draw: {
    frame: 0,
    delta: NaN
  }
}

// Game Loop

const updateStat = createStat('update')
Loop.interval(GAME_LOOP_OPTIONS.UPDATE_INTERVAL)(delta => {
  GameLoop.update.delta = delta
  GameLoop.update.frame++

  if (!GAME_LOOP_OPTIONS.RUNNING) return

  updateStat.begin()

  scene.update(delta)

  updateStat.end()
})

const drawStat = createStat('draw')
Loop.draw()(delta => {
  GameLoop.draw.delta = delta
  GameLoop.draw.frame++

  if (!GAME_LOOP_OPTIONS.RUNNING) return

  drawStat.begin()

  camera.render()

  drawStat.end()
})

// GUI

const stat = DebugGUI.addFolder('stat.js')

const stats = {
  update: false,
  draw: false
}

stat.add(stats, 'update')
  .onChange(state => {
    updateStat.dom.style.visibility = state as boolean ? 'visible' : 'hidden'
  })
  .setValue(stats.update)

stat.add(stats, 'draw')
  .onChange(state => {
    drawStat.dom.style.visibility = state as boolean ? 'visible' : 'hidden'
  })
  .setValue(stats.draw)

// Error Handling

window.addEventListener('error', event => {
  GAME_LOOP_OPTIONS.RUNNING = false

  const error = valid(
    event.error,
    new Error('null ErrorEvent<window>.error')
  )

  let stack = valid(
    String(error.stack),
    new Error('undefined ErrorEvent<window>.error.stack')
  )

  stack = stack.replaceAll(window.BLOB_URL, 'bundle')

  print(stack)
})

// TODO: Find a good place for this
export function print (text: string, height: number = 16): void {
  context.font = `${height}px monospace`
  context.textBaseline = 'top'

  const width = height / 2

  let y = 0

  for (const line of text.split('\n')) {
    let x = 0

    for (const character of line) {
      context.fillStyle = 'black'
      context.fillRect(
        x, y,
        height, height
      )

      context.fillStyle = 'white'
      context.fillText(
        character,
        x, y
      )

      x += width
    }

    y += height
  }
}
