import { type PluginManager } from './manager'
import { type IServerSocket as ISocket } from '../socket.io'

export class Plugin {
  protected readonly manager: PluginManager

  constructor (manager: PluginManager) {
    this.manager = manager
  }

  public onConnection (socket: ISocket): void {}
}

export default Plugin
