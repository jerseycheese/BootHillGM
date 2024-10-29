import { useState, useCallback } from 'react';
import { useCampaignState } from '../components/CampaignStateManager';
import { getAIResponse } from '../utils/aiService';
import { getJournalContext, addJournalEntry } from '../utils/JournalManager';
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
  // Flag to prevent double-processing of item removal when using items
  const [isUsingItem, setIsUsingItem] = useState(false);

  /**
   * Updates the game narrative by appending player actions and AI responses.
   * Maintains a conversation-style format with clear distinction between
   * player actions and AI responses.
   * 
   * @param text - The AI response text to add
   * @param playerInput - The player's action that triggered this response
   */
  const updateNarrative = useCallback((text: string, playerInput?: string) => {
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
    setIsLoading(true);
    setError(null);
    setLastAction(input);

    try {
      const response = await getAIResponse(input, getJournalContext(state.journal || []), state.inventory || []);
      
      // Update journal with the new action
      const updatedJournal = await addJournalEntry(
        state.journal || [],
        input,
        getJournalContext(state.journal || [])
      );
      
      // Update campaign state with new journal
      dispatch({
        type: 'UPDATE_JOURNAL',
        payload: updatedJournal
      });
      
      if (response.combatInitiated && response.opponent) {
        combatManager.initiateCombat(response.opponent);
      }

      updateNarrative(response.narrative, input);
      
      // Handle other response effects (inventory, location, etc.)
      if (response.location) {
        dispatch({ type: 'SET_LOCATION', payload: response.location });
      }
      
      // Handle inventory changes
      if (response.acquiredItems?.length > 0) {
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
      
      // Skip item removal if using an item through the Use button
      if (!isUsingItem && response.removedItems?.length > 0) {
        response.removedItems.forEach(itemName => {
          const itemToRemove = state.inventory?.find(item => item.name === itemName);
          if (itemToRemove) {
            dispatch({ type: 'REMOVE_ITEM', payload: itemToRemove.id });
          }
        });
      }

      // Update suggested actions
      if (response.suggestedActions) {
        dispatch({
          type: 'SET_SUGGESTED_ACTIONS',
          payload: response.suggestedActions
        });
      }

      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      throw err;
    } finally {
      setIsLoading(false);
      setIsUsingItem(false);
    }
  }, [state, dispatch, updateNarrative, isUsingItem, combatManager]);

  /**
   * Manually saves the current game state.
   * Useful for creating save points at significant moments.
   */
  const handleManualSave = useCallback(() => {
    if (state) {
      saveGame(state);
    }
  }, [state, saveGame]);

  /**
   * Retries the last user action in case of errors or unexpected results.
   */
  const retryLastAction = useCallback(() => {
    if (lastAction) {
      handleUserInput(lastAction);
    }
  }, [lastAction, handleUserInput]);

  /**
   * Processes the use of an inventory item.
   * Creates a "use [item]" action that gets processed through the AI system.
   * 
   * @param itemId - The ID of the item to use
   */
  const handleUseItem = useCallback(async (itemId: string) => {
    const item = state.inventory?.find(i => i.id === itemId);
    if (item) {
      try {
        setIsUsingItem(true);
        // First decrement the item quantity, then update narrative
        dispatch({ type: 'USE_ITEM', payload: itemId });
        
        // Then process the action through the AI system for narrative
        await handleUserInput(`use ${item.name}`);
      } catch (err) {
        // If AI processing fails, don't update inventory
        console.error('Failed to process item use:', err);
      }
    }
  }, [dispatch, state.inventory, handleUserInput]);

  return {
    state,
    dispatch, // Now exposing dispatch
    isLoading,
    error,
    handleUserInput,
    handleManualSave,
    retryLastAction,
    handleUseItem,
    ...combatManager
  };
};
