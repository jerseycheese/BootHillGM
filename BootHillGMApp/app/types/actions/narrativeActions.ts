import { NarrativeAction as OriginalNarrativeAction } from '../narrative.types';
import { ActionTypes } from '../actionTypes'; // Import ActionTypes

/**
 * Re-export the original narrative action type
 * This ensures backward compatibility with existing code
 */
export type NarrativeAction = OriginalNarrativeAction;

/**
 * Narrative action interfaces using ActionTypes
 */
export interface AddNarrativeHistoryAction {
  type: typeof ActionTypes.ADD_NARRATIVE_HISTORY; // Use ActionTypes
  payload: string;
}

/**
 * Combined narrative actions type
 * Includes both original and standardized action types
 */
export type ExtendedNarrativeAction =
  | NarrativeAction
  | AddNarrativeHistoryAction;
