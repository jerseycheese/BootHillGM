import { Notification } from '../state/uiState';
import { ActionTypes } from '../actionTypes';

/**
 * UI action interfaces using ActionTypes
 */
export interface SetLoadingAction {
  type: typeof ActionTypes.SET_LOADING;
  payload: boolean;
}

export interface OpenModalAction {
  type: typeof ActionTypes.OPEN_MODAL;
  payload: string; // Modal ID
}

export interface CloseModalAction {
  type: typeof ActionTypes.CLOSE_MODAL;
}

export interface AddNotificationAction {
  type: typeof ActionTypes.ADD_NOTIFICATION;
  payload: Notification;
}

export interface RemoveNotificationAction {
  type: typeof ActionTypes.REMOVE_NOTIFICATION;
  payload: string; // Notification ID
}

export interface ClearNotificationsAction {
  type: typeof ActionTypes.CLEAR_NOTIFICATIONS;
}

export interface SetActiveTabAction {
  type: typeof ActionTypes.SET_ACTIVE_TAB;
  payload: string;
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
  | ClearNotificationsAction
  | SetActiveTabAction;
