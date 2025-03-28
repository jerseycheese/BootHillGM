import { GameState } from '../../types/gameState';
import { LegacyState, ExtendedNarrativeState } from './stateAdapterTypes';

/**
 * Narrative State Adapter
 *
 * Maps the narrative context to the root level for backward compatibility.
 */
export const narrativeAdapter = {
  // Getter to adapt new state to old state shape
  getNarrativeContext: (state: GameState) => {
    if (!state || !state.narrative) return null;
    
    // Cast to the extended narrative state with both old and new properties
    const narrative = state.narrative as ExtendedNarrativeState;
    
    // First check if the narrative has a "context" property (used in the tests)
    if (narrative.context) {
      return narrative.context;
    }
    
    // Then check for narrativeContext (used in the actual code)
    if (narrative.narrativeContext) {
      return narrative.narrativeContext;
    }
    
    return null;
  },
  
  // Adapter method to handle the state structure difference in tests
  adaptForTests: (state: GameState) => {
    if (!state) return state;
    
    // Cast to a type that includes legacy properties
    const legacyState = state as unknown as LegacyState;
    
    // Only create a new state if we need to add legacy properties
    if (legacyState.narrativeContext !== undefined &&
        legacyState.currentScene !== undefined &&
        legacyState.dialogues !== undefined) {
      // Legacy properties already exist, no need to add them
      return state;
    }
    
    // Create a sanitized narrative state that only includes expected properties
    // This helps with tests that compare against initialNarrativeState
    const narrativeState = state.narrative || {};
    
    // Cast to extended narrative state to access both old and new properties
    const extendedNarrative = narrativeState as ExtendedNarrativeState;

    // Create a shallow copy of the state
    const stateWithSanitizedNarrative = { ...state };
    
    // For test compatibility - add properties that are expected by tests
    // This allows us to normalize between tests that use "context" and code that uses "narrativeContext"
    return Object.defineProperties(
      stateWithSanitizedNarrative,
      {
        // Define getters for legacy properties that compute values on demand
        narrativeContext: {
          get: () => {
            // For test compatibility - try "context" first (used in tests)
            if (extendedNarrative.context) {
              return extendedNarrative.context;
            }
            // Then try narrativeContext (used in actual code)
            return extendedNarrative.narrativeContext || null;
          },
          enumerable: true,
          configurable: true
        },
        currentScene: {
          get: () => {
            if (extendedNarrative.currentScene) {
              return extendedNarrative.currentScene;
            }
            return extendedNarrative.selectedChoice || null;
          },
          enumerable: true,
          configurable: true
        },
        dialogues: {
          get: () => {
            if (extendedNarrative.dialogues) {
              return extendedNarrative.dialogues;
            }
            return [];
          },
          enumerable: true,
          configurable: true
        }
      }
    );
  }
};