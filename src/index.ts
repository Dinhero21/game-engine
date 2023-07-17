import type { IServerServer as IServer } from './socket.io'
import { PluginManager } from './plugins/manager'
import url from 'url'
import path from 'path'
import http from 'http'
import { Server } from 'socket.io'
import express from 'express'

// eslint-disable-next-line @typescript-eslint/naming-convention
const __filename = url.fileURLToPath(import.meta.url)

// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT ?? 8080

const app = express()

app.use(express.static(path.join(__dirname, 'public')))

const server = http.createServer(app)

const io: IServer = new Server(server)

const manager = new PluginManager(io)

io.on('connection', socket => {
  manager.emit('onConnection', socket)
})

server.listen(PORT, () => {
  console.info(`Server listening on port ${PORT}`)
})
