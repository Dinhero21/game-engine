import fs from 'fs/promises'
import path, { dirname, join } from 'path'
import { fileURLToPath } from 'url'

// eslint-disable-next-line @typescript-eslint/naming-convention
const __filename = fileURLToPath(import.meta.url)
// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = dirname(__filename)

const NODE_ENV = process.env.NODE_ENV

console.info('Environment:', NODE_ENV)

const PLUGIN_DIR_PATH = join(__dirname, 'plugin')

const promises = []

for (const file of await fs.readdir(PLUGIN_DIR_PATH)) {
  if (path.extname(file) !== '.js') continue

  promises.push(import(join(PLUGIN_DIR_PATH, file)))
}

console.time('Loading Plugins')

await Promise.all(promises)

console.timeEnd('Loading Plugins')
