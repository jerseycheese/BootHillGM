import { useState, useCallback } from 'react';
import { InventoryItem } from '../types/item.types';
import { useCampaignState } from './useCampaignStateContext';
import { getAIResponse } from '../services/ai/gameService';
import { getJournalContext } from '../utils/JournalManager';
import { InventoryManager } from '../utils/inventoryManager';
import { getPlayerFromCharacter, getItemsFromInventory, getEntriesFromJournal } from './selectors/typeGuards';
import { createCompatibleState } from '../utils/gameStateUtils';
import { StateWithMixedStructure } from '../types/gameSession.types';
import { useLocation } from './useLocation';
import { JournalUpdatePayload } from '../types/gameActions';

/**
 * Hook for handling item interactions within the game session.
 * Manages item usage, validation, and related state updates.
 * 
 * @param updateNarrative - Function to update narrative text
 * @returns Object containing item-related state and functions
 */
export const useItemHandler = (
  updateNarrative: (text: string | { text: string; playerInput?: string; acquiredItems?: string[]; removedItems?: string[] }) => void
) => {
  const { state, dispatch } = useCampaignState();
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
      const isCombatActive = state.combat && 
        typeof state.combat === 'object' && 
        'isActive' in state.combat ? 
        !!state.combat.isActive : false;
      
      // Create a compatible state for the validateItemUse function
      const stateWithMixedStructure = state as unknown as StateWithMixedStructure;
      const compatibleState = createCompatibleState(stateWithMixedStructure, isCombatActive);
      
      const validationResult = InventoryManager.validateItemUse(
        item,
        playerCharacter || undefined,
        compatibleState
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
      
      const response = await getAIResponse(
        actionText,
        getJournalContext(journalEntries),
        inventoryItems
      );

      // Now dispatch the USE_ITEM action *after* getting the AI response
      dispatch({ type: 'USE_ITEM', payload: itemId });
      
      // Create a proper JournalUpdatePayload with required fields
      const journalPayload: JournalUpdatePayload = {
        id: `item-use-${Date.now()}`, // Generate a unique ID
        content: `Used ${item.name}`,
        timestamp: Date.now(),
        type: 'inventory',
        items: {
          acquired: [],
          removed: [item.name]
        }
      };
      
      dispatch({
        type: 'UPDATE_JOURNAL',
        payload: journalPayload
      });

      // Explicitly update the narrative with the item usage
      updateNarrative({
        text: response.narrative || `You use the ${item.name}.`,
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