/**
 * AI Response Parser
 * 
 * Utility functions for parsing AI responses
 */

import { PlayerDecision, DecisionImportance } from '../../../types/narrative.types';

/**
 * Raw decision data as it comes from the AI response
 */
interface RawPlayerDecision {
  id?: string;
  prompt?: string;
  options?: Array<{
    id?: string;
    text?: string;
    impact?: string;
    tags?: string[];
  }>;
  context?: string;
  importance?: string;
  characters?: string[];
}

/**
 * Parse a raw player decision from the AI response into a structured PlayerDecision
 * @param rawDecision Raw decision data from AI
 * @returns Formatted PlayerDecision
 */
export function parsePlayerDecision(rawDecision: RawPlayerDecision): PlayerDecision {
  if (!rawDecision) {
    throw new Error('No decision data provided');
  }
  
  // Generate option IDs if not present
  const options = Array.isArray(rawDecision.options) 
    ? rawDecision.options.map((option, index: number) => ({
        id: option.id || `option-${Date.now()}-${index}`,
        text: option.text || 'Unnamed option',
        impact: option.impact || '',
        tags: option.tags || []
      }))
    : [];
  
  // Parse importance safely
  const importance = validateImportance(rawDecision.importance);
  
  return {
    id: rawDecision.id || `decision-${Date.now()}`,
    prompt: rawDecision.prompt || 'What do you want to do?',
    options,
    timestamp: Date.now(),
    context: rawDecision.context || '',
    importance,
    characters: rawDecision.characters || [],
    aiGenerated: true
  };
}

/**
 * Validates and converts the importance string to a proper DecisionImportance type
 */
function validateImportance(importance?: string): DecisionImportance {
  const validImportance: DecisionImportance[] = ['critical', 'significant', 'moderate', 'minor'];
  
  if (importance && validImportance.includes(importance as DecisionImportance)) {
    return importance as DecisionImportance;
  }
  
  return 'moderate'; // Default value
}
