/**
 * Narrative Arc & Branch Reducer
 * 
 * This file contains reducer functions to handle narrative arc and branch management.
 */

import {
  NarrativeAction,
  NarrativeState,
} from '../../types/narrative.types';

// Import helper functions
import { DEFAULT_NARRATIVE_CONTEXT } from '../../utils/narrative/narrativeContextDefaults';

// Import error handling utilities
import { createNarrativeError } from './errorHandling';

/**
 * Handles arc-related actions (START_NARRATIVE_ARC, COMPLETE_NARRATIVE_ARC)
 * @param state - Current narrative state
 * @param action - The action to process
 * @returns Updated narrative state
 */
export function handleArcActions(
  state: NarrativeState,
  action: Extract<NarrativeAction, 
    { type: 'START_NARRATIVE_ARC' | 'COMPLETE_NARRATIVE_ARC' }>
): NarrativeState {
  const arcs = state.narrativeContext?.narrativeArcs || {};
  const arcId = action.payload;
  const arc = arcs[arcId];

  if (!arc) {
    return {
      ...state,
      error: createNarrativeError('arc_not_found',
        `Narrative arc with ID "${arcId}" does not exist.`,
        { arcId })
    };
  }

  if (action.type === 'START_NARRATIVE_ARC') {
    // Mark the arc as active
    const updatedArcs = {
      ...arcs,
      [arcId]: {
        ...arc,
        isActive: true,
      },
    };

    const startingBranchId = arc.startingBranch;
    const branches = state.narrativeContext?.narrativeBranches || {};

    // Always set currentArcId if arcId is present
    // Provide default values for required NarrativeContext properties
    const updatedNarrativeContext = {
      ...DEFAULT_NARRATIVE_CONTEXT,
      ...(state.narrativeContext || { characterFocus: [] }),
      characterFocus: state.narrativeContext?.characterFocus ?? [],
      themes: state.narrativeContext?.themes ?? [],
      importantEvents: state.narrativeContext?.importantEvents ?? [],
      narrativeArcs: updatedArcs,
      currentArcId: arcId,
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
  else { // COMPLETE_NARRATIVE_ARC
    // Mark the arc as completed
    const updatedArcs = {
      ...arcs,
      [arcId]: {
        ...arc,
        isCompleted: true,
      },
    };

    return {
      ...state,
      narrativeContext: {
        ...DEFAULT_NARRATIVE_CONTEXT,
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
}

/**
 * Handles branch-related actions (ACTIVATE_BRANCH, COMPLETE_BRANCH)
 * @param state - Current narrative state
 * @param action - The action to process
 * @returns Updated narrative state
 */
export function handleBranchActions(
  state: NarrativeState,
  action: Extract<NarrativeAction, 
    { type: 'ACTIVATE_BRANCH' | 'COMPLETE_BRANCH' }>
): NarrativeState {
  const branches = state.narrativeContext?.narrativeBranches || {};
  const branchId = action.payload;
  const branch = branches[branchId];

  if (!branch) {
    return {
      ...state,
      error: createNarrativeError('branch_not_found',
        `Narrative branch with ID "${branchId}" does not exist.`,
        { branchId })
    };
  }

  if (action.type === 'ACTIVATE_BRANCH') {
    // Mark the branch as active
    const updatedBranches = {
      ...branches,
      [branchId]: {
        ...branch,
        isActive: true,
      },
    };

    return {
      ...state,
      narrativeContext: {
        ...DEFAULT_NARRATIVE_CONTEXT,
        ...(state.narrativeContext || {}),
        narrativeBranches: updatedBranches,
        currentBranchId: branchId,
      },
      error: null // Clear any previous errors
    };
  } 
  else { // COMPLETE_BRANCH
    // Mark the branch as inactive (completed)
    const updatedBranches = {
      ...branches,
      [branchId]: {
        ...branch,
        isActive: false,
        isCompleted: true,
      },
    };

    return {
      ...state,
      narrativeContext: {
        ...DEFAULT_NARRATIVE_CONTEXT,
        ...(state.narrativeContext || {}),
        narrativeBranches: updatedBranches,
        characterFocus: state.narrativeContext?.characterFocus ?? [],
        themes: state.narrativeContext?.themes ?? [],
        importantEvents: state.narrativeContext?.importantEvents ?? []
      },
      error: null // Clear any previous errors
    };
  }
}

/**
 * Handles context-related actions (UPDATE_NARRATIVE_CONTEXT)
 * @param state - Current narrative state
 * @param action - The action to process
 * @returns Updated narrative state
 */
export function handleContextActions(
  state: NarrativeState,
  action: Extract<NarrativeAction, { type: 'UPDATE_NARRATIVE_CONTEXT' }>
): NarrativeState {
  const updatedContext = {
    ...state,
    narrativeContext: {
      ...DEFAULT_NARRATIVE_CONTEXT,
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