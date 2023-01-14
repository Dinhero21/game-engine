import BaseEntity from './base.js'

export default class ContainerEntity extends BaseEntity {
  entities = []

  draw (context) {
    context.fillStyle = '#98C37920'
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)

    context.strokeStyle = '#98C379'
    context.lineWidth = 10
    context.strokeRect(0, 0, context.canvas.width, context.canvas.height)

    super.draw(context)
  }
}