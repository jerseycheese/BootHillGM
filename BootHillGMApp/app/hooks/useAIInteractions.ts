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
 * Hook that manages AI interactions for the game session.
 * Processes user input, handles AI responses, and updates game state accordingly.
 */
export const useAIInteractions = (
  state: CampaignState,
  dispatch: React.Dispatch<GameAction>,
  onInventoryChange: (acquired: string[], removed: string[]) => void
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

      // Get AI response with all possible game state changes
      const {
        narrative: aiResponse,
        acquiredItems,
        removedItems,
        location,
        combatInitiated,
        opponent
      } = await getAIResponse(
        input,
        journalContext,
        state.inventory || []
      );

      // Remove metadata tags from AI response for clean narrative
      const cleanNarrative = aiResponse.split('\n')
        .filter(line =>
          !line.startsWith('ACQUIRED_ITEMS:') &&
          !line.startsWith('REMOVED_ITEMS:'))
        .join('\n')
        .trim();

      // Build and update game narrative with user input and AI response
      dispatch({
        type: 'SET_NARRATIVE',
        payload: `${state.narrative || ''}\n\nPlayer: ${input}\n\nGame Master: ${cleanNarrative}`
      });

      // Update player location if movement occurred
      if (location) {
        dispatch({ type: 'SET_LOCATION', payload: location });
      }

      // Initialize combat if the AI response triggered it
      if (combatInitiated && opponent) {
        dispatch({ type: 'SET_COMBAT_ACTIVE', payload: true });
        dispatch({ type: 'SET_OPPONENT', payload: opponent });
      }

      // Create and add new journal entry with narrative summary
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

      // Process inventory updates, removing duplicates and empty items
      const cleanedAcquiredItems = [...new Set(acquiredItems.filter(item => item && item.trim() !== ''))];
      const cleanedRemovedItems = [...new Set(removedItems.filter(item => item && item.trim() !== ''))];
      onInventoryChange(cleanedAcquiredItems, cleanedRemovedItems);

    } catch {
      dispatch({
        type: 'SET_NARRATIVE',
        payload: `${state.narrative || ''}\n\nAn error occurred. Please try again.`
      });
    } finally {
      setIsLoading(false);
    }
  }, [state, dispatch, onInventoryChange]);

  return {
    isLoading,
    handleUserInput
  };
};