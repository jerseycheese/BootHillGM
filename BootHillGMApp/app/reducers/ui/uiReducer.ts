import { UIState, initialUIState, Notification } from '../../types/state/uiState';
import { GameState } from '../../types/gameState';
import { GameAction } from '../../types/actions';
import { ActionTypes } from '../../types/actionTypes';

/**
 * UI slice reducer
 * Handles all UI-related state updates
 */
export function uiReducer(
  state: UIState = initialUIState,
  action: GameAction
): UIState {
  switch (action.type) {

    case ActionTypes.SET_LOADING: {
      const isLoading = action.payload as boolean;
      return {
        ...state,
        isLoading
      };
    }

    case ActionTypes.SET_ACTIVE_TAB: {
      const activeTab = action.payload as string;
      return {
        ...state,
        activeTab
      };
    }

    case ActionTypes.OPEN_MODAL: {
      const modalOpen = action.payload as string;
      return {
        ...state,
        modalOpen
      };
    }

    case ActionTypes.CLOSE_MODAL: {
      return {
        ...state,
        modalOpen: null
      };
    }

    case ActionTypes.ADD_NOTIFICATION: {
      const notification = action.payload as Notification;
      return {
        ...state,
        notifications: [...state.notifications, notification]
      };
    }

    case ActionTypes.REMOVE_NOTIFICATION: {
      const id = action.payload as string;
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== id)
      };
    }

    case ActionTypes.CLEAR_NOTIFICATIONS: {
      return {
        ...state,
        notifications: []
      };
    }

    // Handle SET_STATE for state restoration
    case ActionTypes.SET_STATE: {
      // Assert payload type (assuming it's GameState)
      const payload = action.payload as GameState;
      if (!payload || !payload.ui) {
        return state; // Return current state if payload or ui slice is missing
      }
      // Return the ui slice from the payload, merged with existing state (optional)
      // If full replacement is intended, just return payload.ui
      return {
        ...state, // Keep existing state properties not in payload.ui
        ...payload.ui // Overwrite with properties from payload.ui
      };
    }

    default:
      return state;
  }
}
