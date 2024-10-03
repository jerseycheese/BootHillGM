// app/utils/gameEngine.tsx

import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';

// Define the structure of a character
interface Character {
  name: string;
  attributes: {
    strength: number;
    agility: number;
    intelligence: number;
  };
  skills: {
    shooting: number;
    riding: number;
    brawling: number;
  };
}

// Define the overall game state
interface GameState {
  currentPlayer: string;
  npcs: string[];
  location: string;
  inventory: string[];
  quests: string[];
  character: Character | null;
}

// Define all possible actions that can modify the game state
type GameAction =
  | { type: 'SET_PLAYER'; payload: string }
  | { type: 'ADD_NPC'; payload: string }
  | { type: 'SET_LOCATION'; payload: string }
  | { type: 'ADD_ITEM'; payload: string }
  | { type: 'ADD_QUEST'; payload: string }
  | { type: 'SET_CHARACTER'; payload: Character };

// Initial state of the game
const initialState: GameState = {
  currentPlayer: '',
  npcs: [],
  location: '',
  inventory: [],
  quests: [],
  character: null,
};

// Reducer function to handle state updates based on dispatched actions
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
    default:
      return state;
  }
}

// Create a context to provide game state and dispatch function to child components
const GameContext = createContext<{
  state: GameState;
  dispatch: Dispatch<GameAction>;
} | undefined>(undefined);

// GameProvider component to wrap the app and provide game state
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

// Custom hook to access game state and dispatch function in components
export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}