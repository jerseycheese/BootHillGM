import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import { Character } from '../types/character';
import { InventoryItem } from '../types/inventory';
import { JournalEntry } from '../types/journal';

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
}

type GameAction =
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
  | { type: 'UPDATE_JOURNAL'; payload: JournalEntry | JournalEntry[] };

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
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PLAYER':
      return { ...state, currentPlayer: action.payload };
    case 'ADD_NPC':
      return { ...state, npcs: [...state.npcs, action.payload] };
    case 'SET_LOCATION':
      return { ...state, location: action.payload };
    case 'ADD_ITEM':
      const existingItem = state.inventory.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          inventory: state.inventory.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }
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
      return { ...state, journal: Array.isArray(action.payload) ? action.payload : [...state.journal, action.payload] };
    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: Dispatch<GameAction>;
} | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}