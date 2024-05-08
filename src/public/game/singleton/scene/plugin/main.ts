import { VIEWPORT_GENERATOR } from '../../../../engine/camera'
import Scene from '../../../../engine/scene'
import { context } from '../../canvas'

export const scene = new Scene(context)
export default scene

export const camera = scene.camera
camera.ViewportGenerator = VIEWPORT_GENERATOR.Center
