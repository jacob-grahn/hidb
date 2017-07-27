import { Action, Store } from '../../core/index'

// const OPEN = 1

export default function createSendToSocket (store: Store) {
  return function sendToSocket (socketId: string, action: Action): void {
    const socket = store.getState().sockets[socketId]
    if (!socket || !socket.connection) return
    const connection = socket.connection
    if (connection.readyState === connection.OPEN) {
      connection.send(JSON.stringify(action))
    }
  }
}
