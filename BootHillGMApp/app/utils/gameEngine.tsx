import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import { Character } from '../types/character';
import { InventoryItem } from '../types/inventory';
import { JournalEntry } from '../types/journal';

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
  | { type: 'SET_STATE'; payload: Partial<GameState> };

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
};

// Reducer function to handle state updates based on dispatched actions
export function gameReducer(state: GameState, action: GameEngineAction): GameState {
  let newState: GameState;
  switch (action.type) {
    case 'SET_PLAYER':
      return { ...state, currentPlayer: action.payload };
    case 'ADD_NPC':
      return { ...state, npcs: [...state.npcs, action.payload] };
    case 'SET_LOCATION':
      return { ...state, location: action.payload };
    case 'ADD_ITEM': {
      // Check if the item already exists in the inventory
      const existingItem = state.inventory.find(item => item.id === action.payload.id);
      if (existingItem) {
        // If it exists, update the quantity
        newState = {
          ...state,
          inventory: state.inventory.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      } else {
        // If it's a new item, add it to the inventory
        newState = { ...state, inventory: [...state.inventory, action.payload] };
      }
      return newState;
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        inventory: state.inventory.filter(item => item.id !== action.payload)
      };
    case 'USE_ITEM':
      const itemToUse = state.inventory.find(item => item.id === action.payload);
      if (!itemToUse) {
        return state;
      }
      // Decrease the quantity of the used item
      const updatedItem = { ...itemToUse, quantity: itemToUse.quantity - 1 };
      const updatedInventory = state.inventory.map(item =>
        item.id === action.payload ? updatedItem : item // Access payload directly
      ).filter(item => item.quantity > 0);  // Remove items with quantity 0

      newState = {
        ...state,
        inventory: updatedInventory
      };
      return newState;
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
      console.log('SET_NARRATIVE in reducer:', {
        currentNarrative: state.narrative,
        newNarrative: action.payload
      });
      return { ...state, narrative: action.payload };
    case 'SET_GAME_PROGRESS':
      return { ...state, gameProgress: action.payload };
    case 'UPDATE_JOURNAL':
      // Handle both single entry and array of entries
      return { ...state, journal: Array.isArray(action.payload) ? action.payload : [...state.journal, action.payload] };
    case 'SET_COMBAT_ACTIVE':
      return { ...state, isCombatActive: action.payload };
    case 'SET_OPPONENT':
      return { ...state, opponent: action.payload };
    case 'UPDATE_ITEM_QUANTITY':
      return {
        ...state,
        inventory: state.inventory.map(item =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        )
      };
    case 'CLEAN_INVENTORY':
      newState = {
        ...state,
        inventory: state.inventory.filter(item => 
          item.id &&
          item.name && 
          item.quantity > 0 && 
          !item.name.startsWith('REMOVED_ITEMS:')
        ),
      };
      return newState;
    case 'SET_INVENTORY':
      newState = { ...state, inventory: action.payload };
      return newState;
    case 'SET_SAVED_TIMESTAMP':
      return { ...state, savedTimestamp: action.payload };
    case 'SET_STATE':
      return { ...state, ...action.payload };
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
