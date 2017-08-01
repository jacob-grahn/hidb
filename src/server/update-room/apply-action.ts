import {
  Action,
  RoomState,
  INJECT_PRIVATE,
  CLEAN_PRIVATE,
  CONFIRM_ACTION,
  PATCH,
  diff
} from '../../core/index'

export default function (
  dispatch: (action: Action) => void,
  getRoom: (roomId: string) => RoomState,
  sendToRoom: (roomId: string, action: Action) => void
) {
  return function applyAction (action: Action): void {
    if (!action.$roomId) return
    const roomState = getRoom(action.$roomId)
    action = addMetadata(roomState, action)

    if (action.type.indexOf('$serverOnly/') === 0) {
      privateApply(action)
    } else if (action.type.indexOf('hope/') === 0) {
      rawApply(action)
    } else {
      quickApply(action)
    }
  }

  function rawApply(action: Action): void {
    if (!action.$roomId) return
    dispatch(action)
    sendToRoom(action.$roomId, action)
  }

  function quickApply (action: Action): void {
    if (!action.$roomId) return
    const $roomId = action.$roomId
    const $timeMs = action.$timeMs
    dispatch({type: CONFIRM_ACTION, action, $roomId, $timeMs})
    sendToRoom(action.$roomId, action)
  }

  function privateApply (action: Action): void {
    if (!action.$roomId) return
    const $roomId = action.$roomId
    const $timeMs = action.$timeMs
    const beforeState = getRoom($roomId)

    dispatch({type: INJECT_PRIVATE, $roomId})
    dispatch({type: CONFIRM_ACTION, action, $roomId, $timeMs})
    dispatch({type: CLEAN_PRIVATE, $roomId})

    const afterState = getRoom($roomId)
    const confirmedChanges = diff(beforeState.confirmed, afterState.confirmed)
    const memberChanges = diff(beforeState.members, afterState.members)

    const patchAction = {
      type: PATCH,
      confirmed: confirmedChanges,
      members: memberChanges,
      $roomId,
      $timeMs
    }
    sendToRoom($roomId, patchAction)
  }
}

function addMetadata (roomState: RoomState, action: Action): Action {
  if (!action.$userId) return action
  const member = roomState.members[action.$userId] || {}
  const lastActionId = member.actionId || 0
  action.$actionId = lastActionId + 1
  return action
}
