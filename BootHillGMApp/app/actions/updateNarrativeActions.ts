/**
 * Narrative State Update Action Creators
 * 
 * This file contains action creators for updating the narrative state directly.
 */

import { NarrativeAction } from '../types/narrative/actions.types';
import { NarrativeStateUpdate } from '../types/narrative.types';
import { ActionTypes } from '../types/actionTypes';

/**
 * Action creator for updating the narrative state directly.
 * This is different from updateNarrativeContext which updates the context property.
 * 
 * @param stateUpdate - Partial update to the narrative state
 * @returns Narrative action object
 */
export const updateNarrative = (
  stateUpdate: NarrativeStateUpdate
): NarrativeAction => ({
  type: ActionTypes.UPDATE_NARRATIVE,
  payload: stateUpdate
});
