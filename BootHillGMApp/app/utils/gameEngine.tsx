import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import { Character } from '../types/character';

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  description: string;
}

interface GameState {
  currentPlayer: string;
  npcs: string[];
  location: string;
  inventory: InventoryItem[];
  quests: string[];
  character: Character | null;
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
  | { type: 'UPDATE_CHARACTER'; payload: Partial<Character> };

const initialState: GameState = {
  currentPlayer: '',
  npcs: [],
  location: '',
  inventory: [],
  quests: [],
  character: null,
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
      return { ...state, inventory: [...state.inventory, action.payload] };
    case 'ADD_QUEST':
      return { ...state, quests: [...state.quests, action.payload] };
    case 'SET_CHARACTER':
      return { ...state, character: action.payload };
    case 'UPDATE_CHARACTER':
      if (!state.character) {
        return state; // Don't update if there's no character
      }
      // Only update if there are actual changes
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
        return state; // No changes, return the current state
      }
      return {
        ...state,
        character: updatedCharacter
      };
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
        // Find the item in the inventory
        const itemToUse = state.inventory.find(item => item.id === action.payload);
        if (!itemToUse) {
          return state; // Item not found, return state unchanged
        }
        
        // Update inventory: decrease item quantity or remove if quantity becomes 0
        const updatedInventory = state.inventory.map(item => 
          item.id === action.payload
            ? { ...item, quantity: item.quantity - 1 }
            : item
        ).filter(item => item.quantity > 0); // Remove items with quantity 0
  
        // TODO: Add logic here to apply the item's effect (e.g., restore health for a health potion)
  
        return {
          ...state,
          inventory: updatedInventory,
          // TODO: Update other state properties based on the item's effect
        };
      default:
        return state;
  }
}

// Create a context to provide game state and dispatch function to child components
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