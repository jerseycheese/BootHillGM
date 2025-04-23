/**
 * Narrative-related state selector hooks
 * 
 * Contains selectors for accessing narrative state in a memoized way.
 */
import { StoryPoint, NarrativeChoice } from '../../types/narrative.types';
import { NarrativeDisplayMode } from '../../types/narrative/choice.types';
import { NarrativeContext } from '../../types/narrative/context.types';
import { NarrativeErrorInfo } from '../../types/narrative/error.types';
import { createStateHook } from '../createStateHook';
import { useGame } from '../useGame';
import { useMemo } from 'react';
import { GameState } from '../../types/gameState';

// Define a type for the legacy properties we need to check
interface LegacyNarrativeProperties {
  context?: NarrativeContext;
  currentScene?: StoryPoint;
}

/**
 * Returns the current story point
 */
export const useCurrentStoryPoint = createStateHook<StoryPoint | null, [StoryPoint | null | undefined]>(
  (state) => {
    // Check for both current property names and legacy names
    if (state.narrative?.currentStoryPoint) {
      return state.narrative.currentStoryPoint;
    }
    
    // Safe check for legacy property
    const narrativeState = state.narrative;
    if (narrativeState && 'currentScene' in narrativeState) {
      return (narrativeState as unknown as LegacyNarrativeProperties).currentScene || null;
    }
    
    return null;
  },
  (state) => [state.narrative?.currentStoryPoint]
);

// Alias for backward compatibility
export const useCurrentScene = () => {
  const { state } = useGame();
  return useMemo(() => {
    // For test compatibility, try both formats
    const narrativeState = state.narrative;
    if (!narrativeState) return null;
    
    // First try new property name
    if (narrativeState.currentStoryPoint) {
      return narrativeState.currentStoryPoint;
    }
    
    // Then try legacy property name for tests
    if (narrativeState && 'currentScene' in narrativeState) {
      return (narrativeState as unknown as LegacyNarrativeProperties).currentScene || null;
    }
    
    return null;
  }, [state.narrative]);
};

/**
 * Returns whether there is an active story point
 */
export const useHasActiveStoryPoint = createStateHook<boolean, [StoryPoint | null | undefined]>(
  (state) => {
    // Check both currentStoryPoint and legacy currentScene
    if (state.narrative?.currentStoryPoint) {
      return true;
    }
    
    // Safe check for legacy property
    const narrativeState = state.narrative;
    if (narrativeState && 'currentScene' in narrativeState) {
      return Boolean((narrativeState as unknown as LegacyNarrativeProperties).currentScene);
    }
    
    return false;
  },
  (state) => [state.narrative?.currentStoryPoint]
);

/**
 * Returns all visited story points
 */
export const useVisitedStoryPoints = createStateHook<string[], [string[] | undefined]>(
  (state) => state.narrative?.visitedPoints ?? [],
  (state) => [state.narrative?.visitedPoints]
);

/**
 * Returns whether a specific story point has been visited
 * 
 * @param pointId The ID of the story point to check
 */
export const useStoryPointVisited = (pointId: string) => createStateHook<boolean, [string[] | undefined]>(
  (state) => (state.narrative?.visitedPoints ?? []).includes(pointId),
  (state) => [state.narrative?.visitedPoints]
)();

/**
 * Returns all available narrative choices
 */
export const useAvailableChoices = createStateHook<NarrativeChoice[], [NarrativeChoice[] | undefined]>(
  (state) => state.narrative?.availableChoices ?? [],
  (state) => [state.narrative?.availableChoices]
);

/**
 * Returns whether there are any available choices
 */
export const useHasAvailableChoices = createStateHook<boolean, [NarrativeChoice[] | undefined]>(
  (state) => (state.narrative?.availableChoices?.length ?? 0) > 0,
  (state) => [state.narrative?.availableChoices]
);

/**
 * Returns the narrative history
 */
export const useNarrativeHistory = createStateHook<string[], [string[] | undefined]>(
  (state) => state.narrative?.narrativeHistory ?? [],
  (state) => [state.narrative?.narrativeHistory]
);

/**
 * Returns the current narrative display mode
 */
export const useNarrativeDisplayMode = createStateHook<NarrativeDisplayMode, [NarrativeDisplayMode | undefined]>(
  (state) => state.narrative?.displayMode ?? 'standard',
  (state) => [state.narrative?.displayMode]
);

/**
 * Returns any narrative error
 */
export const useNarrativeError = createStateHook<NarrativeErrorInfo | null, [NarrativeErrorInfo | null | undefined]>(
  (state) => state.narrative?.error ?? null,
  (state) => [state.narrative?.error]
);

/**
 * Returns the error message from the narrative error, if any
 */
export const useNarrativeErrorMessage = createStateHook<string | null, [NarrativeErrorInfo | null | undefined]>(
  (state) => state.narrative?.error?.message ?? null,
  (state) => [state.narrative?.error]
);

/**
 * Returns whether there is a narrative error
 */
export const useHasNarrativeError = createStateHook<boolean, [NarrativeErrorInfo | null | undefined]>(
  (state) => state.narrative?.error !== null,
  (state) => [state.narrative?.error]
);

/**
 * Helper function to safely check for legacy narrative property
 */
function hasLegacyContext(state: GameState): boolean {
  return Boolean(state.narrative && 'context' in state.narrative);
}

/**
 * Returns the narrative context
 */
export const useNarrativeContext = createStateHook<NarrativeContext | undefined, [NarrativeContext | undefined, boolean]>(
  (state) => {
    // For test compatibility, try both formats
    const narrativeState = state.narrative;
    if (!narrativeState) return undefined;
    
    // First try new property name
    if (narrativeState.narrativeContext) {
      return narrativeState.narrativeContext;
    }
    
    // Then try legacy property name for tests
    if (hasLegacyContext(state)) {
      return (narrativeState as unknown as LegacyNarrativeProperties).context;
    }
    
    return undefined;
  },
  (state) => [state.narrative?.narrativeContext, hasLegacyContext(state)]
);

/**
 * Returns the world context from narrative context
 */
export const useWorldContext = createStateHook<string, [string | undefined]>(
  (state) => {
    // Check both narrativeContext and legacy context
    if (state.narrative?.narrativeContext?.worldContext) {
      return state.narrative.narrativeContext.worldContext;
    }
    
    if (hasLegacyContext(state)) {
      const legacyContext = (state.narrative as unknown as LegacyNarrativeProperties).context;
      return legacyContext?.worldContext || '';
    }
    
    return '';
  },
  (state) => [state.narrative?.narrativeContext?.worldContext]
);

/**
 * Returns character focus from narrative context
 */
export const useCharacterFocus = createStateHook<string[], [string[] | undefined]>(
  (state) => {
    // Check both narrativeContext and legacy context
    if (state.narrative?.narrativeContext?.characterFocus) {
      return state.narrative.narrativeContext.characterFocus;
    }
    
    if (hasLegacyContext(state)) {
      const legacyContext = (state.narrative as unknown as LegacyNarrativeProperties).context;
      return legacyContext?.characterFocus || [];
    }
    
    return [];
  },
  (state) => [state.narrative?.narrativeContext?.characterFocus]
);

/**
 * Returns themes from narrative context
 */
export const useNarrativeThemes = createStateHook<string[], [string[] | undefined]>(
  (state) => {
    // Check both narrativeContext and legacy context
    if (state.narrative?.narrativeContext?.themes) {
      return state.narrative.narrativeContext.themes;
    }
    
    if (hasLegacyContext(state)) {
      const legacyContext = (state.narrative as unknown as LegacyNarrativeProperties).context;
      return legacyContext?.themes || [];
    }
    
    return [];
  },
  (state) => [state.narrative?.narrativeContext?.themes]
);

/**
 * Returns important events from narrative context
 */
export const useImportantEvents = createStateHook<string[], [string[] | undefined]>(
  (state) => {
    // Check both narrativeContext and legacy context
    if (state.narrative?.narrativeContext?.importantEvents) {
      return state.narrative.narrativeContext.importantEvents;
    }
    
    if (hasLegacyContext(state)) {
      const legacyContext = (state.narrative as unknown as LegacyNarrativeProperties).context;
      return legacyContext?.importantEvents || [];
    }
    
    return [];
  },
  (state) => [state.narrative?.narrativeContext?.importantEvents]
);

/**
 * Returns story arcs from narrative context
 */
export const useNarrativeArcs = createStateHook<Record<string, unknown>, [Record<string, unknown> | undefined]>(
  (state) => {
    // Check both narrativeContext and legacy context
    if (state.narrative?.narrativeContext?.narrativeArcs) {
      return state.narrative.narrativeContext.narrativeArcs;
    }
    
    if (hasLegacyContext(state)) {
      const legacyContext = (state.narrative as unknown as LegacyNarrativeProperties).context;
      return legacyContext?.narrativeArcs || { /* Intentionally empty */ };
    }
    
    return { /* Intentionally empty */ };
  },
  (state) => [state.narrative?.narrativeContext?.narrativeArcs]
);

/**
 * Returns pending narrative decisions
 */
export const usePendingDecisions = createStateHook<unknown[], [unknown[] | undefined]>(
  (state) => {
    // Check both narrativeContext and legacy context
    if (state.narrative?.narrativeContext?.pendingDecisions) {
      return state.narrative.narrativeContext.pendingDecisions;
    }
    
    if (hasLegacyContext(state)) {
      const legacyContext = (state.narrative as unknown as LegacyNarrativeProperties).context;
      return legacyContext?.pendingDecisions || [];
    }
    
    return [];
  },
  (state) => [state.narrative?.narrativeContext?.pendingDecisions]
);

/**
 * Returns narrative decision history
 */
export const useDecisionHistory = createStateHook<unknown[], [unknown[] | undefined]>(
  (state) => {
    // Check both narrativeContext and legacy context
    if (state.narrative?.narrativeContext?.decisionHistory) {
      return state.narrative.narrativeContext.decisionHistory;
    }
    
    if (hasLegacyContext(state)) {
      const legacyContext = (state.narrative as unknown as LegacyNarrativeProperties).context;
      return legacyContext?.decisionHistory || [];
    }
    
    return [];
  },
  (state) => [state.narrative?.narrativeContext?.decisionHistory]
);

/**
 * Returns whether there are pending decisions
 */
export const useHasPendingDecisions = createStateHook<boolean, [unknown[] | undefined]>(
  (state) => {
    // Check both narrativeContext and legacy context
    const pendingDecisions = state.narrative?.narrativeContext?.pendingDecisions || 
      (hasLegacyContext(state) ? 
        (state.narrative as unknown as LegacyNarrativeProperties).context?.pendingDecisions : 
        []
      );
    return (pendingDecisions?.length || 0) > 0;
  },
  (state) => [state.narrative?.narrativeContext?.pendingDecisions]
);
