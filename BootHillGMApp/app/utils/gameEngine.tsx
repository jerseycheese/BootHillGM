'use client';

   import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';

   // GameState defines the structure of our game's state
   interface GameState {
     currentPlayer: string;
     npcs: string[];
     location: string;
     inventory: string[];
     quests: string[];
   }

   // GameAction defines the types of actions that can modify our game state
   type GameAction =
     | { type: 'SET_PLAYER'; payload: string }
     | { type: 'ADD_NPC'; payload: string }
     | { type: 'SET_LOCATION'; payload: string }
     | { type: 'ADD_ITEM'; payload: string }
     | { type: 'ADD_QUEST'; payload: string };

   // Initial state of our game
   const initialState: GameState = {
     currentPlayer: '',
     npcs: [],
     location: '',
     inventory: [],
     quests: [],
   };

   // gameReducer handles state updates based on dispatched actions
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
       default:
         return state;
     }
   }

   // GameContext provides the game state and dispatch function to child components
   const GameContext = createContext<{
     state: GameState;
     dispatch: Dispatch<GameAction>;
   } | undefined>(undefined);

   // GameProvider wraps the app and provides the game state to all child components
   export function GameProvider({ children }: { children: ReactNode }) {
     const [state, dispatch] = useReducer(gameReducer, initialState);

     return (
       <GameContext.Provider value={{ state, dispatch }}>
         {children}
       </GameContext.Provider>
     );
   }

   // useGame is a custom hook that allows components to access the game state and dispatch function
   export function useGame() {
     const context = useContext(GameContext);
     if (context === undefined) {
       throw new Error('useGame must be used within a GameProvider');
     }
     return context;
   }