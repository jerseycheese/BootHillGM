import { createContext, useContext, useReducer, ReactNode, useMemo, Dispatch } from 'react';
import rootReducer from '../reducers/rootReducer'; // Correct reducer import
import { GameState } from '../types/gameState'; // Use GameState
import { GameAction } from '../types/actions';
// Removed GameEngineAction import
import { initialState } from '../types/initialState';
// Removed adapter imports: adaptStateForTests, legacyGetters, createCompatibleDispatch
// Removed unused type imports: NarrativeContext, JournalEntry, Character, InventoryItem
// Removed unused type import: CombatState
// Removed comments about local interfaces

// Define a more flexible dispatch type
// Removed FlexibleDispatch type
// Simplified context type
export interface GameContextProps {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

// Create the context with default values
// Updated default context value
export const GameContext = createContext<GameContextProps>({
  state: initialState,
  dispatch: () => null,
});

/**
 * GameProvider component that provides game state and dispatch to components
 * 
 * This serves as a context provider that wraps
 * the application with shared state.
 * 
 * @param children Child components
 * @param initialState Optional initial state for testing
 * @returns GameProvider component
 */
export function GameProvider({ 
  children,
  initialState: customInitialState
}: { 
  children: ReactNode,
  initialState?: Partial<GameState> // Use GameState
}): JSX.Element {
  // Set up reducer with initial state, merging custom state if provided
  const mergedInitialState = customInitialState
    ? { ...initialState, ...customInitialState } as GameState // Use GameState
    : initialState as GameState; // Use GameState
    
  const [state, dispatch] = useReducer(rootReducer, mergedInitialState); // Use rootReducer and standard dispatch
  
  // Remove adapter usage
  // const adaptedState = adaptStateForTests(state) as ExtendedGameState;
  
  // Create context value with both new state and legacy properties
  // Using useMemo to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    // Provide only state and dispatch
    state: state, // Use the direct state from useReducer
    dispatch,
  }), [state, dispatch]); // Update dependencies

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

/**
 * Custom hook for accessing the game state and dispatch
 * 
 * Provides a consistent way to access state from components.
 * 
 * @returns Game context with state and dispatch
 * @throws Error if used outside of a GameProvider
 */
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
