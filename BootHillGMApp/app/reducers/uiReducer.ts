/**
 * UI Reducer
 * 
 * Manages UI state using the slice pattern
 */

import { GameAction } from '../types/actions';
import { UIState, initialUIState, Notification } from '../types/state/uiState';

/**
 * Safe helper to check if an action is of a specific type
 */
function isActionType(action: GameAction, type: string | string[]): boolean {
  if (Array.isArray(type)) {
    return type.includes(action.type);
  }
  return action.type === type;
}

/**
 * UI reducer
 */
const uiReducer = (state: UIState = initialUIState, action: GameAction): UIState => {
  if (!action) return state;
  
  // SET_LOADING
  if (isActionType(action, 'ui/SET_LOADING') && 'payload' in action) {
    return {
      ...state,
      isLoading: action.payload as boolean
    };
  }
  
  // OPEN_MODAL
  if (isActionType(action, 'ui/OPEN_MODAL') && 'payload' in action) {
    return {
      ...state,
      modalOpen: action.payload as string
    };
  }
  
  // CLOSE_MODAL
  if (isActionType(action, 'ui/CLOSE_MODAL')) {
    return {
      ...state,
      modalOpen: null
    };
  }
  
  // ADD_NOTIFICATION
  if (isActionType(action, 'ui/ADD_NOTIFICATION') && 'payload' in action) {
    const notification = action.payload as Notification;
    return {
      ...state,
      notifications: [...state.notifications, notification]
    };
  }
  
  // REMOVE_NOTIFICATION
  if (isActionType(action, 'ui/REMOVE_NOTIFICATION') && 'payload' in action) {
    const notificationId = action.payload as string;
    return {
      ...state,
      notifications: state.notifications.filter(
        notification => notification.id !== notificationId
      )
    };
  }
  
  // CLEAR_NOTIFICATIONS
  if (isActionType(action, 'ui/CLEAR_NOTIFICATIONS')) {
    return {
      ...state,
      notifications: []
    };
  }

  // SET_ACTIVE_TAB (handle both namespaced and non-namespaced versions)
  if (isActionType(action, ['ui/SET_ACTIVE_TAB', 'SET_ACTIVE_TAB']) && 'payload' in action) {
    return {
      ...state,
      activeTab: action.payload as string
    };
  }
  
  return state;
};

export default uiReducer;