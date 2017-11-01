import { Action, LEAVE_ROOM, REMOVE_SOCKET } from 'jiber-core'
import { onClose } from './on-close'

////////////////////////////////////////////////////////////////////////////////
// mocks
////////////////////////////////////////////////////////////////////////////////
let calls: any[] = []
const store: any = {
  dispatch: (action: Action) => calls.push(['dispatch', action]),
  getState: () => {
    return {
      sockets: {
        socket1: {
          ws: {
            removeAllListeners: () => calls.push(['removeAllListeners'])
          },
          userId: 'user1'
        }
      },
      rooms: {
        room1: { members: {} },
        room2: { members: { 'user1': {}, 'user2': {} } },
        room3: { members: { 'user1': {} } }
      }
    } as any
  },
  db: {
    pushAction: (action: Action) => {
      calls.push(['pushAction', action])
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// setup
////////////////////////////////////////////////////////////////////////////////
beforeEach(() => calls = [])

////////////////////////////////////////////////////////////////////////////////
// tests
////////////////////////////////////////////////////////////////////////////////
test('do nothing if socket does not exist', () => {
  onClose(store, 'socket99')
  expect(calls).toEqual([])
})

test('remove event handlers', () => {
  onClose(store, 'socket1')
  expect(calls[0]).toEqual(['removeAllListeners'])
})

test('remove user from member rooms', () => {
  onClose(store, 'socket1')
  const dispatchCalls = calls.filter(call => call[0] === 'pushAction')
  expect(dispatchCalls).toEqual([
    [
      'pushAction',
      { type: LEAVE_ROOM, $r: 'room2', $u: 'user1', $id: 999999999 }
    ],
    [
      'pushAction',
      { type: LEAVE_ROOM, $r: 'room3', $u: 'user1', $id: 999999999 }
    ]
  ])
})

test('remove the socket from the store', () => {
  onClose(store, 'socket1')
  const dispatchCalls = calls.filter(call => call[0] === 'dispatch')
  expect(dispatchCalls).toEqual([
    ['dispatch', { type: REMOVE_SOCKET, socketId: 'socket1' }]
  ])
})
