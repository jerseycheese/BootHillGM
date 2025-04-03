import { Character } from '../types/character';
import { GameSessionProps } from '../components/GameArea/types';
import { InventoryManager } from '../utils/inventoryManager';
import { GameAction } from '../types/actions'; // Base action type from provider
import { GameEngineAction } from '../types/gameActions'; // Expected action type by props
import { GameState, initialGameState } from '../types/gameState';
import { Dispatch } from 'react';
import { getAIResponse } from '../services/ai/gameService';
import { getJournalContext } from '../utils/JournalManager';
import { getItemsFromInventory, getEntriesFromJournal } from '../hooks/selectors/typeGuards';
import { JournalUpdatePayload } from '../types/gameActions';
import { InventoryItem, ItemCategory } from '../types/item.types';
import { CombatParticipant } from '../types/combat';

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

  // Create a non-nullable dispatch function, casting to the expected prop type
  const safeDispatch: Dispatch<GameEngineAction> = dispatch as Dispatch<GameEngineAction> || (() => {});

  // Define action handlers that depend on dispatch and state
  const handleUseItem = (itemId: string) => {
    console.warn('handleUseItem not implemented for item ID:', itemId);
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

  // Store the last action to potentially implement retryLastAction
  let lastActionInput: string | null = null;

  /**
   * Processes user input, updates journal/narrative history, and retrieves AI response
   * Creates a complete flow:
   * 1. Updates UI loading state
   * 2. Creates journal entry for player action
   * 3. Calls AI service for contextual response
   * 4. Updates narrative with AI response
   * 5. Processes any resulting game state changes (items, location, combat)
   * 
   * @param input - Player action text to process
   * @returns Promise resolving to null when complete
   */
  const handleUserInput = async (input: string) => {
    if (!state || !dispatch) {
      console.warn('Cannot handle user input: missing state or dispatch');
      return;
    }

    // Store the action for potential retry
    lastActionInput = input;

    // Mark as loading while processing - use correct action type
    dispatch({ type: 'ui/SET_LOADING', payload: true });

    try {
      // Use helper functions to extract the right data structure
      const journalEntries = getEntriesFromJournal(state.journal);
      const inventoryItems = getItemsFromInventory(state.inventory);

      // Create a properly structured JournalUpdatePayload object
      const journalEntry: JournalUpdatePayload = {
        id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        content: input,
        type: 'narrative',
        narrativeSummary: 'Player action'
      };

      // Update campaign state with new journal entry
      dispatch({
        type: 'UPDATE_JOURNAL',
        payload: journalEntry
      });

      // Add player input to narrative history
      dispatch({
        type: 'ADD_NARRATIVE_HISTORY',
        payload: `Player: ${input}`
      });

      try {
        // Get AI response
        const response = await getAIResponse({
          prompt: input,
          journalContext: getJournalContext(journalEntries),
          inventory: inventoryItems
        });

        // Add AI response to narrative history
        dispatch({
          type: 'ADD_NARRATIVE_HISTORY',
          payload: response.narrative
        });

        // Update suggested actions if available
        if (response.suggestedActions) {
          dispatch({
            type: 'SET_SUGGESTED_ACTIONS',
            payload: response.suggestedActions,
          });
        }

        // Handle acquired items
        if (response.acquiredItems?.length > 0) {
          response.acquiredItems.forEach((itemName) => {
            const newItem: InventoryItem = {
              id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: itemName,
              description: itemName,
              quantity: 1,
              category: 'general' as ItemCategory,
            };
            dispatch({ type: 'inventory/ADD_ITEM', payload: newItem });
          });
        }

        // Handle removed items
        if (response.removedItems?.length > 0) {
          response.removedItems.forEach((itemName: string) => {
            const itemToRemove = inventoryItems.find(
              (item: InventoryItem) => item.name === itemName
            );
            if (itemToRemove) {
              dispatch({ type: 'inventory/REMOVE_ITEM', payload: itemToRemove.id });
            }
          });
        }

        // Update location if provided
        if (response.location) {
          dispatch({ 
            type: 'SET_LOCATION', 
            payload: response.location 
          });
        }

        // Handle combat initiation if needed
        if (response.combatInitiated && response.opponent) {
          // Set combat as active
          dispatch({
            type: 'combat/SET_ACTIVE',
            payload: true
          });
          
          // Add opponent to participants
          const opponentParticipant = response.opponent as CombatParticipant;
          
          // Update combat state with participants and initial values
          dispatch({
            type: 'combat/UPDATE_STATE',
            payload: {
              isActive: true,
              rounds: 1,
              playerTurn: true,
              participants: [opponentParticipant]
            }
          });
        }

      } catch (error) {
        console.error('Error getting AI response:', error);
        
        // Fallback response if AI service fails
        dispatch({
          type: 'ADD_NARRATIVE_HISTORY',
          payload: `You ${input}, but something unexpected happens. (Error getting response from AI service)`
        });
      }

      return null;
    } catch (error) {
      console.error('Error in handleUserInput:', error);
      return null;
    } finally {
      // Mark as not loading once complete - use correct action type
      dispatch({ type: 'ui/SET_LOADING', payload: false });
    }
  };

  /**
   * Retries the last user action if one exists
   * Currently a placeholder that saves the last action for future implementation
   * 
   * @returns null for now, eventually will return Promise with AI response
   */
  const retryLastAction = () => {
    console.warn('retryLastAction not fully implemented, last action was:', lastActionInput);
    return null;
  };

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

    // Provide implementations for functions
    handleUserInput: handleUserInput,
    retryLastAction: retryLastAction,
    handleCombatEnd: () => {},
    executeCombatRound: async () => { console.warn('executeCombatRound not implemented'); },
    initiateCombat: () => { console.warn('initiateCombat not implemented'); },
    getCurrentOpponent: () => opponent,
  };
}