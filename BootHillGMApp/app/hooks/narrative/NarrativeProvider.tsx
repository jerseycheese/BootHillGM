/**
 * NarrativeProvider Component
 * 
 * Provides narrative context for components that need access to
 * narrative state via the useNarrativeContext hook.
 * 
 * This is a compatibility layer that uses the consolidated GameStateProvider
 * internally to ensure all components work with the new state management approach
 * while maintaining backward compatibility.
 * 
 * @example
 * // Wrap components that need narrative context
 * <NarrativeProvider>
 *   <NarrativeDisplay />
 * </NarrativeProvider>
 */

import React, { ReactNode, useContext, createContext } from 'react';
import { useGameState } from '../../context/GameStateProvider';
import { GameState } from '../../types/gameState';
import { GameAction } from '../../types/actions';
import { initialGameState } from '../../types/gameState';

/**
 * NarrativeContext Type
 * Compatible with both the old narrative state structure
 * and the new consolidated state structure
 */
export interface NarrativeContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

/**
 * Create the narrative context with default values directly in this file
 * to avoid circular dependencies
 */
export const NarrativeContext = createContext<NarrativeContextType>({
  state: initialGameState,
  dispatch: () => null,
});

interface NarrativeProviderProps {
  children: ReactNode;
}

/**
 * NarrativeProvider is now a compatibility layer that uses GameStateProvider
 * to ensure proper state consolidation while maintaining component compatibility
 */
export const NarrativeProvider: React.FC<NarrativeProviderProps> = ({ children }) => {
  // Get state and dispatch from the consolidated GameStateProvider
  const { state, dispatch } = useGameState();
  
  // Create a compatible context value that matches what components expect
  const narrativeContextValue = {
    state: {
      ...state,
      // We don't need to duplicate these fields as they're already in state.narrative
      // but we keep them for backward compatibility with components that expect them
      // at the root level
      currentDecision: state.narrative?.currentDecision,
      narrativeContext: state.narrative?.narrativeContext,
      narrativeHistory: state.narrative?.narrativeHistory || [],
      currentStoryPoint: state.narrative?.currentStoryPoint,
    },
    dispatch
  };
  
  return (
    <NarrativeContext.Provider value={narrativeContextValue}>
      {children}
    </NarrativeContext.Provider>
  );
};

/**
 * Hook for accessing the narrative context.
 * This provides compatibility for components that expect the old context structure.
 * 
 * @returns {NarrativeContextType} The narrative context with state and dispatch
 * @throws {Error} If used outside of a NarrativeProvider
 * 
 * @example
 * const { state, dispatch } = useNarrative();
 * const narrativeHistory = state.narrative?.narrativeHistory || [];
 */
export const useNarrative = (): NarrativeContextType => {
  const context = useContext(NarrativeContext);
  if (!context) {
    throw new Error('useNarrative must be used within a NarrativeProvider - check your component hierarchy');
  }
  return context;
};

export default NarrativeProvider;
