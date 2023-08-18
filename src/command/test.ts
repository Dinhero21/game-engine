import { registerCommand } from '.'
import chat from '../plugin/chat'

registerCommand('test', helper => {
  chat.writeMessage('Test Command!')
  chat.writeMessage('Check console for args')

  const args = helper.args

  console.log('Args:', args)
})
