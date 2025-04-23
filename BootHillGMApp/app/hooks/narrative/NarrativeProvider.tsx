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
import { initialGameState, GameState } from '../../types/gameState';
import { GameAction } from '../../types/actions';
import { PlayerDecision, NarrativeChoice } from '../../types/narrative.types';
import { StoryPoint } from '../../types/narrative/story-point.types';
import { useDecisionTriggering } from './useDecisionTriggering';
import { ActionTypes } from '../../types/actionTypes';
// Import the NarrativeAction from narrative/actions.types instead of actions.ts
import { NarrativeAction } from '../../types/narrative/actions.types';

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
 * Common state shape for narrative context
 */
interface NarrativeContextState {
  visitedPoints: string[];
  availableChoices: NarrativeChoice[] | string[];
  displayMode: string;
  context: string;
  currentDecision?: PlayerDecision;
  narrativeHistory: string[];
  currentStoryPoint: StoryPoint | null;
}

/**
 * NarrativeContext Type - Used by components consuming this context
 */
export interface NarrativeContextType {
  state: GameState['narrative'] & NarrativeContextState;
  dispatch: React.Dispatch<NarrativeAction>; 
  decisionTriggeringFunctions?: DecisionTriggeringFunctions;
}

/**
 * The internal provider value type - What we actually store in the context
 */
export interface NarrativeContextValue {
  state: GameState['narrative'] & NarrativeContextState;
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
 * Create a type guard to filter actions to only allow NarrativeAction types
 * This creates a compatibility layer between the two action types
 */
export const narrativeDispatchWrapper = (dispatch: React.Dispatch<GameAction>): React.Dispatch<NarrativeAction> => {
  return ((action: NarrativeAction) => {
    // All valid NarrativeActions are also valid GameActions since they use the same ActionTypes
    dispatch(action as unknown as GameAction);
  }) as React.Dispatch<NarrativeAction>;
};

/**
 * NarrativeProvider is now a compatibility layer that uses GameStateProvider
 * to ensure proper state consolidation while maintaining component compatibility
 */
export const NarrativeProvider: React.FC<NarrativeProviderProps> = ({ children }) => {
  // Get state and dispatch from the consolidated GameStateProvider
  const { state, dispatch } = useGameState();
  
  // Create a wrapped dispatch that only accepts NarrativeActions
  const narrativeDispatch = narrativeDispatchWrapper(dispatch);
  
  // Create a compatible context value that matches what components expect
  const narrativeContextValue: NarrativeContextValue = {
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
    dispatch // Use the original GameAction dispatch internally
  };
  
  // Get decision triggering functions
  const presentPlayerDecision = useCallback((decision: PlayerDecision) => {
    dispatch({
      type: ActionTypes.PRESENT_DECISION,
      payload: decision
    });
  }, [dispatch]);
  
  // When passing to useDecisionTriggering, we need to wrap the narrative dispatch
  const narrativeContextForHook: NarrativeContextType = {
    ...narrativeContextValue,
    dispatch: narrativeDispatch
  };
  
  const decisionTriggeringFunctions = useDecisionTriggering(
    narrativeContextForHook,
    presentPlayerDecision
  );
  
  // Provide the context with the wrapped dispatch for components
  const contextValue: NarrativeContextType = {
    state: narrativeContextValue.state,
    dispatch: narrativeDispatch,
    decisionTriggeringFunctions
  };
  
  return (
    <NarrativeContext.Provider value={contextValue}>
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