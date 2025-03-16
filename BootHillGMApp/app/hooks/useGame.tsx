import { createContext, useContext, useReducer, ReactNode } from 'react';
import { gameReducer } from '../reducers/index';
import { GameState } from '../types/gameState';
import { GameEngineAction } from '../types/gameActions';
import { initialState } from '../types/initialState';

export interface GameContextProps {
  state: GameState;
  dispatch: React.Dispatch<GameEngineAction>;
}

export const GameContext = createContext<GameContextProps | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }): JSX.Element {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
