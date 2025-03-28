import { Notification } from '../state/uiState';

/**
 * UI action types
 */
export type UIActionType =
  | 'ui/SET_LOADING'
  | 'ui/OPEN_MODAL'
  | 'ui/CLOSE_MODAL'
  | 'ui/ADD_NOTIFICATION'
  | 'ui/REMOVE_NOTIFICATION'
  | 'ui/CLEAR_NOTIFICATIONS';

/**
 * UI action interfaces
 */
export interface SetLoadingAction {
  type: 'ui/SET_LOADING';
  payload: boolean;
}

export interface OpenModalAction {
  type: 'ui/OPEN_MODAL';
  payload: string; // Modal ID
}

export interface CloseModalAction {
  type: 'ui/CLOSE_MODAL';
}

export interface AddNotificationAction {
  type: 'ui/ADD_NOTIFICATION';
  payload: Notification;
}

export interface RemoveNotificationAction {
  type: 'ui/REMOVE_NOTIFICATION';
  payload: string; // Notification ID
}

export interface ClearNotificationsAction {
  type: 'ui/CLEAR_NOTIFICATIONS';
}

/**
 * Combined UI actions type
 */
export type UIAction =
  | SetLoadingAction
  | OpenModalAction
  | CloseModalAction
  | AddNotificationAction
  | RemoveNotificationAction
  | ClearNotificationsAction;
