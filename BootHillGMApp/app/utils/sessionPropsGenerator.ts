import { Character } from '../types/character';
import { GameSessionProps } from '../components/GameArea/types';
import { adaptHealthChangeHandler } from '../hooks/useCombatStateRestoration';
import { InventoryItem } from '../types/item.types';
import { InventoryManager } from '../utils/inventoryManager';
import { GameSessionType } from '../types/session/gameSession.types';
import { GameEngineAction } from '../types/gameActions';
import { Dispatch } from 'react';

/**
 * Generates session props for the game interface components
 * 
 * @param gameSession - Current game session object
 * @param playerCharacter - Extracted player character
 * @returns GameSessionProps object
 */
export function generateSessionProps(
  gameSession: GameSessionType | null | undefined, 
  playerCharacter: Character | null
): GameSessionProps {
  // Safe access to gameSession properties
  const state = gameSession?.state;
  const dispatch = gameSession?.dispatch;
  const getCurrentOpponent = gameSession?.getCurrentOpponent;
  
  // Get current opponent with safe fallback
  const opponent = getCurrentOpponent ? 
    (() => {
      try {
        return getCurrentOpponent();
      } catch (e) {
        console.error("Error getting opponent:", e);
        return null;
      }
    })() : null;
  
  // ID getters for health change handler
  const getPlayerId = () => playerCharacter?.id || 'player';
  const getOpponentId = () => opponent?.id || 'opponent';
  
  // Create adaptedHealthChangeHandler
  const adaptedHealthChangeHandler = gameSession?.handleStrengthChange ?
    adaptHealthChangeHandler(
      gameSession.handleStrengthChange, 
      getPlayerId(), 
      getOpponentId()
    ) : () => {};
    
  // Define action handlers
  const handleUseItem = () => {
    // Just a placeholder - implementation would go here
  };

  const handleEquipWeapon = (itemId: string) => {
    if (!state || !state.character || !dispatch || !playerCharacter) {
      return;
    }
    
    // Extract inventory items safely
    let inventoryItems: InventoryItem[] = [];
    if (state.inventory) {
      if ('items' in state.inventory && Array.isArray(state.inventory.items)) {
        inventoryItems = state.inventory.items;
      } else if (Array.isArray(state.inventory)) {
        inventoryItems = state.inventory;
      }
    }
      
    // Find the item with the matching ID
    const item = inventoryItems.find((i: InventoryItem) => i.id === itemId);
    
    if (!item || item.category !== 'weapon') {
      return;
    }
    
    InventoryManager.equipWeapon(playerCharacter, item);
    dispatch({ type: 'EQUIP_WEAPON', payload: itemId });
  };
  
  // Create a non-nullable dispatch function
  const safeDispatch: Dispatch<GameEngineAction> = dispatch || (() => {});
  
  // Always create default values for the session props
  const defaultProps: Omit<GameSessionProps, 'state'> & { state: null } = {
    handleEquipWeapon,
    handleUseItem,
    handlePlayerHealthChange: adaptedHealthChangeHandler,
    opponent,
    state: null,
    dispatch: safeDispatch,
    executeCombatRound: undefined,
    initiateCombat: undefined,
    getCurrentOpponent: undefined,
    handleUserInput: undefined,
    isLoading: false, // Ensure this is a boolean
    error: null,
    retryLastAction: undefined,
    isCombatActive: false,
    handleCombatEnd: () => {}
  };
  
  // If gameSession is unavailable, return default props
  if (!gameSession || !state) {
    return defaultProps as unknown as GameSessionProps;
  }
  
  // Ensure all required properties are non-undefined
  const isLoading = gameSession.isLoading ?? false; // Use nullish coalescing to ensure boolean
  
  // If gameSession is available, merge with real values
  return {
    ...gameSession,
    state: state,
    handleEquipWeapon,
    handleUseItem,
    handlePlayerHealthChange: adaptedHealthChangeHandler,
    opponent,
    isCombatActive: gameSession.isCombatActive ?? false, // Use nullish coalescing 
    handleCombatEnd: gameSession.handleCombatEnd || (() => {}),
    // Ensure dispatch is not undefined
    dispatch: safeDispatch,
    // Ensure isLoading is a boolean
    isLoading,
    // Ensure error is string | null, not undefined
    error: gameSession.error ?? null
  };
}
