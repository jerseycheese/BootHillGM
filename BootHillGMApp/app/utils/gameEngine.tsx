import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import { Character } from '../types/character';
import { InventoryItem } from '../types/inventory';
import { JournalEntry } from '../types/journal';
import { SuggestedAction } from '../types/campaign';

// Define the structure of the game state
export interface GameState {
  currentPlayer: string;
  npcs: string[];
  location: string;
  inventory: InventoryItem[];
  quests: string[];
  character: Character | null;
  narrative: string;
  gameProgress: number;
  journal: JournalEntry[];
  isCombatActive: boolean;
  opponent: Character | null;
  savedTimestamp?: number;
  isClient?: boolean;
  suggestedActions: SuggestedAction[];
  combatState?: {
    playerHealth: number;
    opponentHealth: number;
    currentTurn: 'player' | 'opponent';
    combatLog: string[];
  };
}

// Define all possible actions that can be dispatched to update the game state
export type GameEngineAction =
  | { type: 'SET_PLAYER'; payload: string }
  | { type: 'ADD_NPC'; payload: string }
  | { type: 'SET_LOCATION'; payload: string }
  | { type: 'ADD_ITEM'; payload: InventoryItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'USE_ITEM'; payload: string }
  | { type: 'ADD_QUEST'; payload: string }
  | { type: 'SET_CHARACTER'; payload: Character | null }
  | { type: 'UPDATE_CHARACTER'; payload: Partial<Character> }
  | { type: 'SET_NARRATIVE'; payload: string }
  | { type: 'SET_GAME_PROGRESS'; payload: number }
  | { type: 'UPDATE_JOURNAL'; payload: JournalEntry | JournalEntry[] }
  | { type: 'SET_COMBAT_ACTIVE'; payload: boolean }
  | { type: 'SET_OPPONENT'; payload: Character | null }
  | { type: 'UPDATE_ITEM_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAN_INVENTORY' }
  | { type: 'SET_INVENTORY'; payload: InventoryItem[] }
  | { type: 'SET_SAVED_TIMESTAMP'; payload: number }
  | { type: 'SET_STATE'; payload: Partial<GameState> }
  | { type: 'SET_SUGGESTED_ACTIONS'; payload: SuggestedAction[] }
  | { type: 'UPDATE_COMBAT_STATE'; payload: {
      playerHealth: number;
      opponentHealth: number;
      currentTurn: 'player' | 'opponent';
      combatLog: string[];
    }};

// Initial state of the game
export const initialState: GameState = {
  currentPlayer: '',
  npcs: [],
  location: '',
  inventory: [],
  quests: [],
  character: null,
  narrative: '',
  gameProgress: 0,
  journal: [],
  isCombatActive: false,
  opponent: null,
  savedTimestamp: undefined,
  isClient: false,
  suggestedActions: [],
  combatState: undefined
};

// Reducer function to handle state updates based on dispatched actions
export function gameReducer(state: GameState, action: GameEngineAction): GameState {
  switch (action.type) {
    case 'SET_PLAYER':
      return { ...state, currentPlayer: action.payload };
    case 'ADD_NPC':
      return { ...state, npcs: [...state.npcs, action.payload] };
    case 'SET_LOCATION':
      return { ...state, location: action.payload };
    case 'ADD_ITEM': {
      const existingItem = state.inventory.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          inventory: state.inventory.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      } else {
        return { ...state, inventory: [...state.inventory, action.payload] };
      }
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        inventory: state.inventory.filter(item => item.id !== action.payload)
      };
    case 'USE_ITEM': {
      const updatedInventory = state.inventory.map(item => {
        if (item.id === action.payload) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      }).filter(item => item.quantity > 0);

      return {
        ...state,
        inventory: updatedInventory
      };
    }
    case 'ADD_QUEST':
      return { ...state, quests: [...state.quests, action.payload] };
    case 'SET_CHARACTER':
      return { ...state, character: action.payload };
    case 'UPDATE_CHARACTER':
      if (!state.character) {
        return state;
      }
      return {
        ...state,
        character: {
          ...state.character,
          ...action.payload,
          attributes: {
            ...state.character.attributes,
            ...(action.payload.attributes || {})
          },
          skills: {
            ...state.character.skills,
            ...(action.payload.skills || {})
          }
        }
      };
    case 'SET_NARRATIVE':
      return { ...state, narrative: action.payload };
    case 'SET_GAME_PROGRESS':
      return { ...state, gameProgress: action.payload };
    case 'UPDATE_JOURNAL':
      return { ...state, journal: Array.isArray(action.payload) ? action.payload : [...state.journal, action.payload] };
    
    // Combat-related state updates
    case 'SET_COMBAT_ACTIVE':
      return {
        ...state,
        isCombatActive: Boolean(action.payload),
        // Clear combat state only when combat is ending
        ...((!action.payload) && {
          opponent: null,
          combatState: undefined
        })
      };
    case 'SET_OPPONENT':
      return { ...state, opponent: action.payload };
    case 'UPDATE_COMBAT_STATE':
      if (!action.payload) return state;
      
      // Update combat state while ensuring type consistency
      return {
        ...state,
        isCombatActive: true, // Ensure combat flag is set when updating state
        combatState: {
          ...action.payload,
          playerHealth: Number(action.payload.playerHealth),
          opponentHealth: Number(action.payload.opponentHealth),
          currentTurn: action.payload.currentTurn,
          combatLog: [...(action.payload.combatLog || [])]
        },
        // Sync character and opponent health with combat state
        character: state.character ? {
          ...state.character,
          health: Number(action.payload.playerHealth)
        } : null,
        opponent: state.opponent ? {
          ...state.opponent,
          health: Number(action.payload.opponentHealth)
        } : null
      };
    
    // Inventory management
    case 'UPDATE_ITEM_QUANTITY':
      return {
        ...state,
        inventory: state.inventory.map(item =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        ).filter(item => item.quantity > 0)
      };
    case 'CLEAN_INVENTORY':
      return {
        ...state,
        inventory: state.inventory.filter(item => 
          item.id &&
          item.name && 
          item.quantity > 0 && 
          !item.name.startsWith('REMOVED_ITEMS:')
        ),
      };
    case 'SET_INVENTORY':
      return { ...state, inventory: action.payload };
    case 'SET_SAVED_TIMESTAMP':
      return { ...state, savedTimestamp: action.payload };
    
    // Full state restoration with proper type handling
    case 'SET_STATE':
      return {
        ...state,
        ...action.payload,
        // Ensure combat state is properly preserved with correct types
        isCombatActive: Boolean(action.payload.isCombatActive),
        opponent: action.payload.opponent ? {
          ...action.payload.opponent,
          health: Number(action.payload.opponent.health),
          attributes: { ...action.payload.opponent.attributes },
          skills: { ...action.payload.opponent.skills }
        } : null,
        combatState: action.payload.combatState ? {
          ...action.payload.combatState,
          playerHealth: Number(action.payload.combatState.playerHealth),
          opponentHealth: Number(action.payload.combatState.opponentHealth),
          currentTurn: action.payload.combatState.currentTurn,
          combatLog: [...action.payload.combatState.combatLog]
        } : undefined,
        isClient: true
      };
    case 'SET_SUGGESTED_ACTIONS':
      return { ...state, suggestedActions: action.payload };
    default:
      return state;
  }
}

// Create a context for the game state and dispatch function
const GameContext = createContext<{
  state: GameState;
  dispatch: Dispatch<GameEngineAction>;
} | undefined>(undefined);

// Provider component to wrap the app and provide game state and dispatch function
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

// Custom hook to use the game context
export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
