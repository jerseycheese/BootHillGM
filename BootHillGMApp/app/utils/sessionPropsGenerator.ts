import { Character } from '../types/character';
import { GameSessionProps } from '../components/GameArea/types';
import { InventoryManager } from '../utils/inventoryManager';
import { GameAction } from '../types/actions'; // Base action type from provider
import { GameEngineAction } from '../types/gameActions'; // Expected action type by props
import { GameState, initialGameState } from '../types/gameState';
import { Dispatch } from 'react';

/**
 * Generates session props for the game interface components
 *
 * @param state - Current game state object
 * @param dispatch - Dispatch function for game actions (from useGameState)
 * @param playerCharacter - Extracted player character
 * @param isLoading - Flag indicating if initialization is in progress
 * @returns GameSessionProps object
 */
export function generateSessionProps(
  state: GameState | null | undefined,
  dispatch: Dispatch<GameAction> | null | undefined, // Accept GameAction from provider
  playerCharacter: Character | null,
  isLoading: boolean
): GameSessionProps {

  // Derive opponent directly from state
  const opponent = state?.character?.opponent || null;

  // ID getters for health change handler - renamed with underscore prefix since unused
  const _getPlayerId = () => playerCharacter?.id || 'player';
  const _getOpponentId = () => opponent?.id || 'opponent';

  // Create adaptedHealthChangeHandler - Placeholder
  // TODO: Re-evaluate how handleStrengthChange is accessed/passed if needed
  const localAdaptedHealthChangeHandler = (characterType: string, newStrength: number) => {
      console.warn('adaptedHealthChangeHandler not fully implemented', { characterType, newStrength });
  };

  // Define action handlers that depend on dispatch and state
  const handleUseItem = (itemId: string) => {
    console.warn('handleUseItem not implemented', { itemId });
  };

  const handleEquipWeapon = (itemId: string) => {
    if (!state || !dispatch || !playerCharacter) {
      console.warn('Cannot equip weapon: missing state, dispatch, or character');
      return;
    }
    const item = state.inventory?.items.find((i) => i.id === itemId);
    if (!item || item.category !== 'weapon') {
      console.warn(`Cannot equip item ${itemId}: not a weapon or not found.`);
      return;
    }
    // Assuming InventoryManager might mutate, but dispatch should handle state update
    InventoryManager.equipWeapon(playerCharacter, item);
    // Dispatch the correct action type expected by inventoryReducer
    // Cast the specific action if needed, but dispatch function itself uses GameAction
    dispatch({ type: 'inventory/EQUIP_WEAPON', payload: itemId });
  };

  // Create a non-nullable dispatch function, casting to the expected prop type
  const safeDispatch: Dispatch<GameEngineAction> = dispatch as Dispatch<GameEngineAction> || (() => {});

  // Default props structure for when state/dispatch are missing
  // Ensure this matches GameSessionProps structure
  const defaultProps: GameSessionProps = {
    state: initialGameState, // Provide initial state instead of null
    dispatch: safeDispatch,
    isLoading: isLoading,
    error: null,
    isCombatActive: false,
    opponent: null,
    handleUserInput: () => { console.warn('handleUserInput not available in default props'); },
    retryLastAction: () => { console.warn('retryLastAction not available in default props'); },
    handleCombatEnd: () => {},
    handlePlayerHealthChange: localAdaptedHealthChangeHandler,
    handleUseItem,
    handleEquipWeapon,
    executeCombatRound: async () => { console.warn('executeCombatRound not available in default props'); },
    initiateCombat: () => { console.warn('initiateCombat not available in default props'); },
    getCurrentOpponent: () => null,
  };

  // If state or dispatch is unavailable, return default props
  if (!state || !dispatch) {
    return defaultProps;
  }

  // Construct final props using direct arguments and derived values
  return {
    // Core props from arguments/state
    state: state,
    dispatch: safeDispatch, // Use the casted dispatch
    isLoading: isLoading,
    error: null, // Assuming error is not part of GameState

    // Derived/Calculated props
    isCombatActive: state.combat?.isActive ?? false,
    opponent,
    handleEquipWeapon,
    handleUseItem,
    handlePlayerHealthChange: localAdaptedHealthChangeHandler,

    // Provide safe defaults for functions potentially missing from original structure
    handleUserInput: () => { console.warn('handleUserInput not implemented'); },
    retryLastAction: () => { console.warn('retryLastAction not implemented'); },
    handleCombatEnd: () => {},
    executeCombatRound: async () => { console.warn('executeCombatRound not implemented'); },
    initiateCombat: () => { console.warn('initiateCombat not implemented'); },
    getCurrentOpponent: () => opponent,
  };
}
