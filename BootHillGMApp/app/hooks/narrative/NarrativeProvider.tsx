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

import React, { ReactNode, useContext, createContext, useCallback } from 'react';
import { useGameState } from '../../context/GameStateProvider';
import { GameState } from '../../types/gameState';
import { GameAction } from '../../types/actions';
import { PlayerDecision, NarrativeChoice } from '../../types/narrative.types';
import { StoryPoint } from '../../types/narrative/story-point.types';
import { initialGameState } from '../../types/gameState';
import { useDecisionTriggering } from './useDecisionTriggering';

/**
 * DecisionTriggeringFunctions Type
 * Functions provided by the decision triggering hook
 */
export interface DecisionTriggeringFunctions {
  checkForDecisionTriggers: (narrativeText: string) => Promise<boolean>;
  triggerAIDecision: (context?: string) => Promise<boolean>;
  ensureFreshState: () => Promise<GameState['narrative']>;
  shouldSkipNarrativeResponse?: () => boolean;
}

/**
 * NarrativeContext Type
 * Compatible with both the old narrative state structure
 * and the new consolidated state structure
 */
export interface NarrativeContextType {
  state: GameState['narrative'] & {
    visitedPoints: string[];
    availableChoices: NarrativeChoice[] | string[];
    displayMode: string;
    context: string;
    currentDecision?: PlayerDecision;
    narrativeHistory: string[];
    currentStoryPoint: StoryPoint | null;
  };
  dispatch: React.Dispatch<GameAction>;
  decisionTriggeringFunctions?: DecisionTriggeringFunctions;
}

/**
 * Create the narrative context with default values directly in this file
 * to avoid circular dependencies
 */
export const NarrativeContext = createContext<NarrativeContextType>({
  state: {
    ...initialGameState.narrative,
    visitedPoints: [],
    availableChoices: [],
    displayMode: 'standard',
    context: '',
    narrativeHistory: [],
    currentStoryPoint: null,
  },
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
      ...state.narrative,
      visitedPoints: state.narrative?.visitedPoints || [],
      availableChoices: state.narrative?.availableChoices || [],
      displayMode: state.narrative?.displayMode || 'standard',
      context: JSON.stringify(state.narrative?.context || { decisionHistory: [] }),
      currentDecision: state.narrative?.currentDecision,
      narrativeHistory: state.narrative?.narrativeHistory || [],
      currentStoryPoint: state.narrative?.currentStoryPoint,
    },
    dispatch
  };
  
  // Get decision triggering functions
  const presentPlayerDecision = useCallback((decision: PlayerDecision) => {
    dispatch({
      type: 'PRESENT_DECISION',
      payload: decision
    });
  }, [dispatch]);
  
  const decisionTriggeringFunctions = useDecisionTriggering(
    narrativeContextValue, 
    presentPlayerDecision
  );
  
  // Add the functions to the context value
  const enhancedContext: NarrativeContextType = {
    ...narrativeContextValue,
    decisionTriggeringFunctions
  };
  
  return (
    <NarrativeContext.Provider value={enhancedContext}>
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