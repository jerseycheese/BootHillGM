import { ExtendedGameState } from '../types/extendedState';
import { NarrativeState } from '../types/state/narrativeState';

/**
 * Handles setting narrative text with proper history management
 */
export function handleSetNarrative(state: ExtendedGameState, payload: unknown): ExtendedGameState {
  if (!payload) {
    return state;
  }

  // Create a copy of the current narrative state
  const currentNarrative = { ...state.narrative };
  
  // Handle both string payloads and object payloads with text property
  let narrativeText = '';
  
  if (typeof payload === 'string') {
    narrativeText = payload;
  } else if (typeof payload === 'object' && payload !== null) {
    if ('text' in payload && typeof payload.text === 'string') {
      narrativeText = payload.text;
    } else if ('narrative' in payload && typeof payload.narrative === 'string') {
      narrativeText = payload.narrative;
    }
  }
  
  // Skip empty narratives
  if (!narrativeText.trim()) {
    return state;
  }
  
  // Update the history array
  const updatedHistory = [...currentNarrative.narrativeHistory, narrativeText];
  
  return {
    ...state,
    narrative: {
      ...currentNarrative,
      narrativeHistory: updatedHistory,
    }
  };
}

/**
 * Updates narrative state while maintaining compatibility
 */
export function updateNarrativeState(
  state: ExtendedGameState, 
  updatedNarrative: Partial<NarrativeState>
): ExtendedGameState {
  // Create a deep copy to avoid mutation issues
  // Directly merge the updated narrative state without migration
  const newState = {
    ...state,
    narrative: {
      ...state.narrative,
      ...updatedNarrative
    }
  } as ExtendedGameState;
  
  return newState;
}
