// Import existing narrative action types from your codebase
import { NarrativeAction as OriginalNarrativeAction } from '../narrative.types';

/**
 * Re-export the original narrative action type
 * This ensures backward compatibility with existing code
 */
export type NarrativeAction = OriginalNarrativeAction;

/**
 * Define additional narrative action types if needed
 */
export type NarrativeActionType =
  | 'narrative/ADD_NARRATIVE_HISTORY'
  | 'narrative/SET_NARRATIVE_HISTORY';

/**
 * New narrative action interfaces
 */
export interface AddNarrativeHistoryAction {
  type: 'narrative/ADD_NARRATIVE_HISTORY';
  payload: string;
}

export interface SetNarrativeHistoryAction {
  type: 'narrative/SET_NARRATIVE_HISTORY';
  payload: string[];
}

/**
 * Combined narrative actions type
 * Includes both original and new action types
 */
export type ExtendedNarrativeAction =
  | NarrativeAction
  | AddNarrativeHistoryAction
  | SetNarrativeHistoryAction;
