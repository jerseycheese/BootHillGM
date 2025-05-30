/**
 * State Extender
 *
 * Extends the GameState to provide properties needed by the decision services.
 * This handles both legacy and new state formats with proper type safety.
 */

import { GameState } from '../../../types/gameState';
// Import the correct ExtendedGameState type
import { ExtendedGameState } from '../../../types/extendedState';
import { safeExtendGameState, isExtendedGameState, convertToExtendedGameState } from './stateTypeGuards';

/**
 * Extends a GameState with additional properties required by AI decision services
 * 
 * @param state The GameState to extend
 * @returns ExtendedGameState with additional properties
 */
// Update return type annotation
export function extendGameState(state?: GameState): ExtendedGameState {
  // If no state is provided, return a default extended state
  if (!state) {
    return safeExtendGameState({ /* Intentionally empty */ });
  }
  
  // If already extended, return as is
  if (isExtendedGameState(state)) {
    return state;
  }
  
  // Create a properly extended state
  return convertToExtendedGameState(state);
}

/**
 * Extends GameState specifically for contextual decision services
 * 
 * @param state The GameState to extend
 * @returns ExtendedGameState with additional properties for contextual decisions
 */
// Update return type annotation
export function extendGameStateForContextual(state?: GameState): ExtendedGameState {
  // First extend the state normally
  const extendedState = extendGameState(state);
  
  // Add contextual decision specific properties
  return {
    ...extendedState,
    // Add any additional contextual properties here
    activeEvent: false // Default value
  };
}

export default extendGameState;
