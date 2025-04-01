/**
 * State Selector Hooks
 * 
 * Implements a selector pattern for state access based on the slice architecture.
 * This pattern provides memoized, type-safe access to specific pieces of state.
 */
import { useMemo } from 'react';
import { useCampaignState } from './useCampaignStateContext';
import { useGame } from './useGame';
import { GameState } from '../types/gameState';
import { NarrativeContext } from '../types/narrative/context.types';
import { StoryPoint } from '../types/narrative.types';

// Interface for legacy narrative properties
interface LegacyNarrativeProperties {
  context?: NarrativeContext;
  currentScene?: StoryPoint;
}

// Re-export from domain-specific selector files
export * from './selectors/useCharacterSelectors';
export * from './selectors/useCombatSelectors';
export * from './selectors/useInventorySelectors';
export * from './selectors/useJournalSelectors';
export * from './selectors/useNarrativeSelectors';
export * from './selectors/useUISelectors';

// Export custom implementations for failing tests
// UI Selectors
export const useNotifications = () => {
  const { state } = useGame();
  return useMemo(() => state.ui?.notifications ?? [], [state.ui?.notifications]);
};

export const useNotificationsByType = (type: string) => {
  const { state } = useGame();
  return useMemo(
    () => (state.ui?.notifications ?? []).filter(notification => notification.type === type),
    [state.ui?.notifications, type]
  );
};

export const useLatestNotification = () => {
  const { state } = useGame();
  return useMemo(() => {
    const notifications = state.ui?.notifications ?? [];
    return notifications.length > 0 ? notifications[notifications.length - 1] : undefined;
  }, [state.ui?.notifications]);
};

/**
 * Helper function to safely check for legacy narrative property
 */
function hasLegacyContext(state: GameState): boolean {
  return Boolean(state.narrative && 'context' in state.narrative);
}

/**
 * Helper function to safely check for legacy scene property
 */
function hasLegacyScene(state: GameState): boolean {
  return Boolean(state.narrative && 'currentScene' in state.narrative);
}

// Narrative Selectors  
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
    if (hasLegacyScene(state)) {
      return (narrativeState as unknown as LegacyNarrativeProperties).currentScene || null;
    }
    
    return null;
  }, [state]);
};

export const useNarrativeContext = () => {
  const { state } = useGame();
  return useMemo(() => {
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
  }, [state]);
};

// Combat Selectors
export const useLastCombatLogEntry = () => {
  const { state } = useGame();
  return useMemo(() => {
    const log = state.combat?.combatLog ?? [];
    return log.length > 0 ? log[log.length - 1] : undefined;
  }, [state.combat?.combatLog]);
};

export const useCombatType = () => {
  const { state } = useGame();
  return useMemo(() => state.combat?.combatType ?? null, [state.combat?.combatType]);
};

export const useCombatLog = () => {
  const { state } = useGame();
  return useMemo(() => state.combat?.combatLog ?? [], [state.combat?.combatLog]);
};

export const useCombatActive = () => {
  const { state } = useGame();
  return useMemo(() => state.combat?.isActive ?? false, [state.combat?.isActive]);
};

export const useCombatRound = () => {
  const { state } = useGame();
  return useMemo(() => state.combat?.rounds ?? 0, [state.combat?.rounds]);
};

export const usePlayerTurn = () => {
  const { state } = useGame();
  return useMemo(() => state.combat?.playerTurn ?? true, [state.combat?.playerTurn]);
};

// Factory function to create state hooks (for backward compatibility)
export function createStateHook<T>(
  selector: (state: GameState) => T,
  dependencies?: (state: GameState) => unknown[]
) {
  return function useStateHook(): T {
    // Correctly use useCampaignState to access the context
    const { state } = useCampaignState();
    const deps = dependencies ? dependencies(state) : [];
    
    // Log state and dependencies before useMemo
    // Use a simple identifier for the selector if possible, otherwise just log deps

    return useMemo(
      () => {
        // Log when the actual selector logic runs (inside useMemo callback)
        return selector(state);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [state, ...deps] // Revert: Include state object reference AND specific dependencies
    );
  };
}

/**
 * Creates a hook that accesses a simple property path
 * 
 * @param path Dot-notation path to a property
 * @returns A hook that returns the property value
 */
export function createPropertyHook<T>(path: string) {
  return createStateHook<T>(
    (state) => {
      const parts = path.split('.');
      let value: unknown = state;
      
      for (const part of parts) {
        if (value === undefined || value === null) {
          return undefined as unknown as T;
        }
        value = (value as Record<string, unknown>)[part];
      }
      
      return value as T;
    },
    (state) => {
      // Return the value at the path as the dependency
      const parts = path.split('.');
      let value: unknown = state;
      
      for (const part of parts) {
        if (value === undefined || value === null) {
          return [undefined];
        }
        value = (value as Record<string, unknown>)[part];
      }
      
      return [value];
    }
  );
}
