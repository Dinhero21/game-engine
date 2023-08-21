import type Scene from '../engine/scene'
import type Entity from '../engine/entity'
import { scene } from './bootstrap'

const idMap = new Map<any, string>()

function getId (object: any): string {
  const id = idMap.get(object) ?? Math.floor(Math.random() * 0xffff).toString(16)
  idMap.set(object, id)

  return id
}

function tree (entity: Entity | Scene): string {
  const output: string[] = []

  const from = getId(entity)

  output.push(`${JSON.stringify(from)} [label=${JSON.stringify(entity.constructor.name)}]`)

  for (const children of entity.children) {
    const to = getId(children)

    output.push(`${JSON.stringify(to)} [label=${JSON.stringify(children.constructor.name)}]`)

    output.push(`${JSON.stringify(from)} -> ${JSON.stringify(to)}`)

    output.push(tree(children))
  }

  return output.join('\n')
}

function generateDotTree (): string {
  return 'digraph {\n' + tree(scene) + '\n}'
}

declare global {
  interface Window {
    generateDotTree: typeof generateDotTree
  }
}

window.generateDotTree = generateDotTree
