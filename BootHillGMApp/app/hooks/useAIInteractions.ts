import { useState, useCallback } from 'react';
import { getAIResponse } from '../services/ai';
import { generateNarrativeSummary } from '../utils/aiService';
import { getJournalContext } from '../utils/JournalManager';
import { GameState } from '../types/campaign';
import { GameEngineAction } from '../utils/gameEngine';

interface AIInteractionResult {
  isLoading: boolean;
  error: string | null;
  handleUserInput: (input: string) => Promise<void>;
  retryLastAction: () => Promise<void>;
}

/**
 * Processes user actions including inventory usage:
 * - Handles direct item usage through Use buttons
 * - Integrates with AI for narrative generation
 * - Manages state updates and persistence
 * - Coordinates inventory changes with narrative flow
 */
export const useAIInteractions = (
  state: GameState,
  dispatch: React.Dispatch<GameEngineAction>,
  onInventoryChange: (acquired: string[], removed: string[]) => void,
  saveGame?: (state: GameState) => void
): AIInteractionResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastInput, setLastInput] = useState<string | null>(null);

  const processAIResponse = useCallback(async (
    input: string,
    response: Awaited<ReturnType<typeof getAIResponse>>
  ) => {
    // Clean narrative (remove metadata)
    const cleanNarrative = response.narrative
      .split('\n')
      .filter(line => 
        !line.startsWith('ACQUIRED_ITEMS:') &&
        !line.startsWith('REMOVED_ITEMS:')
      )
      .join('\n')
      .trim();

    const updatedNarrative = `${state.narrative || ''}\n\nPlayer: ${input}\n\nGame Master: ${cleanNarrative}`;

    // Create a complete state update
    const stateUpdate = {
      ...state,
      narrative: updatedNarrative,
      location: response.location || state.location,
      savedTimestamp: Date.now()
    };

    dispatch({ type: 'SET_STATE', payload: stateUpdate });

    // Save the updated state immediately
    if (saveGame) {
      saveGame(stateUpdate);
    }

    // Handle combat if needed
    if (response.combatInitiated && response.opponent) {
      dispatch({ type: 'SET_COMBAT_ACTIVE', payload: true });
      dispatch({ type: 'SET_OPPONENT', payload: response.opponent });
    }

    // Create journal entry with narrative summary
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
    const cleanedAcquiredItems = [...new Set(
      response.acquiredItems.filter(item => item && item.trim() !== '')
    )];
    const cleanedRemovedItems = [...new Set(
      response.removedItems.filter(item => item && item.trim() !== '')
    )];

    if (cleanedAcquiredItems.length > 0 || cleanedRemovedItems.length > 0) {
      await onInventoryChange(cleanedAcquiredItems, cleanedRemovedItems);
    }

  }, [state, dispatch, onInventoryChange, saveGame]);

  const handleUserInput = useCallback(async (input: string) => {
    setIsLoading(true);
    setError(null);
    setLastInput(input);

    try {
      const journalContext = getJournalContext(state.journal || []);
      const response = await getAIResponse(input, journalContext, state.inventory || []);
      await processAIResponse(input, response);

      // Double-check state was saved
      if (saveGame) {
        const currentState = JSON.parse(localStorage.getItem('campaignState') || '{}');
      }

    } catch (err) {
      console.error('Error in handleUserInput:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      dispatch({
        type: 'SET_NARRATIVE',
        payload: `${state.narrative || ''}\n\nAn error occurred. Please try again or retry your last action.`
      });
    } finally {
      setIsLoading(false);
    }
  }, [state, dispatch, processAIResponse, saveGame]);

  return {
    isLoading,
    error,
    handleUserInput,
    retryLastAction: useCallback(async () => {
      if (lastInput) {
        await handleUserInput(lastInput);
      }
    }, [lastInput, handleUserInput])
  };
};
