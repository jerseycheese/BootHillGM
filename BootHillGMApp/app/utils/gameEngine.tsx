import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import { Character } from '../types/character';
import { InventoryItem } from '../types/inventory';
import { JournalEntry } from '../types/journal';

// Define the structure of the game state
interface GameState {
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
}

// Define all possible actions that can be dispatched to update the game state
type GameEngineAction =
  | { type: 'SET_PLAYER'; payload: string }
  | { type: 'ADD_NPC'; payload: string }
  | { type: 'SET_LOCATION'; payload: string }
  | { type: 'ADD_ITEM'; payload: InventoryItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'USE_ITEM'; payload: string }
  | { type: 'ADD_QUEST'; payload: string }
  | { type: 'SET_CHARACTER'; payload: Character }
  | { type: 'UPDATE_CHARACTER'; payload: Partial<Character> }
  | { type: 'SET_NARRATIVE'; payload: string }
  | { type: 'SET_GAME_PROGRESS'; payload: number }
  | { type: 'UPDATE_JOURNAL'; payload: JournalEntry | JournalEntry[] }
  | { type: 'SET_COMBAT_ACTIVE'; payload: boolean }
  | { type: 'SET_OPPONENT'; payload: Character | null };

// Initial state of the game
const initialState: GameState = {
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
};

// Reducer function to handle state updates based on dispatched actions
function gameReducer(state: GameState, action: GameEngineAction): GameState {
  switch (action.type) {
    case 'SET_PLAYER':
      return { ...state, currentPlayer: action.payload };
    case 'ADD_NPC':
      return { ...state, npcs: [...state.npcs, action.payload] };
    case 'SET_LOCATION':
      return { ...state, location: action.payload };
    case 'ADD_ITEM':
      // Check if the item already exists in the inventory
      const existingItem = state.inventory.find(item => item.id === action.payload.id);
      if (existingItem) {
        // If it exists, update the quantity
        return {
          ...state,
          inventory: state.inventory.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }
      // If it's a new item, add it to the inventory
      return { ...state, inventory: [...state.inventory, action.payload] };
    case 'REMOVE_ITEM':
      return {
        ...state,
        inventory: state.inventory.filter(item => item.id !== action.payload),
      };
    case 'USE_ITEM':
      const itemToUse = state.inventory.find(item => item.id === action.payload);
      if (!itemToUse) {
        return state;
      }
      // Decrease the quantity of the used item and remove it if quantity becomes 0
      const updatedInventory = state.inventory.map(item => 
        item.id === action.payload
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ).filter(item => item.quantity > 0);
      return {
        ...state,
        inventory: updatedInventory,
      };
    case 'ADD_QUEST':
      return { ...state, quests: [...state.quests, action.payload] };
    case 'SET_CHARACTER':
      return { ...state, character: action.payload };
    case 'UPDATE_CHARACTER':
      if (!state.character) {
        return state;
      }
      // Update character attributes and skills
      const updatedCharacter = {
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
      };
      // Only update if there are actual changes
      if (JSON.stringify(updatedCharacter) === JSON.stringify(state.character)) {
        return state;
      }
      return {
        ...state,
        character: updatedCharacter
      };
    case 'SET_NARRATIVE':
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