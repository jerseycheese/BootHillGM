import { useState, useCallback } from 'react';
import { InventoryItem } from '../types/item.types';
import { useGameState } from '../context/GameStateProvider';
import { getAIResponse } from '../services/ai/gameService';
import { getJournalContext } from '../utils/JournalManager';
import { InventoryManager } from '../utils/inventoryManager';
import { getPlayerFromCharacter, getItemsFromInventory, getEntriesFromJournal } from './selectors/typeGuards';
import { GameState } from '../types/gameState';
import { useLocation } from './useLocation';
import { generateNarrativeSummary } from '../utils/ai/narrativeSummary';
import { NarrativeJournalEntry } from '../types/journal';

// Response type for narrative updates
interface NarrativeUpdateParams {
  text: string;
  playerInput?: string;
  acquiredItems?: string[];
  removedItems?: string[];
}

/**
 * Hook for handling item interactions within the game session.
 * Manages item usage, validation, and related state updates.
 * 
 * @param updateNarrative - Function to update narrative text
 * @returns Object containing item-related state and functions
 */
export const useItemHandler = (
  updateNarrative: (text: string | NarrativeUpdateParams) => void
) => {
  const { state, dispatch } = useGameState();
  const { updateLocation } = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingItems, setUsingItems] = useState<{ [itemId: string]: boolean }>({});

  /**
   * Checks if a specific item is currently being used
   * 
   * @param itemId - The ID of the item to check
   * @returns Boolean indicating if the item is being used
   */
  const isUsingItem = useCallback((itemId: string) => {
    return !!usingItems[itemId];
  }, [usingItems]);

  /**
   * Handles using an item from the inventory
   * Updates both the inventory state and narrative display
   * 
   * @param itemId - The ID of the item to use
   * @returns Promise resolving to the AI response or undefined on error
   */
  const handleUseItem = useCallback(async (itemId: string) => {
    // Clear any previous errors first
    setError(null);
    
    try {
      const inventoryItems = getItemsFromInventory(state.inventory);
      const item = inventoryItems.find((i: InventoryItem) => i.id === itemId);
      
      if (!item) {
        // Test compatibility: For this specific test, we need to set the error
        // and not throw, to match the expect(result.current.error).toBe() expectation
        const errorMsg = `Item not found in inventory: ${itemId}`;
        setError(errorMsg);
        return;
      }

      // Validate item use *before* calling getAIResponse
      const playerCharacter = getPlayerFromCharacter(state.character);
      
      const validationResult = InventoryManager.validateItemUse(
        item,
        playerCharacter || undefined,
        state as GameState // Pass current GameState directly
      );
      
      if (!validationResult.valid) {
        // Test compatibility: For this specific test, we need to set the error
        // and not throw, to match the expect(result.current.error).toBe() expectation
        const errorMsg = validationResult.reason || `Cannot use ${item.name}`;
        setError(errorMsg);
        return;
      }

      setUsingItems(prev => ({ ...prev, [itemId]: true }));
      setIsLoading(true);

      // Get the AI response for using this item
      const actionText = `use ${item.name}`;
      const journalEntries = getEntriesFromJournal(state.journal);
      
      const response = await getAIResponse({
        prompt: actionText,
        journalContext: getJournalContext(journalEntries),
        inventory: inventoryItems
      });

      // Now dispatch the USE_ITEM action *after* getting the AI response
      dispatch({ type: 'inventory/USE_ITEM', payload: itemId }); // Use namespaced type
      
      // Generate narrative summary for the journal entry
      const narrativeText = response.narrative || `You use the ${item.name}.`;
      
      // Generate a narrative summary for the journal entry
      // Removed console log
      const narrativeSummary = await generateNarrativeSummary(actionText, narrativeText);
      // Removed console log
      
      // Create a properly typed journal entry
      const journalEntry: NarrativeJournalEntry = {
        id: `item-use-${Date.now()}`,
        title: `Used ${item.name}`, // Add title based on item name
        timestamp: Date.now(),
        content: narrativeText,
        type: 'narrative',
        narrativeSummary: narrativeSummary
      };
      
      // Removed console log
      
      // Use the standard journal/ADD_ENTRY action 
      dispatch({
        type: 'journal/ADD_ENTRY',
        payload: journalEntry
      });

      // Explicitly update the narrative with the item usage
      updateNarrative({
        text: narrativeText,
        playerInput: actionText,
        removedItems: response.removedItems && response.removedItems.length > 0 ? [item.name] : undefined
      });

      // Handle any location changes from the response
      if (response.location) {
        updateLocation(response.location);
      }

      // Handle suggested actions if any
      if (response.suggestedActions) {
        dispatch({
          type: 'SET_SUGGESTED_ACTIONS',
          payload: response.suggestedActions,
        });
      }

      return response;
    } catch (error) {
      console.error('Error in handleUseItem:', error);
      const errorMsg = `Failed to use item. Please try again.`;
      setError(errorMsg);
      
      // Create a fallback journal entry with a basic summary
      const fallbackEntry: NarrativeJournalEntry = {
        id: `item-use-fallback-${Date.now()}`,
        title: 'Item Use Attempt Failed', // Add title for fallback
        timestamp: Date.now(),
        content: `You attempted to use an item.`,
        type: 'narrative',
        narrativeSummary: `Attempted to use an item`
      };
      
      // Add fallback entry to journal
      dispatch({
        type: 'journal/ADD_ENTRY',
        payload: fallbackEntry
      });
    } finally {
      // Always reset the using item state
      setUsingItems(prev => {
        const result = { ...prev };
        if (itemId in result) {
          result[itemId] = false;
        }
        return result;
      });
      setIsLoading(false);
    }
  }, [
    state,
    dispatch,
    updateNarrative,
    updateLocation,
  ]);

  return {
    isUsingItem,
    handleUseItem,
    isLoading,
    error,
    setError
  };
};