import { NarrativeState, initialNarrativeState } from '../../types/state/narrativeState';
import { GameAction } from '../../types/actions';
import { narrativeReducer as originalNarrativeReducer } from '../narrativeReducer';
import { NarrativeAction } from '../../types/narrative/actions.types';

/**
 * Custom type guard for checking if an action has a payload
 */
function hasPayload<T>(action: GameAction): action is GameAction & { payload: T } {
  return 'payload' in action && action.payload !== undefined;
}

/**
 * Process string or object payload for narrative content
 */
function extractNarrativeText(payload: unknown): string {
  if (typeof payload === 'string') {
    return payload;
  }
  
  if (payload && typeof payload === 'object' && 'text' in payload) {
    return String(payload.text);
  }
  
  return '';
}

/**
 * Type guard for checking if an array is valid for narrativeHistory
 */
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

/**
 * Narrative slice reducer
 * This wrapper maintains compatibility with the existing narrative reducer
 * while adding support for new action types
 */
export function narrativeReducer(
  state: NarrativeState = initialNarrativeState, 
  action: GameAction
): NarrativeState {
  // Use action.type as a string for comparison
  const actionType = action.type as string;

  // Handle legacy SET_NARRATIVE action
  if (actionType === 'SET_NARRATIVE') {
    if (!hasPayload<unknown>(action)) {
      return state;
    }
    
    const narrativeText = extractNarrativeText(action.payload);
    
    if (!narrativeText) {
      return state;
    }
      
    return {
      ...state,
      narrativeHistory: [...state.narrativeHistory, narrativeText]
    };
  }
  
  // Handle SET_STATE for state restoration
  else if (actionType === 'SET_STATE') {
    if (!hasPayload<Record<string, unknown>>(action)) {
      return state;
    }
    
    const payload = action.payload;
    
    if (!('narrative' in payload)) {
      return state;
    }
    
    const narrativeData = payload.narrative;
    
    // If narrativeData has a narrativeHistory property that's an array of strings, 
    // use it, otherwise keep the current narrativeHistory
    const narrativeHistory = narrativeData && 
                            typeof narrativeData === 'object' && 
                            'narrativeHistory' in narrativeData &&
                            isStringArray(narrativeData.narrativeHistory)
      ? narrativeData.narrativeHistory
      : state.narrativeHistory;
    
    return {
      ...state,
      ...(narrativeData as Partial<NarrativeState>),
      narrativeHistory
    };
  }
  
  // Then pass to the original reducer for other action types
  // Use type assertion to safely cast GameAction to NarrativeAction
  try {
    return originalNarrativeReducer(state, action as unknown as NarrativeAction);
  } catch (error) {
    // If the original reducer throws an error, just return the current state
    console.error('Error in narrative reducer:', error);
    return state;
  }
}
