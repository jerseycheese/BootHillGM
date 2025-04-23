import React, { createContext, useContext, useReducer, ReactNode, Dispatch, useCallback } from 'react';
import { InventoryManager } from './inventoryManager';
import { initialGameState } from '../types/gameState';
import { ExtendedGameState } from '../types/extendedState';
import { GameAction } from '../types/actions';
import { gameReducer } from '../reducers/index';
import { InventoryItem } from '../types/item.types';
import { ActionTypes } from '../types/actionTypes';

// Create a context for the game state and dispatch function
export const GameContext = createContext<{
  state: ExtendedGameState;
  dispatch: Dispatch<GameAction>;
} | undefined>(undefined);

// Props interface for better typing
interface GameProviderProps {
  children: ReactNode;
  initialExtendedState?: ExtendedGameState;
}

// Provider component to wrap the app and provide game state and dispatch function
export const GameProvider: React.FC<GameProviderProps> = ({ 
  children, 
  initialExtendedState
}) => {
  // Create an initial state that satisfies the ExtendedGameState interface
  const defaultInitialState: ExtendedGameState = {
    ...initialGameState,
    opponent: null,
    // Add any other properties required by ExtendedGameState but not in GameState
  };
  
  const [state, dispatch] = useReducer<React.Reducer<ExtendedGameState, GameAction>>(
    // We need to cast the gameReducer to ensure type compatibility
    (state: ExtendedGameState, action: GameAction): ExtendedGameState => {
      // Call the original reducer, then ensure the result adheres to ExtendedGameState
      const newState = gameReducer(state, action);
      return {
        ...newState,
        // Maintain the opponent from the previous state since it doesn't exist in GameState
        opponent: state.opponent
      };
    },
    initialExtendedState || defaultInitialState
  );
  
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

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
    dispatch({ type: ActionTypes.SET_COMBAT_ACTIVE, payload: false });
    dispatch({ type: ActionTypes.UPDATE_NARRATIVE, payload: summary });
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
      type: ActionTypes.UPDATE_CHARACTER,
      payload: {
        id: state.character.player.id,
        attributes: updatedAttributes
      }
    });
  }, [state.character, dispatch]);

  // Handle item usage by dispatching USE_ITEM action
  const handleUseItem = useCallback((itemId: string) => {
    dispatch({ type: ActionTypes.USE_ITEM, payload: itemId });
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
    dispatch({ type: ActionTypes.EQUIP_WEAPON, payload: itemId });
  }, [state, dispatch]);

  // Handle weapon unequipping by clearing character's equipped weapon
  const handleUnequipWeapon = useCallback((itemId: string) => {
    if (!state.character || !state.character.player) {
      return;
    }
    
    InventoryManager.unequipWeapon();
    dispatch({ type: ActionTypes.UNEQUIP_WEAPON, payload: itemId });
  }, [state, dispatch]);

  // Retry the last action by dispatching it again
  const retryLastAction = useCallback((action: GameAction) => {
    dispatch(action);
  }, [dispatch]);

  return {
    state,
    dispatch,
    isLoading: false,
    error: null,
    isCombatActive: state.combat?.isActive || false,
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

// Default export for the GameProvider
export default GameProvider;
