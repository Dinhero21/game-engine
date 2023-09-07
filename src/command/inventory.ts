import { registerCommand } from '.'

registerCommand('give', helper => {
  let [type, count] = helper.args

  if (typeof type !== 'string') throw new TypeError('type must be a string')

  count ??= 1

  if (typeof count !== 'number') throw new TypeError('count must be a number (or undefined)')

  helper.sender.inventory.addItem(type, count)
})
