import scene from '../main'
import UserInterfaceEntity from '../../../../entity/user-interface'
import socket from '../../../../socket.io'

export const ui = new UserInterfaceEntity(socket)
scene.addChild(ui)

export default ui
