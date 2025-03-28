/**
 * Game State Provider
 * 
 * Provides game state to the application with backward compatibility
 * for both new and legacy components.
 */

import React, { useReducer, createContext, useContext, ReactNode, useMemo, Dispatch } from 'react';
import rootReducer from '../reducers/rootReducer';
import { GameState, initialGameState } from '../types/gameState';
import { adaptStateForTests, legacyGetters } from '../utils/stateAdapters';
import { Character } from '../types/character';
import { JournalEntry } from '../types/journal';
import { NarrativeContext } from '../types/narrative.types';
import { InventoryItem } from '../types/item.types';
import { GameEngineAction } from '../types/gameActions';

// Import GameAction from the same path that rootReducer is importing from
import { GameAction } from '../types/actions';

/**
 * Interface for our context, uses Character instead of the CharacterState
 * to ensure compatibility with the legacy components
 */
interface GameStateContextType {
  state: GameState;
  dispatch: Dispatch<GameEngineAction>;
  // Legacy direct state access properties
  player: Character | null;
  opponent: Character | null;
  inventory: InventoryItem[];
  entries: JournalEntry[];
  isCombatActive: boolean;
  narrativeContext: NarrativeContext | null;
  combatRounds: number;
  currentTurn: string | null;
  // Other legacy properties as needed
}

// Create type-safe accessor functions to handle potential undefined properties
const safeGetRounds = (state: GameState): number => {
  return state.combat && typeof state.combat === 'object' && 'rounds' in state.combat 
    ? (state.combat.rounds as number) 
    : 0;
};

const safeGetCurrentTurn = (state: GameState): string | null => {
  return state.combat && typeof state.combat === 'object' && 'currentTurn' in state.combat 
    ? (state.combat.currentTurn as string | null) 
    : null;
};

// Create the context with default values
export const GameStateContext = createContext<GameStateContextType>({
  state: initialGameState,
  dispatch: () => null,
  // Legacy properties
  player: null,
  opponent: null,
  inventory: [],
  entries: [],
  isCombatActive: false,
  narrativeContext: null,
  combatRounds: 0,
  currentTurn: null,
});

interface GameStateProviderProps {
  children: ReactNode;
  initialGameState?: GameState;
}

/**
 * Game State Provider component
 * 
 * Provides state management for the application with both
 * new selectors pattern and legacy state access.
 */
export const GameStateProvider: React.FC<GameStateProviderProps> = ({ 
  children, 
  initialGameState: providedInitialState = initialGameState 
}) => {
  // Set up reducer with built-in adapter support
  const [state, originalDispatch] = useReducer(
    rootReducer as unknown as (state: GameState, action: GameAction) => GameState, 
    providedInitialState
  );
  
  // Create compatible dispatch that handles legacy actions
  // Use type assertion to resolve compatibility issues
  const wrappedDispatch = (action: GameEngineAction) => {
    // Cast GameEngineAction to GameAction to match what createCompatibleDispatch expects
    originalDispatch(action as unknown as GameAction);
  };
  
  // Create an adapted state with backward compatibility
  const adaptedState = adaptStateForTests(state);
  
  // Context value includes both new state and legacy properties
  // Using useMemo to prevent unnecessary re-renders
  const contextValue = useMemo(() => {
    // Create a properly typed context value
    const value: GameStateContextType = {
      // New state management
      state: adaptedState,
      dispatch: wrappedDispatch,
      
      // Legacy direct state access for backward compatibility
      player: legacyGetters.getPlayer(state),
      opponent: legacyGetters.getOpponent(state),
      inventory: legacyGetters.getItems(state),
      entries: legacyGetters.getEntries(state) as JournalEntry[],
      isCombatActive: legacyGetters.isCombatActive(state),
      narrativeContext: legacyGetters.getNarrativeContext(state),
      
      // Additional legacy properties
      combatRounds: safeGetRounds(state),
      currentTurn: safeGetCurrentTurn(state),
    };
    
    return value;
  }, [state, adaptedState]);
  
  return (
    <GameStateContext.Provider value={contextValue}>
      {children}
    </GameStateContext.Provider>
  );
};

/**
 * Custom hook to access game state
 * 
 * Provides access to both the new state structure and legacy properties
 */
export const useGameState = () => useContext(GameStateContext);

/**
 * Selector Hook Factory
 * 
 * Creates memoized selector hooks for efficient state access
 * 
 * @param selector Function to select specific state slice
 * @param deps Dependencies for memoization
 * @returns Custom hook that returns the selected state
 */
export function createSelector<T, K extends unknown[]>(
  selector: (state: GameState) => T,
  deps: (state: GameState) => K = () => [] as unknown as K
) {
  return function useSelector(): T {
    const { state, dispatch } = useGameState();
    
    // Use React's useMemo for memoization
    return useMemo(
      () => selector(state),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [state, ...deps(state), dispatch]
    );
  };
}

// Helper functions for safe property access
const safeGetContext = (state: GameState) => {
  return state.narrative && typeof state.narrative === 'object' && 'context' in state.narrative
    ? state.narrative.context 
    : null;
};

const safeGetActiveTab = (state: GameState) => {
  return state.ui && typeof state.ui === 'object' && 'activeTab' in state.ui
    ? state.ui.activeTab as string
    : 'character';
};

/**
 * Example selector hooks using the factory:
 */

// Character selectors
export const usePlayerCharacter = createSelector(
  state => state.character?.player,
  state => [state.character?.player]
);

export const useOpponentCharacter = createSelector(
  state => state.character?.opponent,
  state => [state.character?.opponent]
);

// Inventory selectors
export const useInventoryItems = createSelector(
  state => state.inventory?.items || [],
  state => [state.inventory?.items]
);

export const useItemById = (id: string) => {
  const { state } = useGameState();
  return useMemo(
    () => state.inventory?.items.find(item => item.id === id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.inventory?.items, id]
  );
};

// Combat selectors
export const useCombatActive = createSelector(
  state => state.combat?.isActive || false,
  state => [state.combat?.isActive]
);

// Journal selectors
export const useJournalEntries = createSelector(
  state => state.journal?.entries || [],
  state => [state.journal?.entries]
);

// Narrative selectors
export const useNarrativeContext = createSelector(
  safeGetContext,
  state => [safeGetContext(state)]
);

// UI selectors
export const useActiveTab = createSelector(
  safeGetActiveTab,
  state => [safeGetActiveTab(state)]
);