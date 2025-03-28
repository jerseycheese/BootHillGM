/**
 * UI State Selector Hooks
 * 
 * This module provides selector hooks for accessing UI state data.
 */

import { UIState, Notification } from '../types/state/uiState';
import { createSelectorHook, createSlicePropertySelector } from './createSelectorHook';

/**
 * Hook that returns the entire UI state slice
 */
export const useUIState = createSelectorHook<UIState>(
  (state) => state.ui
);

/**
 * Hook that returns whether the UI is in a loading state
 */
export const useIsLoading = createSlicePropertySelector<UIState, boolean>(
  'ui',
  (uiState) => uiState.isLoading
);

/**
 * Hook that returns the currently open modal ID or null if no modal is open
 */
export const useModalOpen = createSlicePropertySelector<UIState, string | null>(
  'ui',
  (uiState) => uiState.modalOpen
);

/**
 * Hook that returns all active notifications
 */
export const useNotifications = createSlicePropertySelector<UIState, Notification[]>(
  'ui',
  (uiState) => uiState.notifications
);

/**
 * Hook that checks if a specific modal is open
 * @param modalId The ID of the modal to check
 */
export function useIsModalOpen(modalId: string) {
  return createSelectorHook<boolean>(
    (state) => state.ui.modalOpen === modalId
  );
}

/**
 * Hook that returns notifications of a specific type
 * @param type The notification type to filter by
 */
export function useNotificationsByType(type: Notification['type']) {
  return createSelectorHook<Notification[]>(
    (state) => state.ui.notifications.filter(notification => notification.type === type)
  );
}

/**
 * Hook that returns the count of active notifications
 */
export const useNotificationCount = createSelectorHook<number>(
  (state) => state.ui.notifications.length
);

/**
 * Hook that checks if there are any notifications of a specific type
 * @param type The notification type to check for
 */
export function useHasNotificationType(type: Notification['type']) {
  return createSelectorHook<boolean>(
    (state) => state.ui.notifications.some(notification => notification.type === type)
  );
}
