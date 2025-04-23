/**
 * Narrative Reducer
 * 
 * This file contains the main reducer function for handling narrative state updates.
 * It delegates specialized functionality to sub-reducers.
 */

import {
  NarrativeAction,
  NarrativeState,
  initialNarrativeState,
  initialLoreState,
  LoreAction
} from '../types/narrative.types';
import { GameState } from '../types/gameState';
import { ActionTypes } from '../types/actionTypes';

// Import helper functions
import {
  validateStoryPoint,
  validateChoice,
  updateAvailableChoices
} from '../utils/narrativeHelpers';

// Import specialized reducers
import {
  handleArcActions,
  handleBranchActions,
  handleContextActions
} from './narrative/narrativeArcReducer';

// Import decision-specific reducer functions
import {
  handlePresentDecision,
  handleRecordDecision,
  handleClearCurrentDecision,
  handleProcessDecisionImpacts,
  handleUpdateImpactState,
  handleEvolveImpacts
} from './decisionReducer';

// Import lore reducer
import { loreReducer } from './loreReducer';

// Import error handling utilities
import { createNarrativeError } from './narrative/errorHandling';

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
  // Handle lore-specific actions by delegating to loreReducer
  if (
    // Assuming LoreAction types are handled correctly by loreReducer
    // (Need to verify loreReducer and LoreAction types separately if issues persist)
    action.type === ActionTypes.ADD_LORE_FACT ||
    action.type === ActionTypes.UPDATE_LORE_FACT ||
    action.type === ActionTypes.INVALIDATE_LORE_FACT ||
    action.type === ActionTypes.VALIDATE_LORE_FACT ||
    action.type === ActionTypes.ADD_RELATED_FACTS ||
    action.type === ActionTypes.REMOVE_RELATED_FACTS ||
    action.type === ActionTypes.ADD_FACT_TAGS ||
    action.type === ActionTypes.REMOVE_FACT_TAGS ||
    action.type === ActionTypes.PROCESS_LORE_EXTRACTION
   ) {
     // Initialize lore state if it doesn't exist
    const loreState = state.lore || initialLoreState;
    // Update lore state with loreReducer
    const updatedLoreState = loreReducer(loreState, action as LoreAction);
    
    // Return updated state with new lore state
    return {
      ...state,
      lore: updatedLoreState
    };
  }

  // Handle other narrative actions
  switch (action.type) {
    case ActionTypes.NAVIGATE_TO_POINT: { // Use ActionTypes
      // Ensure we have story points available
      const storyPoints = state.narrativeContext?.storyPoints || { /* Intentionally empty */ };

      if (!validateStoryPoint(action.payload, storyPoints)) {
        return {
          ...state,
          error: createNarrativeError('invalid_navigation', 
            `Story point with ID "${action.payload}" does not exist.`,
            { storyPointId: action.payload })
        };
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
        error: null // Clear any previous errors
      };
    }

    case ActionTypes.SELECT_CHOICE: { // Use ActionTypes
      if (!validateChoice(action.payload, state.availableChoices)) {
        return {
          ...state,
          error: createNarrativeError('invalid_choice',
            `Choice with ID "${action.payload}" is not available.`,
            { 
              choiceId: action.payload,
              availableChoices: state.availableChoices.map(c => c.id)
            })
        };
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
        error: null // Clear any previous errors
      };
    }

    // Handle ADD_NARRATIVE_HISTORY using the standardized action check
    case ActionTypes.ADD_NARRATIVE_HISTORY: {
      return {
        ...state,
        narrativeHistory: [...state.narrativeHistory, action.payload],
      };
    }

    case ActionTypes.SET_DISPLAY_MODE: { // Use ActionTypes
      return {
        ...state,
        displayMode: action.payload,
      };
    }

    // Delegate arc and branch actions to specialized handler
    case ActionTypes.START_NARRATIVE_ARC: // Use ActionTypes
    case ActionTypes.COMPLETE_NARRATIVE_ARC: // Use ActionTypes
      return handleArcActions(state, action);

    case ActionTypes.ACTIVATE_BRANCH: // Use ActionTypes
    case ActionTypes.COMPLETE_BRANCH: // Use ActionTypes
      return handleBranchActions(state, action);

    // Handle UPDATE_NARRATIVE_CONTEXT using the standardized action check
    case ActionTypes.SET_NARRATIVE_CONTEXT:
      return handleContextActions(state, action);

    case ActionTypes.RESET_NARRATIVE: { // Use ActionTypes constant
      return {
        ...initialNarrativeState,
        // Preserve lore when resetting narrative
        lore: state.lore || initialLoreState
      };
    }

    case ActionTypes.UPDATE_NARRATIVE: { // Use ActionTypes
      return {
        ...state,
        ...action.payload,
      };
    }

    // Handle error actions
    case ActionTypes.NARRATIVE_ERROR: { // Use ActionTypes
      return {
        ...state,
        error: action.payload
      };
    }

    case ActionTypes.CLEAR_ERROR: { // Use ActionTypes
      return {
        ...state,
        error: null
      };
    }

    // Decision-related action types delegated to specialized handlers
    case ActionTypes.PRESENT_DECISION: { // Use ActionTypes
      return handlePresentDecision(state, action);
    }

    case ActionTypes.RECORD_DECISION: { // Use ActionTypes
      return handleRecordDecision(state, action);
    }

    case ActionTypes.CLEAR_CURRENT_DECISION: { // Use ActionTypes
      return handleClearCurrentDecision(state);
    }
    
    case ActionTypes.PROCESS_DECISION_IMPACTS: { // Use ActionTypes
      return handleProcessDecisionImpacts(state, action);
    }

    case ActionTypes.UPDATE_IMPACT_STATE: { // Use ActionTypes
      return handleUpdateImpactState(state, action);
    }

    case ActionTypes.EVOLVE_IMPACTS: { // Use ActionTypes
      return handleEvolveImpacts(state);
    }

    default:
      return state;
  }
}

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
