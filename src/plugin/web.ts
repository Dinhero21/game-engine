import type { IServerServer as IServer } from '../socket.io'
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

export const app = express()

app.use(express.static(path.join(__dirname, '../public')))

export const server = http.createServer(app)

export const io: IServer = new Server(server)

server.listen(PORT)
