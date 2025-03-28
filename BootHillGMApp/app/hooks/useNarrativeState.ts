/**
 * Narrative State Selector Hooks
 * 
 * This module provides selector hooks for accessing narrative state data.
 */

import { 
  NarrativeState, 
  NarrativeChoice, 
  StoryPoint,
  NarrativeContext,
  PlayerDecision,
  StoryProgressionState,
  NarrativeDisplayMode
} from '../types/narrative.types';
import { createSelectorHook, createSlicePropertySelector } from './createSelectorHook';

/**
 * Hook that returns the entire narrative state slice
 */
export const useNarrativeState = createSelectorHook<NarrativeState>(
  (state) => state.narrative
);

/**
 * Hook that returns the current story point
 */
export const useCurrentStoryPoint = createSlicePropertySelector<NarrativeState, StoryPoint | null>(
  'narrative',
  (narrativeState) => narrativeState.currentStoryPoint
);

/**
 * Hook that returns the visited story points
 */
export const useVisitedPoints = createSlicePropertySelector<NarrativeState, string[]>(
  'narrative',
  (narrativeState) => narrativeState.visitedPoints
);

/**
 * Hook that returns the available narrative choices
 */
export const useAvailableChoices = createSlicePropertySelector<NarrativeState, NarrativeChoice[]>(
  'narrative',
  (narrativeState) => narrativeState.availableChoices
);

/**
 * Hook that returns the narrative history
 */
export const useNarrativeHistory = createSlicePropertySelector<NarrativeState, string[]>(
  'narrative',
  (narrativeState) => narrativeState.narrativeHistory
);

/**
 * Hook that returns the narrative display mode
 */
export const useNarrativeDisplayMode = createSlicePropertySelector<NarrativeState, NarrativeDisplayMode>(
  'narrative',
  (narrativeState) => narrativeState.displayMode
);

/**
 * Hook that returns the narrative context
 */
export const useNarrativeContext = createSlicePropertySelector<NarrativeState, NarrativeContext | undefined>(
  'narrative',
  (narrativeState) => narrativeState.narrativeContext
);

/**
 * Hook that returns the current player decision
 */
export const useCurrentDecision = createSlicePropertySelector<NarrativeState, PlayerDecision | undefined>(
  'narrative',
  (narrativeState) => narrativeState.currentDecision
);

/**
 * Hook that returns the story progression state
 */
export const useStoryProgressionState = createSlicePropertySelector<NarrativeState, StoryProgressionState | undefined>(
  'narrative',
  (narrativeState) => narrativeState.storyProgression
);

/**
 * Hook that checks if a specific story point has been visited
 * @param pointId The ID of the story point to check
 */
export function useHasVisitedPoint(pointId: string) {
  return createSelectorHook<boolean>(
    (state) => state.narrative.visitedPoints.includes(pointId)
  );
}

/**
 * Hook that returns the latest entry in the narrative history
 */
export const useLatestNarrative = createSelectorHook<string | undefined>(
  (state) => {
    const history = state.narrative.narrativeHistory;
    return history.length > 0 ? history[history.length - 1] : undefined;
  }
);
