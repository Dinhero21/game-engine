import type Plugin from './base'
import PlayerPlugin from './player'
import WorldPlugin from './world'
import InventoryPlugin from './inventory'
import ChatPlugin from './chat'
import { type IServerServer as IServer } from '../socket.io'
import { type FunctionKeys } from '../public/engine/util/types'

export class PluginManager {
  public readonly io

  public readonly plugins

  constructor (io: IServer) {
    this.io = io

    this.plugins = {
      player: new PlayerPlugin(this),
      world: new WorldPlugin(this),
      inventory: new InventoryPlugin(this),
      chat: new ChatPlugin(this)
    }
  }

  public emit<K extends FunctionKeys<Plugin>> (name: K, ...args: Parameters<Plugin[K]>): void {
    const pluginMap = this.plugins
    const plugins: Plugin[] = Object.values(pluginMap)

    for (const plugin of plugins) plugin[name].apply(plugin, args)
  }
}
