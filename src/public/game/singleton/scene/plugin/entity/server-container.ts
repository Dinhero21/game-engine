import world from './world'
import scene from '../main'
import ServerEntityContainerEntity from '../../../../entity/server-entity/container'

export const serverEntityContainer = new ServerEntityContainerEntity()
scene.addChild(serverEntityContainer)

// TODO: Find a better way of inter-entity data transfer
serverEntityContainer.setWorld(world)

export default serverEntityContainer
