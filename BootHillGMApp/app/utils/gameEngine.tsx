import React, { createContext, useContext, useReducer, ReactNode, Dispatch, useCallback } from 'react';
import { InventoryManager } from './inventoryManager';
import { initialGameState } from '../types/gameState';
import { ExtendedGameState } from '../types/extendedState';
import { GameEngineAction } from '../types/gameActions';
import { gameReducer } from '../reducers/index';
import { InventoryItem } from '../types/item.types';

// Create a context for the game state and dispatch function
const GameContext = createContext<{
  state: ExtendedGameState;
  dispatch: Dispatch<GameEngineAction>;
} | undefined>(undefined);

// Provider component to wrap the app and provide game state and dispatch function
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState as ExtendedGameState);
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
    if (!state.character || !state.character.player) {
      return;
    }

    // Update only the strength attribute of the player character
    const updatedAttributes = {
      ...state.character.player.attributes,
      strength: newStrength
    };

    dispatch({
      type: 'UPDATE_CHARACTER',
      payload: {
        id: state.character.player.id,
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
    if (!state.character || !state.character.player) {
      return;
    }
    
    // Find the item in the inventory items array
    const item = state.inventory?.items.find((i: InventoryItem) => i.id === itemId);
    if (!item || item.category !== 'weapon') {
      return;
    }
    
    InventoryManager.equipWeapon(state.character.player, item);
    dispatch({ type: 'EQUIP_WEAPON', payload: itemId });
  }, [state, dispatch]);

  // Handle weapon unequipping by clearing character's equipped weapon
  const handleUnequipWeapon = useCallback((itemId: string) => {
    if (!state.character || !state.character.player) {
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
    isCombatActive: state.combat?.isActive || false,
    opponent: state.character?.opponent || null,
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