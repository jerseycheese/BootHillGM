import { useState, useCallback } from 'react';
import { useCampaignState } from '../components/CampaignStateManager';
import { getAIResponse } from '../utils/aiService';
import { getJournalContext } from '../utils/JournalManager';
import { useCombatManager } from './useCombatManager';
import { InventoryItem } from '../types/inventory';

/**
 * Hook to manage the core game session functionality.
 * Handles user interactions, narrative progression, inventory management,
 * and coordinates with the combat system.
 * 
 * Key features:
 * - Manages game state and narrative flow
 * - Processes user input and AI responses
 * - Handles inventory modifications
 * - Coordinates combat encounters
 * - Provides error handling and retry capabilities
 * - Manages manual save functionality
 * 
 * @returns Object containing game session state and handler functions
 */
export const useGameSession = () => {
  const { state, dispatch, saveGame } = useCampaignState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  /**
   * Updates the game narrative by appending player actions and AI responses.
   * Maintains a conversation-style format with clear distinction between
   * player actions and AI responses.
   * 
   * @param text - The AI response text to add
   * @param playerInput - The player's action that triggered this response
   */
  const updateNarrative = useCallback((text: string, playerInput?: string) => {
    console.log('Updating narrative:', {
      currentNarrative: state.narrative,
      newText: text,
      playerInput,
      lastAction: playerInput
    });
    
    let updatedNarrative = '';
    
    if (state.narrative) {
      // We have existing narrative, append to it
      updatedNarrative = `${state.narrative}\n\nPlayer: ${playerInput}\n\nGame Master: ${text}`;
    } else {
      // This is the first action after initial narrative
      updatedNarrative = `${text}\n\nPlayer: ${playerInput}`;
    }
    
    dispatch({
      type: 'SET_NARRATIVE',
      payload: updatedNarrative
    });
  }, [dispatch, state.narrative]);

  const combatManager = useCombatManager({
    onUpdateNarrative: updateNarrative
  });

  /**
   * Processes user input and manages game state updates based on AI responses.
   * Handles combat initiation, inventory changes, and location updates.
   * 
   * @param input - The user's input text to process
   */
  const handleUserInput = useCallback(async (input: string) => {
    console.log('Starting user input handling:', {
      input,
      currentState: {
        narrative: state.narrative,
        inventory: state.inventory,
        journal: state.journal,
        location: state.location
      }
    });

    setIsLoading(true);
    setError(null);
    setLastAction(input);

    try {
      const response = await getAIResponse(input, getJournalContext(state.journal || []), state.inventory || []);
      console.log('AI Response:', response);
      
      if (response.combatInitiated && response.opponent) {
        combatManager.initiateCombat(response.opponent);
      }

      updateNarrative(response.narrative, input);
      
      // Handle other response effects (inventory, location, etc.)
      if (response.location) {
        console.log('Updating location:', {
          currentLocation: state.location,
          newLocation: response.location
        });
        dispatch({ type: 'SET_LOCATION', payload: response.location });
      }
      
      // Handle inventory changes
      if (response.acquiredItems?.length > 0) {
        console.log('Adding items to inventory:', response.acquiredItems);
        response.acquiredItems.forEach(itemName => {
          const newItem: InventoryItem = {
            id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: itemName,
            description: itemName,
            quantity: 1
          };
          dispatch({ type: 'ADD_ITEM', payload: newItem });
        });
      }
      
      if (response.removedItems?.length > 0) {
        console.log('Removing items from inventory:', response.removedItems);
        response.removedItems.forEach(itemName => {
          const itemToRemove = state.inventory?.find(item => item.name === itemName);
          if (itemToRemove) {
            dispatch({ type: 'REMOVE_ITEM', payload: itemToRemove.id });
          }
        });
      }
    } catch (err) {
      console.error('Error in handleUserInput:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [state, combatManager.initiateCombat, dispatch, updateNarrative]);

  /**
   * Manually saves the current game state.
   * Useful for creating save points at significant moments.
   */
  const handleManualSave = useCallback(() => {
    if (state) {
      console.log('Manually saving game state:', state);
      saveGame(state);
    }
  }, [state, saveGame]);

  /**
   * Retries the last user action in case of errors or unexpected results.
   */
  const retryLastAction = useCallback(() => {
    if (lastAction) {
      console.log('Retrying last action:', lastAction);
      handleUserInput(lastAction);
    }
  }, [lastAction, handleUserInput]);

  /**
   * Processes the use of an inventory item.
   * Updates game state to reflect item usage.
   * 
   * @param itemId - The ID of the item to use
   */
  const handleUseItem = useCallback((itemId: string) => {
    const item = state.inventory?.find(i => i.id === itemId);
    if (item) {
      console.log('Using item:', item);
      dispatch({ type: 'USE_ITEM', payload: item.id });
    }
  }, [dispatch, state.inventory]);

  return {
    state,
    isLoading,
    error,
    handleUserInput,
    handleManualSave,
    retryLastAction,
    handleUseItem,
    ...combatManager
  };
};
