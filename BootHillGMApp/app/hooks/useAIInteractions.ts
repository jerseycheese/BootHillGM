import { useState, useCallback } from 'react';
import { getAIResponse } from '../services/ai';
import { generateNarrativeSummary } from '../utils/aiService';
import { getJournalContext } from '../utils/JournalManager';
import { CampaignState } from '../types/campaign';
import { GameAction } from '../types/campaign';

/** Return type for useAIInteractions hook */
interface UseAIInteractionsResult {
  isLoading: boolean;
  handleUserInput: (input: string) => Promise<void>;
}

/**
 * Processes user actions including inventory usage:
 * - Handles direct item usage through Use buttons
 * - Integrates with AI for narrative generation
 * - Manages state updates and persistence
 * - Coordinates inventory changes with narrative flow
 */
export const useAIInteractions = (
  state: CampaignState,
  dispatch: React.Dispatch<GameAction>,
  onInventoryChange: (acquired: string[], removed: string[]) => void,
  saveGame?: (state: CampaignState) => void  // Add this parameter
): UseAIInteractionsResult => {
  // Tracks when AI is processing a response
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Processes user input and updates game state based on AI response.
   * Handles narrative updates, combat initiation, inventory changes, and journal entries.
   */
  const handleUserInput = useCallback(async (input: string) => {
    setIsLoading(true);
    try {
      const journalContext = getJournalContext(state.journal || []);
      const response = await getAIResponse(input, journalContext, state.inventory || []);
  
      // Clean narrative
      const cleanNarrative = response.narrative.split('\n')
        .filter(line =>
          !line.startsWith('ACQUIRED_ITEMS:') &&
          !line.startsWith('REMOVED_ITEMS:'))
        .join('\n')
        .trim();
  
      // Update narrative first
      dispatch({
        type: 'SET_NARRATIVE',
        payload: `${state.narrative || ''}\n\nPlayer: ${input}\n\nGame Master: ${cleanNarrative}`
      });
  
      // Update location if needed
      if (response.location) {
        dispatch({ type: 'SET_LOCATION', payload: response.location });
      }
  
      // Handle combat initiation if needed
      if (response.combatInitiated && response.opponent) {
        dispatch({ type: 'SET_COMBAT_ACTIVE', payload: true });
        dispatch({ type: 'SET_OPPONENT', payload: response.opponent });
      }
  
      // Create and add journal entry
      const narrativeSummary = await generateNarrativeSummary(
        input,
        `${state.character?.name || 'You'} ${input}`
      );
  
      dispatch({
        type: 'UPDATE_JOURNAL',
        payload: {
          timestamp: Date.now(),
          content: input,
          narrativeSummary
        }
      });
  
      // Process inventory changes
      const cleanedAcquiredItems = [...new Set(response.acquiredItems.filter(item => item && item.trim() !== ''))];
      const cleanedRemovedItems = [...new Set(response.removedItems.filter(item => item && item.trim() !== ''))];
  
      if (cleanedAcquiredItems.length > 0 || cleanedRemovedItems.length > 0) {
        // Wait for inventory changes to be processed
        await onInventoryChange(cleanedAcquiredItems, cleanedRemovedItems);
  
        // Give React a chance to update state
        await new Promise(resolve => setTimeout(resolve, 100));
  
        // Get the current state after all updates
        if (saveGame) {
          // Get the latest state after all updates
          const updatedState: CampaignState = {
            ...state,
            inventory: state.inventory?.map(item => ({ ...item })) || []
          };
  
          saveGame(updatedState);
        }
      }
  
    } catch (error) {
      console.error('Error in handleUserInput:', error);
      dispatch({
        type: 'SET_NARRATIVE',
        payload: `${state.narrative || ''}\n\nAn error occurred. Please try again.`
      });
    } finally {
      setIsLoading(false);
    }
  }, [state, dispatch, onInventoryChange, saveGame]);

  return {
    isLoading,
    handleUserInput
  };
};