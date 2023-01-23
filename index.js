import path from 'path'
import url from 'url'
import http from 'http'
import express from 'express'
import { Server } from 'socket.io'

const PORT = process.env.PORT ?? 80

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const server = http.createServer(app)
const io = new Server(server)

io.on('connection', socket => {
  console.info('A Socket has connected')

  socket.on('disconnect', () => {
    console.info('A Socket has disconnect')
  })
})

app.use(express.static(path.join(__dirname, 'public')))

server.listen(PORT, () => {
  console.info(`Server listening on port ${PORT}`)
})
