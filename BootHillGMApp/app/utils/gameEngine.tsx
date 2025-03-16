import React, { createContext, useContext, useReducer, ReactNode, Dispatch, useCallback } from 'react';
import { InventoryManager } from './inventoryManager';
import { GameState, initialGameState } from '../types/gameState';
import { GameEngineAction } from '../types/gameActions';
import { gameReducer } from '../reducers/index';

// Create a context for the game state and dispatch function
const GameContext = createContext<{
  state: GameState;
  dispatch: Dispatch<GameEngineAction>;
} | undefined>(undefined);

// Provider component to wrap the app and provide game state and dispatch function
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
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

// Custom hook to use game session with additional callbacks
export function useGameSession() {
  const { state, dispatch } = useGame();

  // Handle combat end by setting combat status and updating narrative
  const handleCombatEnd = useCallback((winner: 'player' | 'opponent', summary: string) => {
    dispatch({ type: 'SET_COMBAT_ACTIVE', payload: false });
    dispatch({ type: 'SET_NARRATIVE', payload: { text: summary } });
  }, [dispatch]);

  // Handle player health change by updating character attributes
  const handlePlayerHealthChange = useCallback((newStrength: number) => {
    if (!state.character) {
      return;
    }

    // Update only the strength attribute of the character
    const updatedAttributes = {
      ...state.character.attributes,
      strength: newStrength
    };

    dispatch({
      type: 'UPDATE_CHARACTER',
      payload: {
        attributes: updatedAttributes
      }
    });
  }, [state.character, dispatch]);

  // Handle item usage by dispatching USE_ITEM action
  const handleUseItem = useCallback((itemId: string) => {
    dispatch({ type: 'USE_ITEM', payload: itemId });
  }, [dispatch]);

  // Handle weapon equipping by updating character's equipped weapon
  const handleEquipWeapon = useCallback((itemId: string) => {
    if (!state.character) {
      return;
    }
    const item = state.inventory.find(i => i.id === itemId);
    if (!item || item.category !== 'weapon') {
      return;
    }
    InventoryManager.equipWeapon(state.character, item);
    dispatch({ type: 'EQUIP_WEAPON', payload: itemId });
  }, [state, dispatch]);

  // Handle weapon unequipping by clearing character's equipped weapon
  const handleUnequipWeapon = useCallback((itemId: string) => {
    if (!state.character) {
      return;
    }
    InventoryManager.unequipWeapon();
    dispatch({ type: 'UNEQUIP_WEAPON', payload: itemId });
  }, [state, dispatch]);

  // Retry the last action by dispatching it again
  const retryLastAction = useCallback((action: GameEngineAction) => {
    dispatch(action);
  }, [dispatch]);

  return {
    state,
    dispatch,
    isLoading: false,
    error: null,
    isCombatActive: state.isCombatActive,
    opponent: state.opponent,
    handleUserInput: () => {
      // Implementation here
    },
    retryLastAction,
    handleCombatEnd,
    handlePlayerHealthChange,
    handleUseItem,
    onEquipWeapon: handleEquipWeapon,
    onUnequipWeapon: handleUnequipWeapon
  };
}