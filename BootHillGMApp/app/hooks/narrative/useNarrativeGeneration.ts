/**
 * Hook for generating narrative responses to player decisions
 */
import { useCallback, useState, useMemo } from 'react';
import { AIService } from '../../services/ai';
import { InventoryItem } from '../../types/item.types';
import { NarrativeContextValue, NarrativeResponse } from './types';

/**
 * Hook that provides functionality for generating narrative responses
 * 
 * @param context The narrative context
 * @returns Functions and state for narrative generation
 */
export function useNarrativeGeneration(context: NarrativeContextValue) {
  const { state } = context;
  const [isGeneratingNarrative, setIsGeneratingNarrative] = useState(false);
  
  // Instance of the AI service - wrapped in useMemo to prevent recreation on every render
  const aiService = useMemo(() => new AIService(), []);

  /**
   * Generate a narrative response based on the player's choice
   * 
   * This function uses the AI service to generate a contextual response
   * to the player's decision, or falls back to a simpler response if
   * AI generation fails.
   * 
   * @param option - The selected decision option text
   * @param decisionPrompt - The original decision prompt
   * @returns Object with narrative text and item updates
   */
  const generateNarrativeResponse = useCallback(async (
    option: string,
    decisionPrompt: string
  ): Promise<NarrativeResponse> => {
    setIsGeneratingNarrative(true);
    
    try {
      // Use recent narrative history as context
      const recentHistory = state.narrativeHistory.slice(-3).join('\n\n');
      
      // Get player inventory from game state - as an array of InventoryItem objects
      const inventory: InventoryItem[] = []; // In a real implementation, get this from game state
      
      // Create a prompt that includes the decision context and selected option
      const prompt = `In response to "${decisionPrompt}", I chose to "${option}". What happens next?`;
      
      // Get AI response with narrative continuation
      const response = await aiService.getAIResponse(prompt, recentHistory, inventory);
      
      setIsGeneratingNarrative(false);
      return {
        narrative: response.narrative,
        acquiredItems: response.acquiredItems || [],
        removedItems: response.removedItems || []
      };
    } catch (error) {
      console.error('Error generating AI narrative response:', error);
      setIsGeneratingNarrative(false);
      
      // Fall back to a basic response that explicitly mentions the player's choice
      const fallbackResponse = `The story continues as you ${option.toLowerCase()}. Your choice leads to new developments in the western town of Redemption. The locals take note of your actions as you continue your journey.`;
      
      return {
        narrative: fallbackResponse,
        acquiredItems: [],
        removedItems: []
      };
    }
  }, [state.narrativeHistory, aiService]);

  return {
    generateNarrativeResponse,
    isGeneratingNarrative,
    setIsGeneratingNarrative
  };
}