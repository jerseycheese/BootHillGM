import { GameState } from '../../types/gameState';
import { LegacyState } from './stateAdapterTypes';

/**
 * Combat State Adapter
 *
 * Adds isCombatActive flag at the root level for backward compatibility.
 */
export const combatAdapter = {
  // Getter to check if combat is active
  isCombatActive: (state: GameState) => {
    return state?.combat?.isActive || false;
  },
  
  // Adapter method to handle the state structure difference in tests
  adaptForTests: (state: GameState) => {
    if (!state) return state;
    
    // Cast to a type that includes legacy properties
    const legacyState = state as unknown as LegacyState;
    
    // Only create a new state if we need to add legacy properties
    if (legacyState.isCombatActive !== undefined &&
        legacyState.combatRounds !== undefined &&
        legacyState.currentTurn !== undefined) {
      // Legacy properties already exist, no need to add them
      return state;
    }
    
    // Use property descriptors for dynamic computed properties
    return Object.defineProperties(
      // Shallow copy of the state
      { ...state },
      {
        // Define getters for legacy properties that compute values on demand
        isCombatActive: {
          get: () => state.combat?.isActive || false,
          enumerable: true,
          configurable: true
        },
        combatRounds: {
          get: () => state.combat?.rounds || 0,
          enumerable: true,
          configurable: true
        },
        currentTurn: { 
          get: () => state.combat?.currentTurn || null,
          enumerable: true,
          configurable: true
        }
      }
    );
  }
};