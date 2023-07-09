import type Entity from './engine/entities/index.js'
import type Scene from './engine/scene.js'
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

const scene = createScene(context)

// function getAllValues (object: Record<string, any>, memo = new Set<any>()): Set<any> {
//   if (memo.has(object)) return memo

//   if (typeof object === 'function') return memo

//   if (object instanceof Set) object = Array.from(object.values())

//   memo.add(object)

//   if (object instanceof Object) {
//     for (const value of Object.values(object)) {
//       getAllValues(value, memo)
//     }
//   }

//   return memo
// }

// function generateNodeConnections (object: Record<string, any>): Set<[any, any]> {
//   const connections = new Set<[any, any]>()

//   for (const value of getAllValues(object)) {
//     if (value instanceof Object) {
//       for (const subvalue of Object.values(value)) {
//         connections.add([value, subvalue])
//       }
//     }
//   }

//   return connections
// }

// function generateGraph (object: Record<string, any>): string {
//   const values = getAllValues(object)
//   const connections = generateNodeConnections(object)

//   const nodeMap = new Map<any, string>()

//   for (const value of values) nodeMap.set(value, Array.from({ length: 8 }, () => Math.floor(Math.random() * 0xffff).toString(16)).join(''))

//   const nodeInitializationString = Array.from(nodeMap.entries())
//     .map(([entry, id]) => {
//       const string = String(entry)

//       const label = string.startsWith('[') && string.endsWith(']') ? entry.constructor.name : string

//       return `${JSON.stringify(String(id))} [label=${JSON.stringify(label)}]`
//     })
//     .join('\n')

//   const connectionsString = Array.from(connections)
//     .map(([from, to]) => `${JSON.stringify(String(nodeMap.get(from)))} -> ${JSON.stringify(String(nodeMap.get(to)))}`)
//     .join('\n')

//   const data = `${nodeInitializationString}\n${connectionsString}`

//   return `digraph G {\n${data}\n}`
// }

const idMap = new Map<any, string>()

function getIdFor (object: any): string {
  const id = idMap.get(object) ?? Math.floor(Math.random() * 0xffff).toString(16)
  idMap.set(object, id)

  return id
}

function tree (entity: Entity | Scene): string {
  const output: string[] = []

  const from = getIdFor(entity)

  output.push(`${JSON.stringify(from)} [label=${JSON.stringify(entity.constructor.name)}]`)

  for (const children of entity.children) {
    const to = getIdFor(children)

    output.push(`${JSON.stringify(to)} [label=${JSON.stringify(children.constructor.name)}]`)

    output.push(`${JSON.stringify(from)} -> ${JSON.stringify(to)}`)

    output.push(tree(children))
  }

  return output.join('\n')
}

function generateGraphvizTree (): void {
  console.log(tree(scene))
}

(window as any).generateGraphvizTree = generateGraphvizTree

updateViewSize()

window.addEventListener('resize', updateViewSize)

function updateViewSize (): void {
  if (view === null) throw new Error('updateViewSize called with view being null')
  if (!(view instanceof HTMLCanvasElement)) throw new Error('updateViewSize called with view not being a canvas element')

  view.width = window.innerWidth
  view.height = window.innerHeight
}
