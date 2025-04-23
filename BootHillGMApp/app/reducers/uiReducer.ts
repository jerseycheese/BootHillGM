/**
 * UI Reducer
 * 
 * Manages UI state using the slice pattern
 */

import { GameAction } from '../types/actions';
import { UIState, initialUIState, Notification } from '../types/state/uiState';
import { ActionTypes } from '../types/actionTypes';

/**
 * Define UI action types for backward compatibility
 */
const UI_ACTION_TYPES = {
  SET_LOADING: ['ui/SET_LOADING', 'SET_LOADING'],
  OPEN_MODAL: ['ui/OPEN_MODAL', 'OPEN_MODAL'],
  CLOSE_MODAL: ['ui/CLOSE_MODAL', 'CLOSE_MODAL'],
  ADD_NOTIFICATION: [ActionTypes.ADD_NOTIFICATION, 'ui/ADD_NOTIFICATION', 'ADD_NOTIFICATION'],
  REMOVE_NOTIFICATION: [ActionTypes.REMOVE_NOTIFICATION, 'ui/REMOVE_NOTIFICATION', 'REMOVE_NOTIFICATION'],
  CLEAR_NOTIFICATIONS: ['ui/CLEAR_NOTIFICATIONS', 'CLEAR_NOTIFICATIONS'],
  SET_ACTIVE_TAB: [ActionTypes.SET_ACTIVE_TAB, 'ui/SET_ACTIVE_TAB', 'SET_ACTIVE_TAB']
};

/**
 * Helper function to check if action matches any of the possible types
 */
const isUIAction = (action: GameAction, actionTypes: string[]): boolean => {
  return actionTypes.includes(action.type);
};

/**
 * UI reducer
 */
const uiReducer = (state: UIState = initialUIState, action: GameAction): UIState => {
  if (!action) return state;
  
  // SET_LOADING
  if (isUIAction(action, UI_ACTION_TYPES.SET_LOADING) && 'payload' in action) {
    return {
      ...state,
      isLoading: action.payload as boolean
    };
  }
  
  // OPEN_MODAL
  if (isUIAction(action, UI_ACTION_TYPES.OPEN_MODAL) && 'payload' in action) {
    return {
      ...state,
      modalOpen: action.payload as string
    };
  }
  
  // CLOSE_MODAL
  if (isUIAction(action, UI_ACTION_TYPES.CLOSE_MODAL)) {
    return {
      ...state,
      modalOpen: null
    };
  }
  
  // ADD_NOTIFICATION
  if (isUIAction(action, UI_ACTION_TYPES.ADD_NOTIFICATION) && 'payload' in action) {
    const notification = action.payload as Notification;
    return {
      ...state,
      notifications: [...state.notifications, notification]
    };
  }
  
  // REMOVE_NOTIFICATION
  if (isUIAction(action, UI_ACTION_TYPES.REMOVE_NOTIFICATION) && 'payload' in action) {
    const notificationId = action.payload as string;
    return {
      ...state,
      notifications: state.notifications.filter(
        notification => notification.id !== notificationId
      )
    };
  }
  
  // CLEAR_NOTIFICATIONS
  if (isUIAction(action, UI_ACTION_TYPES.CLEAR_NOTIFICATIONS)) {
    return {
      ...state,
      notifications: []
    };
  }

  // SET_ACTIVE_TAB
  if (isUIAction(action, UI_ACTION_TYPES.SET_ACTIVE_TAB) && 'payload' in action) {
    return {
      ...state,
      activeTab: action.payload as string
    };
  }
  
  return state;
};

export default uiReducer;