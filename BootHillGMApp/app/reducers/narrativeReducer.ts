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
} from '../types/narrative.types';
import { GameState } from '../types/gameState';

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
  switch (action.type) {
    case 'NAVIGATE_TO_POINT': {
      // Ensure we have story points available
      const storyPoints = state.narrativeContext?.storyPoints || {};

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

    case 'SELECT_CHOICE': {
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

    // Delegate arc and branch actions to specialized handler
    case 'START_NARRATIVE_ARC':
    case 'COMPLETE_NARRATIVE_ARC':
      return handleArcActions(state, action);

    case 'ACTIVATE_BRANCH':
    case 'COMPLETE_BRANCH':
      return handleBranchActions(state, action);

    case 'UPDATE_NARRATIVE_CONTEXT':
      return handleContextActions(state, action);

    case 'RESET_NARRATIVE': {
      return initialNarrativeState;
    }

    case 'UPDATE_NARRATIVE': {
      return {
        ...state,
        ...action.payload,
      };
    }

    // Handle error actions
    case 'NARRATIVE_ERROR': {
      return {
        ...state,
        error: action.payload
      };
    }

    case 'CLEAR_ERROR': {
      return {
        ...state,
        error: null
      };
    }

    // Decision-related action types delegated to specialized handlers
    case 'PRESENT_DECISION': {
      return handlePresentDecision(state, action);
    }

    case 'RECORD_DECISION': {
      return handleRecordDecision(state, action);
    }

    case 'CLEAR_CURRENT_DECISION': {
      return handleClearCurrentDecision(state);
    }
    
    case 'PROCESS_DECISION_IMPACTS': {
      return handleProcessDecisionImpacts(state, action);
    }

    case 'UPDATE_IMPACT_STATE': {
      return handleUpdateImpactState(state, action);
    }

    case 'EVOLVE_IMPACTS': {
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