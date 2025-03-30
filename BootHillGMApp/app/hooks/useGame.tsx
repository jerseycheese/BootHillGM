import { createContext, useContext, useReducer, ReactNode, useMemo, Dispatch } from 'react';
import { gameReducer } from '../reducers/index';
import { ExtendedGameState } from '../types/extendedState';
import { GameAction } from '../types/actions';
import { GameEngineAction } from '../types/gameActions';
import { initialState } from '../types/initialState';
import { adaptStateForTests, legacyGetters } from '../utils/stateAdapters';
import { createCompatibleDispatch } from '../types/gameActionsAdapter';
import { NarrativeContext } from '../types/narrative/context.types';
import { JournalEntry } from '../types/journal';

// Define interfaces for player, opponent, and other game entities
interface Character {
  id: string;
  name: string;
  attributes?: Record<string, number>;
  wounds?: Array<Record<string, unknown>>;
  inventory?: unknown[];
  isNPC?: boolean;
  isPlayer?: boolean;
  [key: string]: unknown;
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  description: string;
  category: string;
  [key: string]: unknown;
}


interface CombatTurn {
  playerId: string;
  actions: string[];
  [key: string]: unknown;
}

// Define a more flexible dispatch type
type FlexibleDispatch = (action: GameAction | GameEngineAction) => void;

export interface GameContextProps {
  // State and dispatch
  state: ExtendedGameState;
  dispatch: FlexibleDispatch;
  
  // Legacy properties for backward compatibility
  player: Character | null;
  opponent: Character | null;
  inventory: InventoryItem[];
  entries: JournalEntry[];
  isCombatActive: boolean;
  narrativeContext: NarrativeContext;
  combatRounds: number;
  currentTurn: CombatTurn | null;
}

// Create the context with default values
export const GameContext = createContext<GameContextProps | undefined>(undefined);

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
  initialState?: Partial<ExtendedGameState>
}): JSX.Element {
  // Set up reducer with initial state, merging custom state if provided
  const mergedInitialState = customInitialState 
    ? { ...initialState, ...customInitialState } as ExtendedGameState
    : initialState as ExtendedGameState;
    
  const [state, originalDispatch] = useReducer(gameReducer, mergedInitialState);
  
  // Create compatible dispatch that handles both action types
  const dispatch: FlexibleDispatch = createCompatibleDispatch(originalDispatch as Dispatch<GameAction>);
  
  // Apply adapters to state for backward compatibility
  const adaptedState = adaptStateForTests(state) as ExtendedGameState;
  
  // Create context value with both new state and legacy properties
  // Using useMemo to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    // New state management
    state: adaptedState,
    dispatch,
    
    // Legacy direct state access for backward compatibility
    player: legacyGetters.getPlayer(state) as Character | null,
    opponent: legacyGetters.getOpponent(state) as Character | null,
    inventory: legacyGetters.getItems(state) as InventoryItem[],
    entries: legacyGetters.getEntries(state) as JournalEntry[],
    isCombatActive: legacyGetters.isCombatActive(state),
    narrativeContext: legacyGetters.getNarrativeContext(state) as NarrativeContext,
    
    // Additional legacy properties
    combatRounds: state.combat?.rounds || 0,
    currentTurn: state.combat?.currentTurn as CombatTurn | null || null,
  }), [state, adaptedState, dispatch]); // Include dispatch in dependency array

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
