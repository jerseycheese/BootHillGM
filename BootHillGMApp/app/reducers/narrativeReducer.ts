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
} from '../types/narrative.types';
import { GameState } from '../types/gameState';

/**
 * Initial state for the narrative reducer.
 */
const initialState: Pick<GameState, 'narrative'> = {
  narrative: initialNarrativeState,
};

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
 * @param {string} choiceId - ID of the choice to validate.
 * @param {NarrativeChoice[]} availableChoices - Current available choices.
 * @returns {boolean} True if the choice is valid, false otherwise.
 */
const validateChoice = (
  choiceId: string,
  availableChoices: NarrativeChoice[]
): boolean => {
  return availableChoices.some((choice) => choice.id === choiceId);
};

/**
 * Updates the available choices based on the current story point.
 * @param {StoryPoint | null} storyPoint - Current story point.
 * @returns {NarrativeChoice[]} Array of available narrative choices.
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
 * @param {Partial<GameState>} state - The current game state.
 * @param {NarrativeAction} action - The action to be processed.
 * @returns {Partial<GameState>} The updated game state.
 */
export function narrativeReducer(
  state: Partial<GameState> = initialState,
  action: NarrativeAction
): Partial<GameState> {
  // Ensure narrative state exists
  const narrative = state.narrative || initialNarrativeState;

  switch (action.type) {
    case 'NAVIGATE_TO_POINT': {
      // Ensure we have story points available - this would come from a loaded narrative
      const storyPoints = narrative.narrativeContext?.storyPoints || {};

      if (!validateStoryPoint(action.payload, storyPoints)) {
        // TODO: Replace with a more robust error handling mechanism (e.g., dispatch an error action)
        console.error(`Invalid story point ID: ${action.payload}`);
        return state;
      }

      const newStoryPoint = storyPoints[action.payload];
      const updatedChoices = updateAvailableChoices(newStoryPoint);

      // Add current point to visited points if not already there
      const visitedPoints = narrative.visitedPoints.includes(action.payload)
        ? narrative.visitedPoints
        : [...narrative.visitedPoints, action.payload];

      return {
        ...state,
        narrative: {
          ...narrative,
          currentStoryPoint: newStoryPoint,
          availableChoices: updatedChoices,
          visitedPoints,
        },
      };
    }

    case 'SELECT_CHOICE': {
      if (!validateChoice(action.payload, narrative.availableChoices)) {
        // TODO: Replace with a more robust error handling mechanism (e.g., dispatch an error action)
        console.error(`Invalid choice ID: ${action.payload}`);
        return state;
      }

      const selectedChoice = narrative.availableChoices.find(
        (choice) => choice.id === action.payload
      );

      if (!selectedChoice) {
        return state;
      }

      // We don't navigate here, just record the choice.
      // The navigation will be handled by a separate NAVIGATE_TO_POINT action
      return {
        ...state,
        narrative: {
          ...narrative,
          selectedChoice: selectedChoice.id,
        },
      };
    }

    case 'ADD_NARRATIVE_HISTORY': {
      return {
        ...state,
        narrative: {
          ...narrative,
          narrativeHistory: [...narrative.narrativeHistory, action.payload],
        },
      };
    }

    case 'SET_DISPLAY_MODE': {
      return {
        ...state,
        narrative: {
          ...narrative,
          displayMode: action.payload,
        },
      };
    }

    case 'START_NARRATIVE_ARC': {
      const arcs = narrative.narrativeContext?.narrativeArcs || {};
      const arc = arcs[action.payload];

      if (!arc) {
        // TODO: Replace with a more robust error handling mechanism (e.g., dispatch an error action)
        console.error(`Invalid narrative arc ID: ${action.payload}`);
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
      const branches = narrative.narrativeContext?.narrativeBranches || {};

      // Always set currentBranchId if startingBranchId is present
      // Provide default values for required NarrativeContext properties
      const updatedNarrativeContext: NarrativeContext = {
        ...(narrative.narrativeContext || {
          characterFocus: [],
          themes: [],
          worldContext: '',
          importantEvents: [],
          playerChoices: [],
          storyPoints: {},
          narrativeArcs: {},
          narrativeBranches: {},
        }),
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
        narrative: {
          ...narrative,
          narrativeContext: updatedNarrativeContext,
        },
      };
    }

    case 'COMPLETE_NARRATIVE_ARC': {
      const arcs = narrative.narrativeContext?.narrativeArcs || {};
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
        narrative: {
          ...narrative,
          narrativeContext: {
            ...(narrative.narrativeContext || {}),
            narrativeArcs: updatedArcs,
          } as NarrativeContext,
        },
      };
    }

    case 'ACTIVATE_BRANCH': {
      const branches = narrative.narrativeContext?.narrativeBranches || {};
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
        narrative: {
          ...narrative,
          narrativeContext: {
            ...(narrative.narrativeContext || {}),
            narrativeBranches: updatedBranches,
            currentBranchId: action.payload,
          } as NarrativeContext,
        },
      };
    }

    case 'COMPLETE_BRANCH': {
      const branches = narrative.narrativeContext?.narrativeBranches || {};
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
        narrative: {
          ...narrative,
          narrativeContext: {
            ...(narrative.narrativeContext || {}),
            narrativeBranches: updatedBranches,
          } as NarrativeContext,
        },
      };
    }

    case 'UPDATE_NARRATIVE_CONTEXT': {
      return {
        ...state,
        narrative: {
          ...narrative,
          narrativeContext: {
            ...(narrative.narrativeContext || {}),
            ...action.payload,
          } as NarrativeContext,
        },
      };
    }

    case 'RESET_NARRATIVE': {
      return {
        ...state,
        narrative: initialNarrativeState,
      };
    }
    case 'UPDATE_NARRATIVE': {
      return {
       ...state,
        narrative: {
          ...narrative,
          ...action.payload,
        },
      };
    }

    default:
      return state;
  }
}

/**
 * Action creator for navigating to a specific story point.
 * @param {string} storyPointId - ID of the story point to navigate to.
 * @returns {NarrativeAction} Narrative action object.
 */
export const navigateToPoint = (storyPointId: string): NarrativeAction => ({
  type: 'NAVIGATE_TO_POINT',
  payload: storyPointId,
});

/**
 * Action creator for selecting a narrative choice.
 * @param {string} choiceId - ID of the choice to select.
 * @returns {NarrativeAction} Narrative action object.
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
