import express from 'express'
import path from 'path'
import url from 'url'

// eslint-disable-next-line @typescript-eslint/naming-convention
const __filename = url.fileURLToPath(import.meta.url)

// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = path.dirname(__filename)

const app = express()

app.use('/', express.static(path.join(__dirname, 'public')))

app.listen(80, () => {
  console.info('Server listening on port 80')
})
