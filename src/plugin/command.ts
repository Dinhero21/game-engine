import type Player from '../player'
import chat from './chat'
import CommandHelper, { parseArgs } from '../util/command'
import { COMMAND_MAP, PREFIX } from '../command'
import { fileURLToPath } from 'url'
import path, { dirname, join } from 'path'
import fs from 'fs/promises'

chat.register('message', async (message, sender, cancel) => {
  if (!message.startsWith(PREFIX)) return

  cancel()

  message = message.substring(PREFIX.length)

  let args = message.split(' ')

  const command = args.shift() ?? ''

  args = Array.from(parseArgs(args.join(' ')))

  await onCommand(command, args, sender)
})

async function onCommand (name: string, args: unknown[], sender: Player): Promise<void> {
  const command = COMMAND_MAP.get(name)

  if (command === undefined) {
    chat.writeMessage('Invalid Command!')

    return
  }

  const helper = new CommandHelper(args, sender)

  try {
    await command(helper)
  } catch (error) {
    const string = String(error)

    for (const line of string.split('\n')) chat.writeMessage(line)
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const __filename = fileURLToPath(import.meta.url)
// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = dirname(__filename)

const COMMAND_DIR_PATH = join(__dirname, '..', 'command')

const promises = []

for (const file of await fs.readdir(COMMAND_DIR_PATH)) {
  if (path.extname(file) !== '.js') continue

  promises.push(import(join(COMMAND_DIR_PATH, file)))
}

console.time('Loading Commands')

await Promise.all(promises)

console.timeEnd('Loading Commands')
