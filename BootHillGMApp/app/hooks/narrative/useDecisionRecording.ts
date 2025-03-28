/**
 * Hook for recording player decisions
 */
import { useCallback } from 'react';
import { 
  clearCurrentDecision, 
  addNarrativeHistory,
  updateNarrativeContext,
  recordDecision,
  processDecisionImpacts
} from '../../actions/narrativeActions';
import { createDecisionRecord } from '../../utils/decisionUtils';
import { PlayerDecisionRecord } from '../../types/narrative.types';
import { EVENTS, triggerCustomEvent } from '../../utils/events';
import { NarrativeContextValue, NarrativeResponse } from './types';

/**
 * Hook that provides functionality for recording player decisions
 * 
 * @param context The narrative context
 * @param generateNarrativeResponse Function to generate narrative responses
 * @param setIsGeneratingNarrative Function to set generating narrative state
 * @returns Functions for recording decisions and accessing history
 */
export function useDecisionRecording(
  context: NarrativeContextValue,
  generateNarrativeResponse: (option: string, decisionPrompt: string) => Promise<NarrativeResponse>,
  setIsGeneratingNarrative: (isGenerating: boolean) => void
) {
  const { state, dispatch } = context;

  /**
   * Record a player's decision and generate a narrative response
   * 
   * This function handles the complete workflow of recording a decision:
   * 1. Validates the decision and option IDs
   * 2. Generates narrative response via AI
   * 3. Creates and stores decision record
   * 4. Updates narrative history
   * 5. Processes decision impacts
   * 6. Clears the current decision state
   * 
   * @param decisionId - ID of the decision being responded to
   * @param selectedOptionId - ID of the option selected by the player
   * @returns Promise that resolves when the decision is fully processed
   */
  const recordPlayerDecision = useCallback(async (
    decisionId: string, 
    selectedOptionId: string
  ): Promise<void> => {
    // Find the decision and selected option
    const decision = state.currentDecision;
    if (!decision || decision.id !== decisionId) {
      const errorMsg = 'Decision not found or does not match current decision';
      throw new Error(errorMsg);
    }

    const selectedOption = decision.options.find((option) => option.id === selectedOptionId);
    if (!selectedOption) {
      const errorMsg = 'Selected option not found';
      throw new Error(errorMsg);
    }

    try {
      // First set the generation state to true - this will show our loading UI
      setIsGeneratingNarrative(true);
      
      // Show a temporary loading message in the narrative
      dispatch(addNarrativeHistory("...\n"));
      
      // Generate narrative response based on the player's choice
      const narrativeResponse = await generateNarrativeResponse(
        selectedOption.text,
        decision.prompt
      );
      
      // Create an explicit player decision narrative - make sure it starts with "Player:" for correct parsing
      const playerActionText = `${selectedOption.text.toLowerCase()}`;
      const playerChoiceNarrative = `Player: ${playerActionText}`;
      
      // Now that we have the response, we can clear the decision
      dispatch(clearCurrentDecision());
      triggerCustomEvent(EVENTS.DECISION_CLEARED);
      
      // Update the temporary message with the actual response
      // First, remove the temporary loading message
      const narrativeHistory = [...state.narrativeHistory];
      narrativeHistory.pop(); // Remove the loading message
      
      dispatch({
        type: 'UPDATE_NARRATIVE',
        payload: {
          narrativeHistory: narrativeHistory
        }
      });
      
      // First, add the player's choice explicitly
      dispatch(addNarrativeHistory(playerChoiceNarrative));
      
      // Then add the AI narrative response as a Game Master response
      dispatch(addNarrativeHistory(`Game Master: ${narrativeResponse.narrative}`));
      
      // Create the decision record
      const decisionRecord = createDecisionRecord(
        decision,
        selectedOptionId,
        narrativeResponse.narrative
      );
      
      // Ensure we have a narrativeContext property with decisionHistory array
      if (!state.narrativeContext) {
        // Initialize the narrative context if it doesn't exist
        dispatch(updateNarrativeContext({
          characterFocus: [],
          themes: [],
          worldContext: '',
          importantEvents: [],
          decisionHistory: []
        }));
      }
      
      // Update the decision history in the context
      const updatedHistory = [
        ...(state.narrativeContext?.decisionHistory || []),
        decisionRecord
      ];
      
      dispatch(updateNarrativeContext({
        decisionHistory: updatedHistory
      }));
      
      // Record the decision through the reducer
      dispatch(recordDecision(decisionId, selectedOptionId, narrativeResponse.narrative));
      
      // Process the impacts of this decision
      dispatch(processDecisionImpacts(decisionId));

      // Force context update to ensure UI updates properly
      triggerCustomEvent(EVENTS.UI_FORCE_UPDATE);
      window.dispatchEvent(new Event('storage'));
      
      // Final cleanup of state
      setIsGeneratingNarrative(false);

    } catch (error) {
      console.error('Error recording player decision:', error);
      // Make sure to still clear even if there's an error
      dispatch(clearCurrentDecision());
      setIsGeneratingNarrative(false);
      throw error;
    }
  }, [state.currentDecision, state.narrativeContext, state.narrativeHistory, dispatch, generateNarrativeResponse, setIsGeneratingNarrative]);

  /**
   * Get the decision history filtered by tags
   * 
   * This allows for selective retrieval of past decisions based on tags.
   * 
   * @param tags - Optional tags to filter by
   * @returns Array of decision records that match the filter criteria
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
    recordPlayerDecision,
    getDecisionHistory
  };
}