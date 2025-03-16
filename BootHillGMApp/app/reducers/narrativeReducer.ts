/**
 * Narrative Reducer
 * 
 * This file contains the reducer function for handling narrative state updates.
 * It processes all narrative-related actions and ensures immutable state updates.
 */

import {
  NarrativeAction,
  NarrativeState,
  initialNarrativeState,
  // Commented out to avoid unused import error
  /* NarrativeErrorInfo */
} from '../types/narrative.types';
import { GameState } from '../types/gameState';

// Import helper functions
import {
  defaultNarrativeContext,
  validateStoryPoint,
  validateChoice,
  updateAvailableChoices
} from '../utils/narrativeHelpers';

// Import decision-specific reducer functions
import {
  handlePresentDecision,
  handleRecordDecision,
  handleClearCurrentDecision,
  handleProcessDecisionImpacts,
  handleUpdateImpactState,
  handleEvolveImpacts
} from './decisionReducer';

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
          error: {
            code: 'invalid_navigation',
            message: `Story point with ID "${action.payload}" does not exist.`,
            context: { storyPointId: action.payload },
            timestamp: Date.now()
          }
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
          error: {
            code: 'invalid_choice',
            message: `Choice with ID "${action.payload}" is not available.`,
            context: { 
              choiceId: action.payload,
              availableChoices: state.availableChoices.map(c => c.id)
            },
            timestamp: Date.now()
          }
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

    case 'START_NARRATIVE_ARC': {
      const arcs = state.narrativeContext?.narrativeArcs || {};
      const arc = arcs[action.payload];

      if (!arc) {
        return {
          ...state,
          error: {
            code: 'arc_not_found',
            message: `Narrative arc with ID "${action.payload}" does not exist.`,
            context: { arcId: action.payload },
            timestamp: Date.now()
          }
        };
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
      const updatedNarrativeContext = {
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
        error: null // Clear any previous errors
      };
    }

    case 'COMPLETE_NARRATIVE_ARC': {
      const arcs = state.narrativeContext?.narrativeArcs || {};
      const arc = arcs[action.payload];

      if (!arc) {
        return {
          ...state,
          error: {
            code: 'arc_not_found',
            message: `Narrative arc with ID "${action.payload}" does not exist.`,
            context: { arcId: action.payload },
            timestamp: Date.now()
          }
        };
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
        error: null // Clear any previous errors
      };
    }

    case 'ACTIVATE_BRANCH': {
      const branches = state.narrativeContext?.narrativeBranches || {};
      const branch = branches[action.payload];

      if (!branch) {
        return {
          ...state,
          error: {
            code: 'branch_not_found',
            message: `Narrative branch with ID "${action.payload}" does not exist.`,
            context: { branchId: action.payload },
            timestamp: Date.now()
          }
        };
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
        error: null // Clear any previous errors
      };
    }

    case 'COMPLETE_BRANCH': {
      const branches = state.narrativeContext?.narrativeBranches || {};
      const branch = branches[action.payload];

      if (!branch) {
        return {
          ...state,
          error: {
            code: 'branch_not_found',
            message: `Narrative branch with ID "${action.payload}" does not exist.`,
            context: { branchId: action.payload },
            timestamp: Date.now()
          }
        };
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
        error: null // Clear any previous errors
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
        error: null // Clear any previous errors
      };
      return updatedContext;
    }

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
