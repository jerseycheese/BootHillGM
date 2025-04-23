/**
 * Narrative Action Creators
 * 
 * This file contains action creators for the narrative reducer.
 */

// Import specific types from their respective modules
import { NarrativeAction } from '../types/narrative/actions.types';
import { NarrativeDisplayMode } from '../types/narrative/choice.types';
import { NarrativeContext, ImpactState } from '../types/narrative/context.types';
import { PlayerDecision, PlayerDecisionRecord } from '../types/narrative/decision.types';
import { NarrativeErrorType } from '../types/narrative/error.types';
import { DecisionImpact } from '../types/narrative/arc.types';
import { ActionTypes } from '../types/actionTypes';
import { NarrativeStateUpdate } from '../types/narrative.types';

/**
 * Action creator for navigating to a specific story point.
 * @param storyPointId - ID of the story point to navigate to.
 * @returns Narrative action object.
 */
export const navigateToPoint = (storyPointId: string): NarrativeAction => ({
  type: ActionTypes.NAVIGATE_TO_POINT, // Use ActionTypes
  payload: storyPointId,
});

/**
 * Action creator for selecting a narrative choice.
 * @param choiceId - ID of the choice to select.
 * @returns Narrative action object.
 */
export const selectChoice = (choiceId: string): NarrativeAction => ({
  type: ActionTypes.SELECT_CHOICE, // Use ActionTypes
  payload: choiceId,
});

/**
 * Action creator for adding an entry to the narrative history.
 * @param {string} historyEntry - Text to add to the narrative history.
 * @returns {NarrativeAction} Narrative action object.
 */
export const addNarrativeHistory = (historyEntry: string): NarrativeAction => ({
  type: ActionTypes.ADD_NARRATIVE_HISTORY,
  payload: historyEntry,
});

/**
 * Action creator for setting the narrative display mode.
 * @param {NarrativeDisplayMode} mode - Display mode to set.
 * @returns {NarrativeAction} Narrative action object.
 */
export const setDisplayMode = (mode: NarrativeDisplayMode): NarrativeAction => ({
  type: ActionTypes.SET_DISPLAY_MODE, // Use ActionTypes
  payload: mode,
});

/**
 * Action creator for starting a narrative arc.
 * @param {string} arcId - ID of the arc to start.
 * @returns {NarrativeAction} Narrative action object.
 */
export const startNarrativeArc = (arcId: string): NarrativeAction => ({
  type: ActionTypes.START_NARRATIVE_ARC, // Use ActionTypes
  payload: arcId,
});

/**
 * Action creator for completing a narrative arc.
 * @param {string} arcId - ID of the arc to complete.
 * @returns {NarrativeAction} Narrative action object.
 */
export const completeNarrativeArc = (arcId: string): NarrativeAction => ({
  type: ActionTypes.COMPLETE_NARRATIVE_ARC, // Use ActionTypes
  payload: arcId,
});

/**
 * Action creator for activating a narrative branch.
 * @param {string} branchId - ID of the branch to activate.
 * @returns {NarrativeAction} Narrative action object.
 */
export const activateBranch = (branchId: string): NarrativeAction => ({
  type: ActionTypes.ACTIVATE_BRANCH, // Use ActionTypes
  payload: branchId,
});

/**
 * Action creator for completing a narrative branch.
 * @param {string} branchId - ID of the branch to complete.
 * @returns {NarrativeAction} Narrative action object.
 */
export const completeBranch = (branchId: string): NarrativeAction => ({
  type: ActionTypes.COMPLETE_BRANCH, // Use ActionTypes
  payload: branchId,
});

/**
 * Action creator for updating narrative context.
 * @param {Partial<NarrativeContext>} contextUpdate - Partial context update.
 * @returns {NarrativeAction} Narrative action object.
 */
export const updateNarrativeContext = (
  contextUpdate: Partial<NarrativeContext>
): NarrativeAction => ({
  type: ActionTypes.SET_NARRATIVE_CONTEXT,
  payload: contextUpdate,
});

/**
 * Action creator for updating the narrative state.
 * @param {NarrativeStateUpdate} update - Partial narrative state update.
 * @returns {NarrativeAction} Narrative action object.
 */
export const updateNarrative = (
  update: NarrativeStateUpdate
): NarrativeAction => ({
  type: ActionTypes.UPDATE_NARRATIVE,
  payload: update,
});

/**
 * Action creator for resetting the narrative state.
 * @returns {NarrativeAction} Narrative action object.
 */
export const resetNarrative = (): NarrativeAction => ({
  type: ActionTypes.RESET_NARRATIVE,
});

/**
 * Action creator for presenting a decision to the player.
 * @param decision - The decision to present, including prompt, options, and context.
 * @returns Narrative action object with type 'PRESENT_DECISION' and the decision as payload.
 */
export const presentDecision = (decision: PlayerDecision): NarrativeAction => ({
  type: ActionTypes.PRESENT_DECISION, // Use ActionTypes
  payload: decision,
});

/**
 * Action creator for recording a player's decision.
 * @param decisionId - ID of the decision the player is responding to.
 * @param selectedOptionId - ID of the option the player selected.
 * @param narrative - The narrative text presented after the player makes the decision.
 * @returns Narrative action object with type 'RECORD_DECISION' and the relevant IDs and narrative as payload.
 */
export const recordDecision = (
  decisionId: string,
  selectedOptionId: string,
  narrative: string
): NarrativeAction => ({
  type: ActionTypes.RECORD_DECISION, // Use ActionTypes
  payload: {
    decisionId,
    selectedOptionId,
    narrative,
    timestamp: Date.now(),
    impactDescription: '', // Default empty string
    tags: [], // Default empty array
    relevanceScore: 5 // Default middle score
  } as PlayerDecisionRecord,
});

/**
 * Action creator for clearing the current decision. This is typically called after a decision has been recorded.
 * @returns Narrative action object with type 'CLEAR_CURRENT_DECISION'.
 */
export const clearCurrentDecision = (): NarrativeAction => ({
  type: ActionTypes.CLEAR_CURRENT_DECISION, // Use ActionTypes
});

/**
 * Action creator for processing the impacts of a decision.
 * This action triggers the calculation of how a decision affects various aspects of the game world,
 * such as reputation, relationships, and story progression.
 * 
 * @param impacts - Array of decision impacts to process
 * @returns Narrative action object with type 'PROCESS_DECISION_IMPACTS'.
 */
export const processDecisionImpacts = (impacts: DecisionImpact[]): NarrativeAction => ({
  type: ActionTypes.PROCESS_DECISION_IMPACTS, // Use ActionTypes
  payload: impacts,
});

/**
 * Action creator for directly updating the impact state.
 * This allows for manual adjustment of impact values, which can be useful
 * for scripted events or developer overrides.
 * 
 * @param impactStateUpdate - Partial update to the impact state, containing only the values to be updated.
 * @returns Narrative action object with type 'UPDATE_IMPACT_STATE'.
 */
export const updateImpactState = (
  impactStateUpdate: Partial<ImpactState>
): NarrativeAction => ({
  type: ActionTypes.UPDATE_IMPACT_STATE, // Use ActionTypes
  payload: impactStateUpdate,
});

/**
 * Action creator for evolving impacts over time.
 * This action causes temporary impacts to decay or expire based on the time elapsed
 * since they were created, simulating the natural fading of consequences over time.
 * 
 * @returns Narrative action object with type 'EVOLVE_IMPACTS'.
 */
export const evolveImpacts = (): NarrativeAction => ({
  type: ActionTypes.EVOLVE_IMPACTS, // Use ActionTypes
});

/**
 * Action creator for handling narrative errors.
 * This action records errors that occur during narrative operations,
 * allowing for proper error tracking and display.
 * 
 * @param code - The error type code
 * @param message - Detailed error message
 * @param context - Optional contextual information about the error
 * @returns Narrative action object with type 'NARRATIVE_ERROR'
 */
export const narrativeError = (
  code: NarrativeErrorType,
  message: string,
  context?: Record<string, unknown>
): NarrativeAction => ({
  type: ActionTypes.NARRATIVE_ERROR, // Use ActionTypes
  payload: {
    code,
    message,
    context,
    timestamp: Date.now()
  }
});

/**
 * Action creator for clearing the current error state.
 * This allows components to acknowledge an error has been handled.
 * 
 * @returns Narrative action object with type 'CLEAR_ERROR'
 */
export const clearError = (): NarrativeAction => ({
  type: ActionTypes.CLEAR_ERROR // Use ActionTypes
});