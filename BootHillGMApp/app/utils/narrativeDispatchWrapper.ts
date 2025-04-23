/**
 * Narrative Dispatch Wrapper
 * 
 * Utility for converting between different action types in the system.
 * This wrapper handles the conversion between NarrativeAction from narrative/actions.types.ts
 * and the GameAction type from the main actions.ts file.
 * 
 * It allows the narrative subsystem to work with its own strongly-typed actions
 * while still integrating with the main game state context.
 */

import { GameAction } from '../types/actions';
import { NarrativeAction } from '../types/narrative/actions.types';

/**
 * Wraps a dispatch function to handle NarrativeAction from narrative/actions.types.ts
 * and convert it to a compatible GameAction.
 * 
 * @param dispatch The original dispatch function that accepts GameAction
 * @returns A wrapped dispatch function that accepts NarrativeAction
 */
export const narrativeDispatchWrapper = (
  dispatch: (action: GameAction) => void
) => {
  return (action: NarrativeAction): void => {
    // Convert the strongly-typed NarrativeAction to a GameAction
    // This is necessary because the two action types are defined in different files
    // but represent the same conceptual actions
    const gameAction = action as unknown as GameAction;
    
    // Dispatch the converted action
    dispatch(gameAction);
  };
};

export default narrativeDispatchWrapper;