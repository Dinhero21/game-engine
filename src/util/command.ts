import { type IPlayer } from '../world/entity'
import json5 from 'json5'

export function * parseArgs (data: string): Generator<any, void, unknown> {
  let buffer = ''

  while (data.length > 0) {
    try {
      yield json5.parse(data)

      data = buffer
      buffer = ''
    } catch (e) {
      const lastCharacter = data[data.length - 1]
      data = data.slice(0, -1)
      buffer = `${lastCharacter}${buffer}`
    }
  }
}

export class CommandHelper {
  public readonly args
  public readonly sender

  constructor (args: unknown[], sender: IPlayer) {
    this.args = args
    this.sender = sender
  }
}

export default CommandHelper
