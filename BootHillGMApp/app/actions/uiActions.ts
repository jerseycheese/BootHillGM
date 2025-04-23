/**
 * UI Action Creators
 * 
 * This file contains action creators for the UI reducer.
 */

import { Notification } from '../types/state/uiState';
import { ActionTypes } from '../types/actionTypes';

/**
 * Action creator for setting the loading state
 * @param isLoading - Whether the UI is in a loading state
 * @returns UI action object
 */
export const setLoading = (isLoading: boolean) => ({
  type: ActionTypes.SET_LOADING,
  payload: isLoading
});

/**
 * Action creator for opening a modal
 * @param modalId - ID of the modal to open
 * @returns UI action object
 */
export const openModal = (modalId: string) => ({
  type: ActionTypes.OPEN_MODAL,
  payload: modalId
});

/**
 * Action creator for closing the currently open modal
 * @returns UI action object
 */
export const closeModal = () => ({
  type: ActionTypes.CLOSE_MODAL
});

/**
 * Action creator for adding a notification
 * @param notification - Notification to add
 * @returns UI action object
 */
export const addNotification = (notification: Notification) => ({
  type: ActionTypes.ADD_NOTIFICATION,
  payload: notification
});

/**
 * Action creator for removing a notification by ID
 * @param id - ID of the notification to remove
 * @returns UI action object
 */
export const removeNotification = (id: string) => ({
  type: ActionTypes.REMOVE_NOTIFICATION,
  payload: id
});

/**
 * Action creator for clearing all notifications
 * @returns UI action object
 */
export const clearNotifications = () => ({
  type: ActionTypes.CLEAR_NOTIFICATIONS
});

/**
 * Action creator for setting the active tab
 * @param tabId - ID of the tab to set as active
 * @returns UI action object
 */
export const setActiveTab = (tabId: string) => ({
  type: ActionTypes.SET_ACTIVE_TAB,
  payload: tabId
});
