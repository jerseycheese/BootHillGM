/**
 * Notification type for UI alerts
 */
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: number;
  dismissible?: boolean;
  autoDismiss?: boolean;
  autoDismissTimeout?: number;
}

/**
 * UI state slice that manages interface-related data
 */
export interface UIState {
  isLoading: boolean;
  modalOpen: string | null;
  notifications: Notification[];
}

/**
 * Initial state for the UI slice
 */
export const initialUIState: UIState = {
  isLoading: false,
  modalOpen: null,
  notifications: []
};
