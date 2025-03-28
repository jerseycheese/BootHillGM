import { GameState } from '../../types/gameState';
import { LegacyState, ExtendedUIState } from './stateAdapterTypes';

/**
 * UI State Adapter
 *
 * Provides UI state properties at the root level for backward compatibility.
 */
export const uiAdapter = {
  adaptForTests: (state: GameState) => {
    if (!state) return state;
    
    // Cast to extended UI state to access both old and new properties
    const extendedUI = state.ui as ExtendedUIState;
    
    // Cast to a type that includes legacy properties
    const legacyState = state as unknown as LegacyState;
    
    // Only create a new state if we need to add legacy properties
    if (legacyState.activeTab !== undefined &&
        legacyState.isMenuOpen !== undefined &&
        legacyState.notifications !== undefined) {
      // Legacy properties already exist, no need to add them
      return state;
    }
    
    // Use property descriptors for dynamic computed properties
    return Object.defineProperties(
      // Shallow copy of the state
      { ...state },
      {
        // Define getters for legacy properties that compute values on demand
        activeTab: {
          get: () => extendedUI?.activeTab || 'character',
          enumerable: true,
          configurable: true
        },
        isMenuOpen: {
          get: () => extendedUI?.isMenuOpen || false,
          enumerable: true,
          configurable: true
        },
        notifications: {
          get: () => extendedUI?.notifications || [],
          enumerable: true,
          configurable: true
        }
      }
    );
  }
};