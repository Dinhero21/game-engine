import type { IClientSocket as Socket } from '../../socket.io'
import io from 'socket.io-client'

export const socket: Socket = io()

socket.on('disconnect', reason => {
  document.write(`Disconnected: ${reason}`)

  location.reload()
})
socket.on('connect_error', error => {
  document.write(`Connect Error: ${error.message}`)

  location.reload()
})

export default socket
