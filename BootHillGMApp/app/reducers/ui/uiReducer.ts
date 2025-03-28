import { UIState, initialUIState } from '../../types/state/uiState';
import { GameAction } from '../../types/actions';

/**
 * UI slice reducer
 * Handles all UI-related state updates
 */
export function uiReducer(
  state: UIState = initialUIState, 
  action: GameAction
): UIState {
  switch (action.type) {
    case 'ui/SET_LOADING': {
      return {
        ...state,
        isLoading: action.payload
      };
    }
    
    case 'ui/OPEN_MODAL': {
      return {
        ...state,
        modalOpen: action.payload
      };
    }
    
    case 'ui/CLOSE_MODAL': {
      return {
        ...state,
        modalOpen: null
      };
    }
    
    case 'ui/ADD_NOTIFICATION': {
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    }
    
    case 'ui/REMOVE_NOTIFICATION': {
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        )
      };
    }
    
    case 'ui/CLEAR_NOTIFICATIONS': {
      return {
        ...state,
        notifications: []
      };
    }
    
    // Handle SET_STATE for state restoration
    case 'SET_STATE': {
      if (!action.payload.ui) {
        return state;
      }
      
      return {
        ...state,
        ...action.payload.ui
      };
    }
    
    default:
      return state;
  }
}
