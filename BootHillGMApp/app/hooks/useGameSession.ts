import { useState, useCallback } from 'react';
import { useCampaignState } from '../components/CampaignStateManager';
import { useLocation } from './useLocation';
import { getAIResponse } from '../services/ai/gameService';
import { getJournalContext, addJournalEntry } from '../utils/JournalManager';
import { useCombatManager } from './useCombatManager';
import { InventoryItem, ItemCategory } from '../types/item.types';

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
  const [isUsingItem, setIsUsingItem] = useState(false);
  const { updateLocation } = useLocation(); // Get updateLocation

  // Updates the game narrative with new text and any item changes
  const updateNarrative = useCallback(
    (textOrParams: string | UpdateNarrativeParams) => {
      let text: string;
      let playerInput: string | undefined;
      let acquiredItems: string[] | undefined;
      let removedItems: string[] | undefined;

      if (typeof textOrParams === 'string') {
        text = textOrParams;
      } else {
        text = textOrParams.text;
        playerInput = textOrParams.playerInput;
        acquiredItems = textOrParams.acquiredItems;
        removedItems = textOrParams.removedItems;
      }

      let updatedNarrative = '';
      if (state.narrative) {
        updatedNarrative = `${state.narrative}\n\nPlayer: ${playerInput}\n\nGame Master: ${text}`;
        if (acquiredItems && acquiredItems.length > 0) {
          updatedNarrative += `\nACQUIRED_ITEMS: ${acquiredItems.join(', ')}`;
        }
        if (removedItems && removedItems.length > 0) {
          updatedNarrative += `\nREMOVED_ITEMS: ${removedItems.join(', ')}`;
        }
      } else {
        updatedNarrative = `${text}\n\nPlayer: ${playerInput}`;
      }

      dispatch({ type: 'SET_NARRATIVE', payload: updatedNarrative });
    },
    [dispatch, state.narrative]
  );

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
    if (item) {
      try {
        setIsUsingItem(true);
        // First decrement the item quantity, then update narrative
        dispatch({ type: 'USE_ITEM', payload: itemId });

        // Then process the action through the AI system for narrative
        const response = await handleUserInput(`use ${item.name}`);

        // Add an explicit removed items notification for used items
        if (response) {
          updateNarrative({
            text: response.narrative,
            playerInput: `use ${item.name}`,
            removedItems: [item.name],
          });
        }
      } catch {
      } finally {
        setIsUsingItem(false);
      }
    }
  }, [dispatch, state.inventory, handleUserInput, updateNarrative]);

  return {
    state,
    dispatch,
    isLoading,
    error,
    handleUserInput,
    retryLastAction,
    handleUseItem,
    ...combatManager,
  };
};
