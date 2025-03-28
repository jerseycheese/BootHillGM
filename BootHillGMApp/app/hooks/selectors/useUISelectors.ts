/**
 * UI-related state selector hooks
 * 
 * Contains selectors for accessing UI state in a memoized way.
 */
import { Notification, UIState } from '../../types/state/uiState';
import { createStateHook } from '../createStateHook';
import { useGame } from '../useGame';
import { useMemo } from 'react';

/**
 * Returns whether the UI is in a loading state
 */
export const useIsLoading = createStateHook<boolean, [boolean | undefined]>(
  (state) => state.ui?.isLoading ?? false,
  (state) => [state.ui?.isLoading]
);

/**
 * Returns the currently active modal (if any)
 */
export const useActiveModal = createStateHook<string | null, [string | null | undefined]>(
  (state) => state.ui?.modalOpen ?? null,
  (state) => [state.ui?.modalOpen]
);

/**
 * Returns whether a specific modal is open
 * 
 * @param modalId The ID of the modal to check
 */
export const useIsModalOpen = (modalId: string) => {
  const { state } = useGame();
  return useMemo(() => state.ui?.modalOpen === modalId, [state.ui?.modalOpen, modalId]);
};

/**
 * Returns all active notifications
 */
export const useNotifications = createStateHook<Notification[], [Notification[] | undefined]>(
  (state) => state.ui?.notifications ?? [],
  (state) => [state.ui?.notifications]
);

/**
 * Returns notifications of a specific type
 * 
 * @param type The notification type to filter by
 */
export const useNotificationsByType = (type: string) => {
  const { state } = useGame();
  return useMemo(
    () => (state.ui?.notifications ?? []).filter(notification => notification.type === type),
    [state.ui?.notifications, type]
  );
};

/**
 * Returns the most recent notification
 */
export const useLatestNotification = createStateHook<Notification | undefined, [Notification[] | undefined]>(
  (state) => {
    const notifications = state.ui?.notifications ?? [];
    return notifications.length > 0 ? notifications[notifications.length - 1] : undefined;
  },
  (state) => [state.ui?.notifications]
);

/**
 * Returns whether there are any notifications
 */
export const useHasNotifications = createStateHook<boolean, [Notification[] | undefined]>(
  (state) => (state.ui?.notifications?.length ?? 0) > 0,
  (state) => [state.ui?.notifications]
);

/**
 * Returns whether there are any notifications of a specific type
 * 
 * @param type The notification type to check for
 */
export const useHasNotificationsByType = (type: string) => {
  const { state } = useGame();
  return useMemo(
    () => (state.ui?.notifications ?? []).some(notification => notification.type === type),
    [state.ui?.notifications, type]
  );
};

/**
 * Returns whether the application is running in client mode
 */
export const useIsClient = createStateHook<boolean, [boolean | undefined]>(
  (state) => state.isClient ?? false,
  (state) => [state.isClient]
);

/**
 * Returns the full UI state
 */
export const useUIState = createStateHook<UIState, [UIState | undefined]>(
  (state) => state.ui ?? { isLoading: false, modalOpen: null, notifications: [] },
  (state) => [state.ui]
);
