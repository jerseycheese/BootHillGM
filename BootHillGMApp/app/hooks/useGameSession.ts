/**
 * Custom hook that manages the core game session logic.
 * Centralizes state management and game actions to keep the 
 * GameSession component focused on rendering.
 * Handles combat, inventory, and general game state updates.
 */

  // Handles adding/removing items from inventory with proper quantity management
  // Manages the end of combat, updates narrative and journal
  // Updates player health and ensures character state stays in sync
  // Handles manual save requests from the UI
  // Converts item usage into game actions through the AI system
  // Expose all necessary state and handlers for the game session
  import { useCallback, useState } from 'react';
  import { useCampaignState } from '../components/CampaignStateManager';
  import { useAIInteractions } from './useAIInteractions';
  import { Character } from '../types/character';
  
  export const useGameSession = () => {
    const { state, dispatch, saveGame } = useCampaignState();
    const [isCombatActive, setIsCombatActive] = useState(false);
    const [opponent, setOpponent] = useState<Character | null>(null);
  
    const handleInventoryChange = useCallback(async (acquiredItems: string[], removedItems: string[]) => {
      if (!dispatch) return;
      
      for (const itemName of removedItems) {
        const existingItem = state?.inventory?.find(item => item.name === itemName);
        if (existingItem) {
          if (existingItem.quantity > 1) {
            dispatch({
              type: 'UPDATE_ITEM_QUANTITY',
              payload: {
                id: existingItem.id,
                quantity: existingItem.quantity - 1
              }
            });
          } else {
            dispatch({ type: 'REMOVE_ITEM', payload: itemName });
          }
        }
      }
    }, [dispatch, state?.inventory]);
  
    const handleCombatEnd = useCallback((winner: 'player' | 'opponent', combatSummary: string) => {
      if (!state || !dispatch) return;
      setIsCombatActive(false);
      setOpponent(null);
      
      const endMessage = winner === 'player' 
        ? "You have emerged victorious from the combat!" 
        : "You have been defeated in combat.";
  
      dispatch({
        type: 'SET_NARRATIVE',
        payload: `${state.narrative || ''}\n\n${endMessage}\n\n${combatSummary}\n\nWhat would you like to do now?` 
      });
  
      dispatch({ 
        type: 'UPDATE_JOURNAL', 
        payload: {
          timestamp: Date.now(),
          content: `Combat: ${combatSummary}`
        }
      });
    }, [state, dispatch]);
  
    const handlePlayerHealthChange = useCallback((newHealth: number) => {
      if (!dispatch || !state?.character) return;
      dispatch({
        type: 'SET_CHARACTER',
        payload: { ...state.character, health: newHealth }
      });
    }, [dispatch, state?.character]);
  
    const handleManualSave = useCallback(() => {
      if (state) {
        saveGame(state);
      }
    }, [state, saveGame]);
  
    const { isLoading, error, handleUserInput, retryLastAction } = useAIInteractions(
      state,
      dispatch,
      handleInventoryChange
    );
  
    const handleUseItem = useCallback(async (itemName: string) => {
      if (!state?.character) {
        console.warn('No character in state, aborting item use');
        return;
      }
      const actionText = `use ${itemName}`;
      await handleUserInput(actionText);
    }, [state?.character, handleUserInput]);
  
    return {
      state,
      isLoading,
      error,
      isCombatActive,
      opponent,
      handleUserInput,
      retryLastAction,
      handleCombatEnd,
      handlePlayerHealthChange,
      handleManualSave,
      handleUseItem,
      setIsCombatActive,
      setOpponent
    };
  };
  