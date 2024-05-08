import globals from '../../../../globals'
import { valid } from '../../../../none'
import { GUI } from 'dat.gui'
import _ from 'lodash'
import Stats from 'stats.js'

const statContainer = valid(
  document.getElementById('stat-container'),
  new Error('null #stat-container')
)

export function createStat (name: string): Stats {
  const stat = new Stats()
  const dom = stat.dom

  dom.style.cssText = 'position:relative;'

  const text = document.createElement('p')
  text.innerText = name
  text.style.cssText = 'position:absolute;color:white'

  dom.prepend(text)

  statContainer.appendChild(dom)

  return stat
}

export function populateGUI<Parent extends Record<any, any> = Record<any, any>> (gui: GUI, parent: Parent, key?: keyof Parent): void {
  for (const [parentKey, value] of Object.entries(parent)) {
    if (typeof value === 'object') {
      const folder = gui.addFolder(title(parentKey))

      populateGUI(folder, value, parentKey)

      continue
    }

    gui.add(parent, parentKey)
      .name(title(parentKey))
  }

  function title (camel: string): string {
    return camel
      .toLowerCase()
      .replace('_', ' ')
      .replace(/\b\w/g, _.upperCase)
  }
}

export const DebugGUI = new GUI({ name: 'Debug' })
populateGUI(DebugGUI, globals)
document.body.appendChild(DebugGUI.domElement)
