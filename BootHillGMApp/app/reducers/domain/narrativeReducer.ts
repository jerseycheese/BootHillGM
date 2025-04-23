/**
 * Narrative Reducer
 * 
 * Handles all narrative-related state changes including story progression,
 * narrative context, and history management for game storytelling.
 */

import { GameState, initialGameState } from '../../types/gameState';
import { GameAction } from '../../types/actions';
import { ActionTypes } from '../../types/actionTypes';
import { NarrativeState } from '../../types/state';
import { NarrativeContext } from '../../types/narrative/context.types';

interface ActionWithPayload {
  type: string;
  payload: unknown;
}

/**
 * Process narrative-related actions
 * 
 * @param state Current game state
 * @param action Game action to process
 * @returns Updated game state
 */
export function narrativeReducer(state: GameState, action: GameAction): GameState {
  // Ensure narrative state exists
  const narrativeState = state.narrative || initialGameState.narrative;
  
  // Ensure narrativeContext exists within narrative state
  const narrativeContext = narrativeState.narrativeContext || initialGameState.narrative.narrativeContext;
  
  switch (action.type) {
    case ActionTypes.ADD_NARRATIVE_HISTORY: {
      // Ensure payload is a string
      const content = typeof (action as ActionWithPayload).payload === 'string' 
        ? (action as ActionWithPayload).payload as string 
        : '';
      
      return {
        ...state,
        narrative: {
          ...narrativeState,
          narrativeHistory: [...narrativeState.narrativeHistory, content] 
        }
      };
    }
      
    case ActionTypes.SET_NARRATIVE_CONTEXT: {
      // Ensure payload is a valid NarrativeContext object
      const newContext = typeof (action as ActionWithPayload).payload === 'object' && (action as ActionWithPayload).payload !== null 
                         ? (action as ActionWithPayload).payload as NarrativeContext 
                         : narrativeContext; // Fallback to existing or initial context
      return {
        ...state,
        narrative: {
          ...narrativeState,
          narrativeContext: newContext
        }
      };
    }
      
    case ActionTypes.UPDATE_NARRATIVE: {
      // Cast to ActionWithPayload interface instead of any
      const typedAction = action as ActionWithPayload;
      const updatePayload = typeof typedAction.payload === 'object' && typedAction.payload !== null
                          ? typedAction.payload as Partial<NarrativeState>
                          : {};
      return {
        ...state,
        narrative: {
          ...narrativeState,
          ...updatePayload // Merge updates into narrative state
        }
      };
    }
      
    default:
      return state;
  }
}
