import type { Player, ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData, Vec2 as RawVec2 } from './socket.io'
import http from 'http'
import path from 'path'
import url from 'url'
import express from 'express'
import { Server } from 'socket.io'

// eslint-disable-next-line @typescript-eslint/naming-convention
const __filename = url.fileURLToPath(import.meta.url)

// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = path.dirname(__filename)

const app = express()

app.use('/', express.static(path.join(__dirname, 'public')))

const server = http.createServer(app)

const io = new Server<
ClientToServerEvents,
ServerToClientEvents,
InterServerEvents,
SocketData
>(server)

const players = new Set<Player>()

io.on('connection', socket => {
  const player: Player = {
    id: socket.id,
    position: [0, 0],
    velocity: [0, 0]
  }

  io.emit('player.add', player)

  for (const player of players) socket.emit('player.add', player)

  players.add(player)

  socket.on('physics.update', (position: RawVec2, velocity: RawVec2) => {
    player.position = position
    player.velocity = velocity

    socket.broadcast.emit('player.physics.update', player)
  })

  socket.on('disconnect', () => {
    players.delete(player)

    io.emit('player.remove', player)
  })
})

server.listen(80, () => {
  console.info('Server listening on port 80')
})
