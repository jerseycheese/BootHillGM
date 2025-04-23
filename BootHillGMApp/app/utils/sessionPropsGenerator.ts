/**
 * Session Props Generator
 * 
 * Generates props for the game session components by combining state, dispatch,
 * character data, and event handlers into a cohesive props object.
 * 
 * @module utils/sessionPropsGenerator
 */
import { Character } from '../types/character';
import { GameSessionProps } from '../components/GameArea/types';
import { InventoryManager } from '../utils/inventoryManager';
import { GameAction } from '../types/actions';
import { GameState, initialGameState } from '../types/gameState';
import { Dispatch } from 'react';
import { processUserInput } from './session/userInputHandler';
import { ActionTypes } from '../types/actionTypes';

/**
 * Generates session props for the game interface components
 * 
 * @param state - Current game state
 * @param dispatch - Dispatch function for state updates
 * @param playerCharacter - Current player character
 * @param isLoading - Loading state indicator
 * @returns Properly structured GameSessionProps object
 */
export function generateSessionProps(
  state: GameState | null | undefined,
  dispatch: Dispatch<GameAction> | null | undefined,
  playerCharacter: Character | null,
  isLoading: boolean
): GameSessionProps {
  // Derive opponent directly from state
  const opponent = state?.character?.opponent || null;

  // Create a properly typed dispatch function using only GameAction
  const safeDispatch: Dispatch<GameAction> = dispatch || (() => {});

  /**
   * Handles player strength/health changes
   */
  const handleStrengthChange = () => { // Removed unused parameters
    // Implementation would update character strength
  };

  /**
   * Handles item usage from inventory
   */
  const handleUseItem = () => {
    // Implementation would handle item usage
  };

  /**
   * Handles equipping weapons from inventory
   */
  const handleEquipWeapon = (itemId: string) => {
    if (!state || !dispatch || !playerCharacter) {
      return;
    }
    const item = state.inventory?.items.find((i) => i.id === itemId);
    if (!item || item.category !== 'weapon') {
      return;
    }
    
    InventoryManager.equipWeapon(playerCharacter, item);
    dispatch({ type: ActionTypes.EQUIP_WEAPON, payload: itemId });
  };

  // Store the last action to potentially implement retryLastAction
  let lastActionState = {
    input: null as string | null,
    actionType: undefined as string | undefined
  };

  /**
   * Processes user input, updates journal/narrative history, and retrieves AI response
   * 
   * @param input - Player action text to process
   * @param actionType - Optional action type for the input
   * @returns Promise resolving to null when complete
   */
  const handleUserInput = async (input: string, actionType?: string) => {
    if (!state || !dispatch) {
      return null;
    }

    // Store the action for potential retry
    lastActionState = { input, actionType };

    // Process the user input using the separated handler
    const result = await processUserInput(input, actionType, state, dispatch);
    
    // Update last action state with the result
    if (result.success) {
      lastActionState = { 
        input: result.lastInput, 
        actionType: result.lastActionType 
      };
    }

    return null;
  };

  /**
   * Retries the last user action if one exists
   * 
   * @returns Promise resolving to null when complete
   */
  const retryLastAction = async () => {
    if (lastActionState.input) {
      return handleUserInput(lastActionState.input, lastActionState.actionType);
    }
    return null;
  };

  // Default props structure for when state/dispatch are missing
  const defaultProps: GameSessionProps = {
    state: initialGameState,
    dispatch: safeDispatch,
    isLoading: isLoading,
    error: null,
    isCombatActive: false,
    opponent: null,
    handleUserInput: () => { /* Default no-op */ },
    retryLastAction: () => { /* Default no-op */ },
    handleCombatEnd: async () => {},
    handlePlayerHealthChange: () => {},
    handleUseItem,
    handleEquipWeapon,
    executeCombatRound: async () => { /* Default no-op */ },
    initiateCombat: () => { /* Default no-op */ },
    getCurrentOpponent: () => null,
    handleStrengthChange,
  };

  // If state or dispatch is unavailable, return default props
  if (!state || !dispatch) {
    return defaultProps;
  }

  // Construct final props using direct arguments and derived values
  return {
    // Core props from arguments/state
    state: state,
    dispatch: safeDispatch,
    isLoading: isLoading,
    error: null,

    // Derived/Calculated props
    isCombatActive: state.combat?.isActive ?? false,
    opponent,
    handleEquipWeapon,
    handleUseItem,
    handlePlayerHealthChange: () => {},

    // Provide implementations for functions
    handleUserInput: handleUserInput,
    retryLastAction: retryLastAction,
    handleCombatEnd: async () => {},
    executeCombatRound: async () => { /* Default no-op */ },
    initiateCombat: () => { /* Default no-op */ },
    getCurrentOpponent: () => opponent,
    handleStrengthChange,
  };
}