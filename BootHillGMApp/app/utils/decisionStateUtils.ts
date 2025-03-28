import { GameState } from '../types/gameState';
import { NarrativeState } from '../types/narrative.types';
import { initialCombatState } from '../types/state/combatState';
import { initialUIState } from '../types/state/uiState';
import { isSliceBasedState } from "./typeGuards";

/**
 * Creates a GameState object that satisfies the requirements for decision generation
 * by ensuring all required properties exist
 */
export function createDecisionGameState(baseState: unknown, narrativeState: unknown): GameState {
  // Create a base state object with correctly typed initial slices
  const safeState: Partial<GameState> = {
    combat: initialCombatState, // Use initialCombatState
    ui: initialUIState,       // Use initialUIState
    // Include narrative state from narrative context, cast to correct type
    narrative: narrativeState as NarrativeState
  };

  // If the base state is already in the slice format, merge it
  if (isSliceBasedState(baseState)) {
    // Create a complete GameState by merging with defaults for any missing properties
    const mergedState = {
      ...safeState,
      ...baseState,
      // Ensure required properties are not undefined
      character: baseState.character ?? null,
      narrative: (baseState.narrative ?? safeState.narrative) as NarrativeState
    };
    
    return mergedState as GameState;
  }

  // Otherwise, convert legacy format to slice format
  const legacyState = {
    ...safeState,
    // Copy other properties from the base state
    ...(baseState as object),
    // Ensure character is explicitly null if undefined
    character: null
  };
  
  return legacyState as GameState;
}