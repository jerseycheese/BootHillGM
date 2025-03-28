import { useState, useCallback, useEffect } from 'react';
import { useCampaignState } from '../components/CampaignStateManager';
import { useLocation } from './useLocation';
import { getAIResponse } from '../services/ai/gameService';
import { getJournalContext, addJournalEntry } from '../utils/JournalManager';
import { useCombatManager } from './useCombatManager';
import { InventoryItem, ItemCategory } from '../types/item.types';
import { getItemsFromInventory, getEntriesFromJournal } from './selectors/typeGuards';
import { useNarrativeUpdater } from './useNarrativeUpdater';
import { useItemHandler } from './useItemHandler';
import { AIGameResponse } from '../types/gameSession.types';

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
 *
 * @returns Object containing game session state and handler functions
 */
export const useGameSession = () => {
  const { state, dispatch } = useCampaignState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const { updateLocation } = useLocation();
  
  // Get the narrative updater function
  const updateNarrative = useNarrativeUpdater();
  
  // Set up combat manager
  const combatManager = useCombatManager({
    onUpdateNarrative: updateNarrative
  });
  
  // Get item handler functions
  const {
    handleUseItem,
    isUsingItem,
    isLoading: isItemLoading,
    error: itemError,
    setError: setItemError
  } = useItemHandler(updateNarrative);

  // Synchronize the error states between item handler and main hook
  useEffect(() => {
    if (itemError) {
      setError(itemError);
    }
  }, [itemError]);

  /**
   * Processes user input and updates game state accordingly
   * 
   * @param input - The text input from the user
   * @returns Promise resolving to the AI response
   */
  const handleUserInput = useCallback(async (input: string) => {
    setIsLoading(true);
    setError(null);
    setItemError(null); // Clear item errors too
    setLastAction(input);  // Store the last action

    try {
      // Use helper functions to extract the right data structure
      const journalEntries = getEntriesFromJournal(state.journal);
      const inventoryItems = getItemsFromInventory(state.inventory);

      const response = await getAIResponse(
        input,
        getJournalContext(journalEntries),
        inventoryItems
      );

      // Update journal with the new action
      const updatedJournal = await addJournalEntry(journalEntries, input);

      // Update campaign state with new journal
      dispatch({
        type: 'UPDATE_JOURNAL',
        payload: updatedJournal,
      });

      if (response.combatInitiated && response.opponent) {
        updateNarrative({
          text: 'Combat has been initiated.',
          playerInput: input,
        });
        combatManager.initiateCombat(response.opponent);
      } else {
        updateNarrative({
          text: response.narrative,
          playerInput: input,
          acquiredItems: response.acquiredItems,
          removedItems: response.removedItems
        });
        updateLocation(response.location);
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
          dispatch({ type: 'ADD_ITEM', payload: newItem });
        });
      }

      // Handle removed items
      if (!isUsingItem && response.removedItems?.length > 0) {
        response.removedItems.forEach((itemName: string) => {
          const itemToRemove = inventoryItems.find(
            (item: InventoryItem) => item.name === itemName
          );
          if (itemToRemove) {
            dispatch({ type: 'REMOVE_ITEM', payload: itemToRemove.id });
          }
        });
      }

      // Handle suggested actions
      if (response.suggestedActions) {
        dispatch({
          type: 'SET_SUGGESTED_ACTIONS',
          payload: response.suggestedActions,
        });
      }

      return response;
    } catch (error) {
      console.error('Error in handleUserInput:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [
    dispatch,
    state.inventory,
    state.journal,
    updateNarrative,
    isUsingItem,
    combatManager,
    updateLocation,
    setItemError
  ]);

  /**
   * Retries the last user action if one exists
   * 
   * @returns Promise resolving to the AI response or null if no last action
   */
  const retryLastAction = useCallback(async () => {
    if (lastAction) {
      return await handleUserInput(lastAction);
    }
    return null;
  }, [lastAction, handleUserInput]);

  return {
    state,
    dispatch,
    isLoading: isLoading || isItemLoading,
    error,
    handleUserInput,
    retryLastAction,
    handleUseItem,
    isUsingItem,
    ...combatManager
  };
};

/**
 * Empty mock object that's safe for production builds.
 * Implementation is replaced in test environment.
 */
export const __mocks = {
  handleUserInput: () => Promise.resolve({} as AIGameResponse),
  retryLastAction: () => Promise.resolve(null)
};