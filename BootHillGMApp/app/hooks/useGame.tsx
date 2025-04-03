/**
 * Compatibility Layer for useGame Hook
 * 
 * This module provides backward compatibility for components
 * that still use the useGame hook. It now forwards to the
 * consolidated GameStateProvider.
 */

import { createContext, ReactNode } from 'react';
import { GameState } from '../types/gameState';
import { GameAction } from '../types/actions';
import { initialState } from '../types/initialState';
import { useGameState, GameStateProvider } from '../context/GameStateProvider';

// Simplified context type - matches GameStateContext
export interface GameContextProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

// Create the context with default values
export const GameContext = createContext<GameContextProps>({
  state: initialState,
  dispatch: () => null,
});

/**
 * GameProvider component that now wraps GameStateProvider
 * This serves as a compatibility layer
 */
export function GameProvider({ 
  children,
  initialState: customInitialState
}: { 
  children: ReactNode,
  initialState?: Partial<GameState>
}): JSX.Element {
  return (
    <GameStateProvider initialState={customInitialState as GameState}>
      {children}
    </GameStateProvider>
  );
}

/**
 * Custom hook for accessing the game state and dispatch
 * Now forwards to useGameState
 */
export function useGame() {
  return useGameState();
}
