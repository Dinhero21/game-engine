import { getPlayer } from './player'
import { io } from './server'

io.on('connection', socket => {
  const player = getPlayer(socket.id)

  if (player === undefined) return

  socket.on('slot.click', id => {
    const inventory = player.inventory

    const cursorSlot = inventory.getSlot(-1)

    const cursorType = cursorSlot?.getType() ?? null
    const cursorAmount = cursorSlot?.getAmount() ?? 0

    const slot = inventory.getSlot(id)

    const slotType = slot?.getType() ?? null
    const slotAmount = slot?.getAmount() ?? 0

    if (slotType === cursorType) {
      slot?.setAmount(slotAmount + cursorAmount)
      cursorSlot?.setAmount(0)
    }

    cursorSlot?.setType(slotType)
    cursorSlot?.setAmount(slotAmount)

    slot?.setType(cursorType)
    slot?.setAmount(cursorAmount)
  })

  player.on('inventory.update', (id, stack) => {
    socket.emit('slot.set', id, stack.type, stack.amount)
  })

  socket.on('recipe.crafted', recipe => {
    const inventory = player.inventory
    const inputs = recipe.inputs

    for (const input of inputs) {
      inventory.removeItem(input.type, input.amount)
    }

    const output = recipe.output

    inventory.addItem(output.type, output.amount)
  })
})
