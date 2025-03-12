import { useState, useCallback } from 'react';
import { useCampaignState } from '../components/CampaignStateManager';
import { useLocation } from './useLocation';
import { getAIResponse } from '../services/ai/gameService';
import { getJournalContext, addJournalEntry } from '../utils/JournalManager';
import { useCombatManager } from './useCombatManager';
import { InventoryItem, ItemCategory } from '../types/item.types';
import { InventoryManager } from '../utils/inventoryManager';
import { addNarrativeHistory } from '../reducers/narrativeReducer';

// Mock getAIResponse in test environment
if (process.env.NODE_ENV === 'test') {
  jest.mock('../services/ai/gameService', () => {
    const originalModule = jest.requireActual('../services/ai/gameService');
    return {
      __esModule: true, // Use __esModule: true, because it is a module
      ...originalModule,
      getAIResponse: jest.fn().mockResolvedValue({ narrative: 'Mocked AI response.' }),
    };
  });
}

// Parameters for updating the narrative display
type UpdateNarrativeParams = {
  text: string;
  playerInput?: string;
  acquiredItems?: string[];
  removedItems?: string[];
};

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
  const [usingItems, setUsingItems] = useState<{ [itemId: string]: boolean }>({});
  const { updateLocation } = useLocation();

  const isUsingItem = useCallback((itemId: string) => {
      return !!usingItems[itemId];
  }, [usingItems]);

  // Updates the game narrative using the narrativeReducer
  const updateNarrative = useCallback(
    (textOrParams: string | UpdateNarrativeParams) => {
      let text: string;
      let playerInput: string | undefined;

      if (typeof textOrParams === 'string') {
        text = textOrParams;
      } else {
        text = textOrParams.text;
        playerInput = textOrParams.playerInput;
      }

      // Dispatch ADD_NARRATIVE_HISTORY action
      // Prefix player input with "Player:" to ensure it's identified as a player action
      const combinedText = playerInput ? `Player: ${playerInput}\n${text}` : text;
      dispatch(addNarrativeHistory(combinedText));

    }, [dispatch]);

    const combatManager = useCombatManager({
        onUpdateNarrative: updateNarrative
    });

  // Processes user input and updates game state accordingly
  const handleUserInput = useCallback(async (input: string) => {
    setIsLoading(true);
    setError(null);
    setLastAction(input);

    try {
      const currentJournal = state.journal || [];
      const currentInventory = state.inventory || [];

      const response = await getAIResponse(
        input,
        getJournalContext(currentJournal),
        currentInventory
      );

      // Update journal with the new action
      const updatedJournal = await addJournalEntry(currentJournal, input);

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

      if (!isUsingItem && response.removedItems?.length > 0) {
        response.removedItems.forEach((itemName: string) => {
          const itemToRemove = currentInventory.find(
            (item: InventoryItem) => item.name === itemName
          );
          if (itemToRemove) {
            dispatch({ type: 'REMOVE_ITEM', payload: itemToRemove.id });
          }
        });
      }

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
      // TODO: Implement more robust error handling, e.g., displaying a user-friendly message or providing a retry option.
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
    updateLocation, // Add updateLocation to dependency array
  ]);

    const retryLastAction = useCallback(() => {
        if (lastAction) {
            handleUserInput(lastAction);
        }
    }, [lastAction, handleUserInput]);

    // Handles using an item from the inventory
    // Updates both the inventory state and narrative display
    const handleUseItem = useCallback(async (itemId: string) => {
      const item = state.inventory?.find((i: InventoryItem) => i.id === itemId);
      if (!item) {
        setError(`Item not found in inventory: ${itemId}`);
        return;
      }

      // Validate item use *before* calling getAIResponse
      const validationResult = InventoryManager.validateItemUse(item, state.character || undefined, {
        ...state,
        narrative: state.narrative || '',
        isCombatActive: !!state.combatState
      });
      if (!validationResult.valid) {
        setError(validationResult.reason || `Cannot use ${item.name}`);
        return;
      }

      try {
        setUsingItems(prev => ({ ...prev, [itemId]: true }));
        setIsLoading(true);

        // Get the AI response for using this item
        const actionText = `use ${item.name}`;
        const response = await getAIResponse(
          actionText,
          getJournalContext(state.journal || []),
          state.inventory || []
        );

        // Now dispatch the USE_ITEM action *after* getting the AI response
        dispatch({ type: 'USE_ITEM', payload: itemId });

        // Update journal with the new action
        const updatedJournal = await addJournalEntry(state.journal || [], actionText);
        dispatch({
          type: 'UPDATE_JOURNAL',
          payload: updatedJournal,
        });

        // Explicitly update the narrative with the item usage
        // Note: playerInput is already prefixed with "Player:" in updateNarrative
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
        setError(`Failed to use ${item.name}. Please try again.`);

        // If there was an error, restore the item quantity (optional)
        // dispatch({ type: 'UPDATE_ITEM_QUANTITY', payload: { id: itemId, quantity: item.quantity + 1 } });
      } finally {
        setUsingItems(prev => ({ ...prev, [itemId]: false }));
        setIsLoading(false);
      }
    }, [
      state,
      dispatch,
      updateNarrative,
      updateLocation,
      setUsingItems,
    ]);

    return {
      state,
      dispatch,
      isLoading,
      error,
      handleUserInput,
      retryLastAction,
      handleUseItem,
      isUsingItem,
      ...combatManager
    };
};
