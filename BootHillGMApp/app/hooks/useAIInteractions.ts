import { useCallback, useState } from 'react';
import { AIService } from '../services/ai';
import { GameState } from '../types/campaign';
import { GameEngineAction } from '../utils/gameEngine';
import { JournalEntry } from '../types/journal';
import { Character } from '../types/character';
import { generateNarrativeSummary } from '../utils/aiService';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const aiService = new AIService(API_KEY);

type AIResponse = {
  narrative?: string;
  location?: string;
  combatInitiated?: boolean;
  opponent?: Character;
  acquiredItems: string[];
  removedItems: string[];
};

export const useAIInteractions = (
  state: GameState,
  dispatch: React.Dispatch<GameEngineAction>,
  onInventoryChange: (acquired: string[], removed: string[]) => void,
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getJournalContext = (journal: JournalEntry[]) => {
    return journal.slice(-5).map(entry => entry.content).join('\n');
  };

  const processAIResponse = useCallback(async (input: string, response: AIResponse) => {
    
    if (response.narrative) {
      // Build narrative by combining existing text with new input and response
      // This maintains conversation history in a readable format
      const narrativeUpdate = state.narrative 
        ? `${state.narrative}\n\nPlayer: ${input}\n\nGame Master: ${response.narrative}`
        : response.narrative;

      // Update narrative state
      dispatch({ type: 'SET_NARRATIVE', payload: narrativeUpdate });

      // Create a concise summary for the journal instead of using full narrative
      // This makes the journal more readable and focused
      const narrativeSummary = await generateNarrativeSummary(
        input,
        `${state.character?.name || 'You'} ${input}`
      );

      // Add journal entry with the concise summary
      const journalEntry = {
        timestamp: Date.now(),
        content: input,
        narrativeSummary
      };
      
      dispatch({ type: 'UPDATE_JOURNAL', payload: journalEntry });
    }

    // Update location if provided in response
    if (response.location) {
      dispatch({ type: 'SET_LOCATION', payload: response.location });
    }

    // Handle combat initiation with opponent
    if (response.combatInitiated && response.opponent) {
      dispatch({ 
        type: 'SET_CHARACTER',
        payload: response.opponent
      });
    }

    // Process inventory changes by creating unique IDs for new items
    // This ensures each item can be tracked and managed individually
    if (response.acquiredItems.length > 0) {
      response.acquiredItems.forEach(itemName => {
        const newItem = {
          id: `${itemName.toLowerCase()}-${Date.now()}`,
          name: itemName,
          quantity: 1,
          description: `A ${itemName.toLowerCase()}`
        };
        dispatch({ type: 'ADD_ITEM', payload: newItem });
      });
    }

    // Notify parent component of inventory changes
    if (response.acquiredItems.length > 0 || response.removedItems.length > 0) {
      onInventoryChange(response.acquiredItems, response.removedItems);
    }

    // Update game progress
    dispatch({ 
      type: 'SET_GAME_PROGRESS', 
      payload: state.gameProgress + 1
    });

  }, [dispatch, onInventoryChange, state.gameProgress, state.narrative, state.character?.name]);

  const handleUserInput = useCallback(async (input: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const journalContext = getJournalContext(state.journal || []);
      const response = await aiService.getResponse(
        input, 
        journalContext,
        { 
          inventory: state.inventory || [],
          character: state.character || undefined,
          location: state.location
        }
      );
      await processAIResponse(input, response);
    } catch (err) {
      console.error('Error in handleUserInput:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [state, processAIResponse]);

  const retryLastAction = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await aiService.retryLastAction();
      if (response) {
        await processAIResponse('', response);
      }
    } catch (err) {
      console.error('Error in retryLastAction:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [processAIResponse]);

  return {
    handleUserInput,
    retryLastAction,
    isLoading,
    error
  };
};
