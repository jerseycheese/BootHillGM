/**
 * Narrative Reducer
 * 
 * This file contains the reducer function for handling narrative state updates.
 * It processes all narrative-related actions and ensures immutable state updates.
 */

import {
  NarrativeAction,
  NarrativeContext,
  StoryPoint,
  NarrativeChoice,
  NarrativeDisplayMode,
  initialNarrativeState,
  NarrativeState,
  PlayerDecision,
} from '../types/narrative.types';
import { GameState } from '../types/gameState';
import { createDecisionRecord } from '../utils/decisionUtils';

/**
 * Generates a default NarrativeContext object.
 * @returns {NarrativeContext} A default NarrativeContext object.
 */
const defaultNarrativeContext = (): NarrativeContext => ({
    tone: undefined,
    characterFocus: [],
    themes: [],
    worldContext: '',
    importantEvents: [],
    storyPoints: {},
    narrativeArcs: {},
    narrativeBranches: {},
    currentArcId: undefined,
    currentBranchId: undefined,
    activeDecision: undefined, // Added
    pendingDecisions: [],     // Added
    decisionHistory: [],      // Added
});

/**
 * Validates that a story point exists in the current narrative.
 * @param {string} storyPointId - ID of the story point to validate.
 * @param {Record<string, StoryPoint>} storyPoints - Collection of available story points.
 * @returns {boolean} True if the story point exists, false otherwise.
 */
const validateStoryPoint = (
  storyPointId: string,
  storyPoints: Record<string, StoryPoint>
): boolean => {
  return Boolean(storyPoints[storyPointId]);
};

/**
 * Validates that a choice is available and valid for the current story point.
 * @param choiceId - ID of the choice to validate.
 * @param availableChoices - Current available choices.
 * @returns True if the choice is valid, false otherwise.
 */
const validateChoice = (
  choiceId: string,
  availableChoices: NarrativeChoice[]
): boolean => {
  return availableChoices.some((choice) => choice.id === choiceId);
};

/**
 * Updates the available choices based on the current story point.
 * @param storyPoint - Current story point.
 * @returns Array of available narrative choices.
 */
const updateAvailableChoices = (
  storyPoint: StoryPoint | null
): NarrativeChoice[] => {
  if (!storyPoint || !storyPoint.choices) {
    return [];
  }
  return storyPoint.choices;
};

/**
 * Reducer function to handle narrative-related state updates.
 * @param {NarrativeState} state - The current narrative state.
 * @param {NarrativeAction} action - The action to be processed.
 * @returns {NarrativeState} The updated narrative state.
 */
export function narrativeReducer(
  state: NarrativeState = initialNarrativeState,
  action: NarrativeAction
): NarrativeState {
  switch (action.type) {
    case 'NAVIGATE_TO_POINT': {
      // Ensure we have story points available - this would come from a loaded narrative
      const storyPoints = state.narrativeContext?.storyPoints || {};

      if (!validateStoryPoint(action.payload, storyPoints)) {
        // TODO: Replace with a more robust error handling mechanism (e.g., dispatch an error action)
        return state;
      }

      const newStoryPoint = storyPoints[action.payload];
      const updatedChoices = updateAvailableChoices(newStoryPoint);

      // Add current point to visited points if not already there
      const visitedPoints =
        Array.isArray(state.visitedPoints) &&
        state.visitedPoints.includes(action.payload)
          ? state.visitedPoints
          : [
              ...(Array.isArray(state.visitedPoints) ? state.visitedPoints : []),
              action.payload,
            ];

      return {
        ...state,
        currentStoryPoint: newStoryPoint,
        availableChoices: updatedChoices,
        visitedPoints,
      };
    }

    case 'SELECT_CHOICE': {
      if (!validateChoice(action.payload, state.availableChoices)) {
        // TODO: Replace with a more robust error handling mechanism (e.g., dispatch an error action)
        return state;
      }

      const selectedChoice = state.availableChoices.find(
        (choice) => choice.id === action.payload
      );

      if (!selectedChoice) {
        return state;
      }

      // We don't navigate here, just record the choice.
      // The navigation will be handled by a separate NAVIGATE_TO_POINT action
      return {
        ...state,
        selectedChoice: selectedChoice.id,
      };
    }

    case 'ADD_NARRATIVE_HISTORY': {
      return {
        ...state,
        narrativeHistory: [...state.narrativeHistory, action.payload],
      };
    }

    case 'SET_DISPLAY_MODE': {
      return {
        ...state,
        displayMode: action.payload,
      };
    }

    case 'START_NARRATIVE_ARC': {
      const arcs = state.narrativeContext?.narrativeArcs || {};
      const arc = arcs[action.payload];

      if (!arc) {
        // TODO: Replace with a more robust error handling mechanism (e.g., dispatch an error action)
        return state;
      }

      // Mark the arc as active
      const updatedArcs = {
        ...arcs,
        [action.payload]: {
          ...arc,
          isActive: true,
        },
      };

      const startingBranchId = arc.startingBranch;
      const branches = state.narrativeContext?.narrativeBranches || {};

      // Always set currentBranchId if startingBranchId is present
      // Provide default values for required NarrativeContext properties
      const updatedNarrativeContext: NarrativeContext = {
        ...defaultNarrativeContext(),
        ...(state.narrativeContext || { characterFocus: [] }),
        characterFocus: state.narrativeContext?.characterFocus ?? [],
        themes: state.narrativeContext?.themes ?? [],
        importantEvents: state.narrativeContext?.importantEvents ?? [],
        narrativeArcs: updatedArcs,
        currentArcId: action.payload,
        currentBranchId: startingBranchId ? startingBranchId : undefined,
      };

      // Only update branches if the branch exists
      if (startingBranchId && branches[startingBranchId]) {
        const updatedBranches = {
          ...branches,
          [startingBranchId]: {
            ...branches[startingBranchId],
            isActive: true,
          },
        };
        updatedNarrativeContext.narrativeBranches = updatedBranches;
      }

      return {
        ...state,
        narrativeContext: updatedNarrativeContext,
      };
    }

    case 'COMPLETE_NARRATIVE_ARC': {
      const arcs = state.narrativeContext?.narrativeArcs || {};
      const arc = arcs[action.payload];

      if (!arc) {
        // TODO: Replace with a more robust error handling mechanism (e.g., dispatch an error action)
        console.error(`Invalid narrative arc ID: ${action.payload}`);
        return state;
      }

      // Mark the arc as completed
      const updatedArcs = {
        ...arcs,
        [action.payload]: {
          ...arc,
          isCompleted: true,
        },
      };

      return {
        ...state,
        narrativeContext: {
          ...defaultNarrativeContext(),
          ...(state.narrativeContext || {}),
          narrativeArcs: updatedArcs,
          characterFocus: state.narrativeContext?.characterFocus ?? [],
          themes: state.narrativeContext?.themes ?? [],
          worldContext: state.narrativeContext?.worldContext ?? '',
          importantEvents: state.narrativeContext?.importantEvents ?? []
        },
      };
    }

    case 'ACTIVATE_BRANCH': {
      const branches = state.narrativeContext?.narrativeBranches || {};
      const branch = branches[action.payload];

      if (!branch) {
        // TODO: Replace with a more robust error handling mechanism (e.g., dispatch an error action)
        console.error(`Invalid narrative branch ID: ${action.payload}`);
        return state;
      }

      // Mark the branch as active
      const updatedBranches = {
        ...branches,
        [action.payload]: {
          ...branch,
          isActive: true,
        },
      };

      return {
        ...state,
        narrativeContext: {
          ...defaultNarrativeContext(),
          ...(state.narrativeContext || {}),
          narrativeBranches: updatedBranches,
          currentBranchId: action.payload,
        },
      };
    }

    case 'COMPLETE_BRANCH': {
      const branches = state.narrativeContext?.narrativeBranches || {};
      const branch = branches[action.payload];

      if (!branch) {
        // TODO: Replace with a more robust error handling mechanism (e.g., dispatch an error action)
        console.error(`Invalid narrative branch ID: ${action.payload}`);
        return state;
      }

      // Mark the branch as inactive (completed)
      const updatedBranches = {
        ...branches,
        [action.payload]: {
          ...branch,
          isActive: false,
          isCompleted: true,
        },
      };

      return {
        ...state,
        narrativeContext: {
          ...defaultNarrativeContext(),
          ...(state.narrativeContext || {}),
          narrativeBranches: updatedBranches,
          characterFocus: state.narrativeContext?.characterFocus ?? [],
          themes: state.narrativeContext?.themes ?? [],
          importantEvents: state.narrativeContext?.importantEvents ?? []
        },
      };
    }

    case 'UPDATE_NARRATIVE_CONTEXT': {
      const updatedContext = {
        ...state,
        narrativeContext: {
          ...defaultNarrativeContext(),
          ...(state.narrativeContext || {}),
          ...action.payload,
          characterFocus: action.payload.characterFocus ?? state.narrativeContext?.characterFocus ?? [],
          themes: action.payload.themes ?? state.narrativeContext?.themes ?? [],
          importantEvents: action.payload.importantEvents ?? state.narrativeContext?.importantEvents ?? []
        },
      };
      console.log('UPDATE_NARRATIVE action:', action.payload);
      return updatedContext;
    }


    case 'RESET_NARRATIVE': {
      return initialNarrativeState;
    }
    case 'PRESENT_DECISION': {
      return {
        ...state,
        currentDecision: action.payload,
      };
    }

    case 'RECORD_DECISION': {
      // Ensure we have a decision to record and a context to store it in
      if (!state.currentDecision || !state.narrativeContext) {
        return state;
      }

      const { decisionId, selectedOptionId, narrative } = action.payload;
      
      // Verify this is for the current decision
      if (state.currentDecision.id !== decisionId) {
        return state;
      }
      // Create the decision record
      // Create the decision record
      const decisionRecord = createDecisionRecord(
        state.currentDecision,
        selectedOptionId,
        narrative
      );

      // Update the narrative context with the new decision record
      return {
        ...state,
        currentDecision: undefined, // Clear the current decision
        narrativeContext: {
          ...state.narrativeContext,
          decisionHistory: [
            ...(state.narrativeContext.decisionHistory || []),
            decisionRecord
          ]
        },
      };
    }
    case 'CLEAR_CURRENT_DECISION': {
      return {
        ...state,
        currentDecision: undefined,
      };
    }
    
    case 'UPDATE_NARRATIVE': {
      return {
        ...state,
        ...action.payload,
      };
    }

    default:
      return state;
  }
}

/**
 * Action creator for navigating to a specific story point.
 * @param storyPointId - ID of the story point to navigate to.
 * @returns Narrative action object.
 */
export const navigateToPoint = (storyPointId: string): NarrativeAction => ({
  type: 'NAVIGATE_TO_POINT',
  payload: storyPointId,
});

/**
 * Action creator for selecting a narrative choice.
 * @param choiceId - ID of the choice to select.
 * @returns Narrative action object.
 */
export const selectChoice = (choiceId: string): NarrativeAction => ({
  type: 'SELECT_CHOICE',
  payload: choiceId,
});

/**
 * Action creator for adding an entry to the narrative history.
 * @param {string} historyEntry - Text to add to the narrative history.
 * @returns {NarrativeAction} Narrative action object.
 */
export const addNarrativeHistory = (historyEntry: string): NarrativeAction => ({
  type: 'ADD_NARRATIVE_HISTORY',
  payload: historyEntry,
});

/**
 * Action creator for setting the narrative display mode.
 * @param {NarrativeDisplayMode} mode - Display mode to set.
 * @returns {NarrativeAction} Narrative action object.
 */
export const setDisplayMode = (mode: NarrativeDisplayMode): NarrativeAction => ({
  type: 'SET_DISPLAY_MODE',
  payload: mode,
});

/**
 * Action creator for starting a narrative arc.
 * @param {string} arcId - ID of the arc to start.
 * @returns {NarrativeAction} Narrative action object.
 */
export const startNarrativeArc = (arcId: string): NarrativeAction => ({
  type: 'START_NARRATIVE_ARC',
  payload: arcId,
});

/**
 * Action creator for completing a narrative arc.
 * @param {string} arcId - ID of the arc to complete.
 * @returns {NarrativeAction} Narrative action object.
 */
export const completeNarrativeArc = (arcId: string): NarrativeAction => ({
  type: 'COMPLETE_NARRATIVE_ARC',
  payload: arcId,
});

/**
 * Action creator for activating a narrative branch.
 * @param {string} branchId - ID of the branch to activate.
 * @returns {NarrativeAction} Narrative action object.
 */
export const activateBranch = (branchId: string): NarrativeAction => ({
  type: 'ACTIVATE_BRANCH',
  payload: branchId,
});

/**
 * Action creator for completing a narrative branch.
 * @param {string} branchId - ID of the branch to complete.
 * @returns {NarrativeAction} Narrative action object.
 */
export const completeBranch = (branchId: string): NarrativeAction => ({
  type: 'COMPLETE_BRANCH',
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
  type: 'UPDATE_NARRATIVE_CONTEXT',
  payload: contextUpdate,
});

/**
 * Action creator for resetting the narrative state.
 * @returns {NarrativeAction} Narrative action object.
 */
export const resetNarrative = (): NarrativeAction => ({
  type: 'RESET_NARRATIVE',
});

/**
 * Action creator for presenting a decision to the player.
 * @param decision - The decision to present, including prompt, options, and context.
 * @returns Narrative action object with type 'PRESENT_DECISION' and the decision as payload.
 */
export const presentDecision = (decision: PlayerDecision): NarrativeAction => ({
  type: 'PRESENT_DECISION',
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
  type: 'RECORD_DECISION',
  payload: { decisionId, selectedOptionId, narrative },
});

/**
 * Action creator for clearing the current decision. This is typically called after a decision has been recorded.
 * @returns Narrative action object with type 'CLEAR_CURRENT_DECISION'.
 */
export const clearCurrentDecision = (): NarrativeAction => ({
  type: 'CLEAR_CURRENT_DECISION',
});

/**
 * Test wrapper for the narrative reducer that handles nested state structures.
 * This is only used in tests and should not be used in production code.
 *
 * @param state - The state to pass to the reducer, which may be a nested structure
 * @param action - The action to dispatch
 * @returns The updated state with the same structure as the input
 */
export function testNarrativeReducer(
  state: NarrativeState | Partial<GameState> = initialNarrativeState,
  action: NarrativeAction
): NarrativeState | Partial<GameState> {
  // Handle the case where state is a GameState with a narrative property
  if ('narrative' in state && state.narrative) {
    const updatedNarrative = narrativeReducer(state.narrative, action);
    return {
      ...state,
      narrative: updatedNarrative
    };
  }
  
  // Handle the case where state is a NarrativeState directly
  return narrativeReducer(state as NarrativeState, action);
}
