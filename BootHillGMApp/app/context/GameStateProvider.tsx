/**
 * Game State Provider
 * 
 * Provides game state to the application using a clean slice-based architecture.
 */

import React, { useReducer, createContext, useContext, ReactNode, useMemo, useCallback, Dispatch } from 'react';
import rootReducer from '../reducers/rootReducer';
import { GameState, initialGameState } from '../types/gameState';
import { GameAction } from '../types/actions';

/**
 * Interface for our context, simplified to only provide state and dispatch
 * without legacy compatibility properties
 */
interface GameStateContextType {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

// Create the context with default values
export const GameStateContext = createContext<GameStateContextType>({
  state: initialGameState,
  dispatch: () => null,
});

interface GameStateProviderProps {
  children: ReactNode;
  initialGameState?: GameState;
  initialState?: GameState; // Add this prop for tests
}

/**
 * Game State Provider component
 * 
 * Provides state management for the application with a clean slice-based
 * state model and dispatch function.
 */
export const GameStateProvider: React.FC<GameStateProviderProps> = ({ 
  children, 
  initialGameState: providedInitialState,
  initialState: testInitialState, // Add this prop
}) => {
  // Use testInitialState or providedInitialState or default initialGameState
  const finalInitialState = testInitialState || providedInitialState || initialGameState;
  
  // Set up reducer with the provided or default initial state
  const [state, dispatch] = useReducer(
    rootReducer, 
    finalInitialState
  );
  
  // Context value includes state and dispatch
  // Using useMemo to prevent unnecessary re-renders
  const contextValue = useMemo(() => {
    return { 
      state, 
      dispatch 
    };
  }, [state]);
  
  return (
    <GameStateContext.Provider value={contextValue}>
      {children}
    </GameStateContext.Provider>
  );
};

/**
 * Custom hook to access game state
 * 
 * Provides access to the state and dispatch function
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
    const { state } = useGameState();
    const additionalDeps = deps(state);
    
    // Memoize selector result with explicit dependencies
    const memoizedSelector = useCallback(
      () => selector(state),
      [state] // Explicit dependency on state
    );
    
    // Then apply any additional consumer-provided dependencies
    return useMemo(
      memoizedSelector,
      [memoizedSelector, ...additionalDeps] // Explicit array
    );
  };
}

// Example selector hooks using the factory:

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
  state => state.narrative?.narrativeContext || null,
  state => [state.narrative?.narrativeContext]
);

// Narrative context selector (for current narrative text)
export const useNarrativeContextString = createSelector(
  state => state.narrative?.context || '',
  state => [state.narrative?.context]
);

// UI selectors
export const useActiveTab = createSelector(
  state => state.ui?.activeTab || 'character',
  state => [state.ui?.activeTab]
);

// UI notification selectors
export const useNotifications = createSelector(
  state => state.ui?.notifications || [],
  state => [state.ui?.notifications]
);

export const useNotificationsByType = (type: string) => {
  const { state } = useGameState();
  return useMemo(
    () => (state.ui?.notifications || []).filter(notification => notification.type === type),
    [state.ui?.notifications, type]
  );
};

export const useLatestNotification = createSelector(
  state => {
    const notifications = state.ui?.notifications || [];
    if (notifications.length === 0) return undefined;
    
    // Sort by timestamp and return the most recent
    return [...notifications].sort((a, b) => b.timestamp - a.timestamp)[0];
  },
  state => [state.ui?.notifications]
);

// Add more selectors as needed for different state slices
