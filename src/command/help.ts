import { COMMAND_MAP, PREFIX, registerCommand } from '.'
import chat from '../plugin/chat'

registerCommand('help', helper => {
  const commands = Array.from(COMMAND_MAP.keys())

  chat.writeMessage(`Prefix: ${PREFIX}`)
  chat.writeMessage(`Commands: ${commands.join(', ')}`)
})
