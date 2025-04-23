import { useState, useCallback, useEffect } from 'react';
import { useGameState } from '../context/GameStateProvider';
import { useLocation } from './useLocation';
import { getAIResponse } from '../services/ai/gameService';
import { getJournalContext } from '../utils/JournalManager';
import { useCombatManager } from './useCombatManager';
import { InventoryItem, ItemCategory } from '../types/item.types';
import { getItemsFromInventory, getEntriesFromJournal } from './selectors/typeGuards';
import { useNarrativeUpdater } from './useNarrativeUpdater';
import { useItemHandler } from './useItemHandler';
import { AIGameResponse } from '../types/gameSession.types';
import { JournalUpdatePayload } from '../types/gameActions';
import { v4 as uuidv4 } from 'uuid';
import { ActionTypes } from '../types/actionTypes';

// Define a type for the complex item structure that might come from AI
interface AIItemResponse {
  name: string | { name: string; category?: string };
  category?: string;
  [key: string]: unknown;
}

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
  const { state, dispatch } = useGameState(); // Use correct hook
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
   * Extract item name from potentially complex item structures
   */
  const extractItemName = (item: string | AIItemResponse): string => {
    if (typeof item === 'string') {
      return item;
    }
    
    if (typeof item.name === 'string') {
      return item.name;
    }
    
    if (typeof item.name === 'object' && item.name !== null && typeof item.name.name === 'string') {
      return item.name.name;
    }
    
    return 'Unknown Item';
  };

  /**
   * Extract item category from potentially complex item structures
   */
  const extractItemCategory = (item: string | AIItemResponse): ItemCategory => {
    const validCategories: ItemCategory[] = ['general', 'weapon', 'consumable', 'medical'];
    
    if (typeof item === 'string') {
      return 'general';
    }
    
    // Check for category in direct property
    if (typeof item.category === 'string' && validCategories.includes(item.category as ItemCategory)) {
      return item.category as ItemCategory;
    }
    
    // Check for category in nested name object
    if (typeof item.name === 'object' && item.name !== null && 
        typeof item.name.category === 'string' && 
        validCategories.includes(item.name.category as ItemCategory)) {
      return item.name.category as ItemCategory;
    }
    
    return 'general';
  };

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

      const response = await getAIResponse({
        prompt: input,
        journalContext: getJournalContext(journalEntries),
        inventory: inventoryItems
      });

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
        type: ActionTypes.UPDATE_JOURNAL,
        payload: journalEntry
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
          acquiredItems: response.acquiredItems ? 
                        response.acquiredItems.map(item => extractItemName(item as string | AIItemResponse)) : 
                        undefined,
          removedItems: response.removedItems
        });
        updateLocation(response.location);
      }

      // Handle acquired items with proper type checking
      if (response.acquiredItems?.length > 0) {
        response.acquiredItems.forEach((rawItem) => {
          const item = rawItem as string | AIItemResponse;
          const itemName = extractItemName(item);
          const itemCategory = extractItemCategory(item);
          
          const newItem: InventoryItem = {
            id: uuidv4(),
            name: itemName,
            description: `A ${itemName}`,
            quantity: 1,
            category: itemCategory,
          };
          
          dispatch({ type: ActionTypes.ADD_ITEM, payload: newItem });
        });
      }

      // Handle removed items
      if (!isUsingItem && response.removedItems?.length > 0) {
        response.removedItems.forEach((itemName: string) => {
          const itemToRemove = inventoryItems.find(
            (item: InventoryItem) => item.name === itemName
          );
          if (itemToRemove) {
            dispatch({ type: ActionTypes.REMOVE_ITEM, payload: itemToRemove.id });
          }
        });
      }

      // Handle suggested actions
      if (response.suggestedActions) {
        dispatch({
          type: ActionTypes.SET_SUGGESTED_ACTIONS,
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
    updateNarrative,  // Expose narrative updater for components
    ...combatManager
  };
};

/**
 * Empty mock object that's safe for production builds.
 * Implementation is replaced in test environment.
 */
export const __mocks = {
  handleUserInput: () => Promise.resolve({ /* Intentionally empty */ } as AIGameResponse),
  retryLastAction: () => Promise.resolve(null)
};