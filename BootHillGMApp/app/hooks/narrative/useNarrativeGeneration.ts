/**
 * Hook for generating narrative responses to player decisions
 */
import { useCallback, useState, useMemo } from 'react';
import { AIService } from '../../services/ai';
import { Character } from '../../types/character';
import { NarrativeResponse } from './types';

/**
 * Hook that provides functionality for generating narrative responses
 * 
 * @param context The narrative context
 * @returns Functions and state for narrative generation
 */
export function useNarrativeGeneration() {
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
   * @returns Object with narrative text and item updates
   */
  const generateNarrativeResponse = useCallback(async (
    option: string
  ): Promise<NarrativeResponse> => {
    setIsGeneratingNarrative(true);
    
    try {
      // Get AI response with narrative continuation
      // Prepare complete character data structure
      const characterData: Character = {
        name: 'Player',
        inventory: { items: [] },
        isNPC: false,
        isPlayer: true,
        id: 'current-player',
        attributes: {
          speed: 5,
          gunAccuracy: 5,
          throwingAccuracy: 5,
          strength: 5,
          baseStrength: 5,
          bravery: 5,
          experience: 0
        },
        minAttributes: {
          speed: 1,
          gunAccuracy: 1,
          throwingAccuracy: 1,
          strength: 1,
          baseStrength: 1,
          bravery: 1,
          experience: 0
        },
        maxAttributes: {
          speed: 10,
          gunAccuracy: 10,
          throwingAccuracy: 10,
          strength: 10,
          baseStrength: 10,
          bravery: 10,
          experience: 100
        },
        wounds: [],
        isUnconscious: false
      };

      const response = await aiService.generateGameContent(characterData);
      
      setIsGeneratingNarrative(false);
      return {
        narrative: response.narrative,
        acquiredItems: (response.acquiredItems || []).map(item => item.name),
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
  }, [aiService]);

  return {
    generateNarrativeResponse,
    isGeneratingNarrative,
    setIsGeneratingNarrative
  };
}
