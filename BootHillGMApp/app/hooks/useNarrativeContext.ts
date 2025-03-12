import { useContext, useCallback } from 'react';
import { 
  PlayerDecision, 
  PlayerDecisionRecord 
} from '../types/narrative.types';
import NarrativeContext from '../context/NarrativeContext';
import { 
  presentDecision, 
  recordDecision, 
  clearCurrentDecision,
  processDecisionImpacts
} from '../reducers/narrativeReducer';
import { AIService } from '../services/ai';

// Create a singleton instance of AIService
const aiService = new AIService();

/**
 * Custom hook for interacting with narrative context and player decisions
 * 
 * Provides methods for presenting, recording, and clearing decisions,
 * as well as accessing decision history.
 * 
 * @returns Object with decision state and functions
 */
export function useNarrativeContext() {
  const context = useContext(NarrativeContext);
  
  if (!context) {
    throw new Error('useNarrativeContext must be used within a NarrativeProvider');
  }
  
  const { state, dispatch } = context;

  /**
   * Present a decision to the player
   * @param decision The decision to present
   */
  const presentPlayerDecision = useCallback((decision: PlayerDecision) => {
    dispatch(presentDecision(decision));
  }, [dispatch]);

  /**
   * Generate a mock narrative response for testing or when AI service is unavailable
   * @param input User input text
   * @returns A simple narrative response
   */
  const generateFallbackNarrative = useCallback((input: string) => {
    return {
      narrative: `You decided: ${input}. The story continues...`,
      acquiredItems: [],
      removedItems: []
    };
  }, []);

  /**
   * Record a player's decision and generate narrative response
   * @param decisionId ID of the decision being responded to
   * @param selectedOptionId ID of the option selected by the player
   * @returns Promise that resolves when the decision is recorded and processed
   */
  const recordPlayerDecision = useCallback(async (
    decisionId: string, 
    selectedOptionId: string
  ): Promise<void> => {
    // Find the decision and selected option
    const decision = state.currentDecision;
    if (!decision || decision.id !== decisionId) {
      throw new Error('Decision not found or does not match current decision');
    }

    const selectedOption = decision.options.find((option) => option.id === selectedOptionId);
    if (!selectedOption) {
      throw new Error('Selected option not found');
    }

    try {
      let narrativeResponse;

      try {
        // Get current narrative context for better AI responses
        const context = state.narrativeHistory.slice(-3).join('\n');
        const prompt = `Player selected: ${selectedOption.text}`;

        // Try to generate AI response based on the player's choice
        narrativeResponse = await aiService.getAIResponse(
          prompt,
          context,
          [] // No inventory needed for this response
        );
      } catch (error) {
        console.warn('Failed to generate AI response, using fallback:', error);
        narrativeResponse = generateFallbackNarrative(selectedOption.text);
      }

      // Record the decision with the narrative response
      dispatch(recordDecision(decisionId, selectedOptionId, narrativeResponse.narrative));
      
      // Process the impacts of this decision
      dispatch(processDecisionImpacts(decisionId));

    } catch (error) {
      console.error('Error recording player decision:', error);
      throw error;
    }
  }, [state.currentDecision, state.narrativeHistory, dispatch, generateFallbackNarrative]);

  /**
   * Clear the current decision without recording it
   */
  const clearPlayerDecision = useCallback(() => {
    dispatch(clearCurrentDecision());
  }, [dispatch]);

  /**
   * Get the decision history filtered by tags
   * @param tags Optional tags to filter by
   * @returns Filtered decision history
   */
  const getDecisionHistory = useCallback((tags?: string[]): PlayerDecisionRecord[] => {
    if (!state.narrativeContext?.decisionHistory) {
      return [];
    }

    if (!tags || tags.length === 0) {
      return state.narrativeContext.decisionHistory;
    }

    return state.narrativeContext.decisionHistory.filter((record) => {
      return record.tags.some((tag) => tags!.includes(tag));
    });
  }, [state.narrativeContext?.decisionHistory]);

  return {
    // Current decision state
    currentDecision: state.currentDecision,
    
    // Decision history
    decisionHistory: state.narrativeContext?.decisionHistory || [],
    
    // Decision functions
    presentPlayerDecision,
    recordPlayerDecision,
    clearPlayerDecision,
    getDecisionHistory,
    
    // Decision state checks
    hasActiveDecision: Boolean(state.currentDecision),
  };
}