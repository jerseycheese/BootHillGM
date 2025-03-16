/**
 * Decision Response Processor
 * 
 * Processes AI responses into structured decision objects.
 * Handles parsing, validation, and conversion of raw AI output.
 */

import { v4 as uuidv4 } from 'uuid';
import { PlayerDecision, DecisionImportance } from '../../types/narrative.types';
import { LocationType } from '../locationService';
import { ContextualDecisionServiceConfig, RawDecisionResponse } from './contextualDecision.types';

/**
 * Process the AI response into a structured object
 * 
 * @param responseText Response text from the AI
 * @returns Processed decision object or null if parsing fails
 */
export function processResponse(responseText: string): RawDecisionResponse | null {
  try {
    // Remove any markdown code block delimiters
    const cleanedText = responseText
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();
    
    // Parse the JSON
    return JSON.parse(cleanedText) as RawDecisionResponse;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    // Only log the raw response in development mode
    if (process.env.NODE_ENV !== 'production') {
      console.log('Raw response:', responseText);
    }
    return null;
  }
}

/**
 * Convert a raw response object to a PlayerDecision
 * 
 * @param response Processed response from AI
 * @param config Service configuration for options limiting
 * @param location Current location
 * @returns PlayerDecision object
 */
export function toPlayerDecision(
  response: RawDecisionResponse,
  config: ContextualDecisionServiceConfig,
  location?: LocationType
): PlayerDecision {
  // Validate importance
  const validImportance = ['critical', 'significant', 'moderate', 'minor'];
  const importance: DecisionImportance = 
    (response.importance as string) && validImportance.includes(response.importance as string)
      ? response.importance as DecisionImportance
      : 'moderate';
  
  // Generate option IDs if missing
  const options = ((response.options as unknown[]) || []).map(option => ({
    id: uuidv4(),
    text: (option as Record<string, unknown>).text as string || 'Option',
    impact: (option as Record<string, unknown>).impact as string || 'Unknown impact',
    tags: Array.isArray((option as Record<string, unknown>).tags) 
      ? (option as Record<string, unknown>).tags as string[] 
      : []
  }));
  
  // Limit options based on config
  const limitedOptions = options.slice(0, config.maxOptionsPerDecision);
  
  // Ensure we have at least 2 options
  if (limitedOptions.length < 2) {
    limitedOptions.push({
      id: uuidv4(),
      text: 'Continue forward',
      impact: 'Proceed with the current course of action.',
      tags: ['default']
    });
  }
  
  return {
    id: `decision-${uuidv4()}`,
    prompt: (response.prompt as string) || 'What would you like to do?',
    timestamp: Date.now(),
    location,
    options: limitedOptions,
    context: (response.context as string) || 'Based on narrative context',
    importance,
    characters: [],
    aiGenerated: true
  };
}