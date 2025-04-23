/**
 * AI Decision Generator
 * 
 * Generates decision prompts and processes AI responses
 */

import { DecisionPrompt, DecisionResponse } from '../../../types/ai-service.types';
import { NarrativeState, PlayerDecision, PlayerDecisionOption } from '../../../types/narrative.types';
import { Character } from '../../../types/character';
import { LocationType } from '../../locationService';
import { DecisionHistoryEntry, AIDecisionServiceConfig } from '../types/aiDecisionTypes';

/**
 * Build a decision prompt for the AI service
 * 
 * @param narrativeState Current narrative state
 * @param character Player character
 * @param decisionsHistory Recent decision history
 * @returns Formatted decision prompt
 */
export function buildDecisionPrompt(
  narrativeState: NarrativeState,
  character: Character,
  decisionsHistory: DecisionHistoryEntry[]
): DecisionPrompt {
  // Extract recent narrative content
  let narrativeContext = '';
  
  if (narrativeState.currentStoryPoint) {
    narrativeContext = narrativeState.currentStoryPoint.content;
  } else if (narrativeState.narrativeHistory.length > 0) {
    // Get the last few narrative entries
    const recentHistory = narrativeState.narrativeHistory.slice(-3);
    narrativeContext = recentHistory.join('\n\n');
  }
  
  // Extract location information
  const location: LocationType | string = narrativeState.currentStoryPoint?.locationChange || 'Unknown';
  
  // Extract character traits
  const traits: string[] = [];
  
  // Add traits based on character attributes
  if (character.attributes.bravery >= 8) traits.push('brave');
  if (character.attributes.bravery <= 3) traits.push('cautious');
  if (character.attributes.speed >= 8) traits.push('quick');
  if (character.attributes.gunAccuracy >= 8) traits.push('sharpshooter');
  
  // Map relationships (simplified)
  const relationships: Record<string, string> = { /* Intentionally empty */ };
  
  // Get recent events
  const recentEvents = narrativeState.narrativeHistory
    .slice(-5)
    .map(entry => entry.substring(0, 100) + '...'); // Truncate for brevity
  
  // Extract recent decisions for context
  const previousDecisions = decisionsHistory.slice(-3).map(decision => ({
    prompt: decision.prompt,
    choice: decision.choice,
    outcome: decision.outcome
  }));
  
  // Combine everything into the decision prompt
  return {
    narrativeContext,
    characterInfo: {
      traits,
      history: character.isNPC ? 'NPC Character' : 'Player Character',
      relationships
    },
    gameState: {
      location,
      currentScene: narrativeState.currentStoryPoint?.id || 'unknown',
      recentEvents
    },
    previousDecisions
  };
}

/**
 * Convert an AI response to a PlayerDecision for use with the existing system
 * 
 * @param aiResponse Decision response from the AI service
 * @param config Service configuration
 * @param location Current location (optional)
 * @returns PlayerDecision compatible with the existing system
 */
export function aiResponseToPlayerDecision(
  aiResponse: DecisionResponse,
  config: AIDecisionServiceConfig,
  location?: LocationType
): PlayerDecision {
  let options = aiResponse.options.map(option => ({
    id: option.id,
    text: option.text,
    impact: option.impact,
    tags: option.traits // Use the traits as tags
  }));
  
  // Ensure we have at least 2 options
  if (options.length < 2) {
    // Add fallback options if needed
    if (options.length === 0) {
      options.push({
        id: `fallback-1-${Date.now()}`,
        text: 'Continue forward cautiously',
        impact: 'Taking a careful approach could reveal more information but might take longer.',
        tags: ['cautious']
      });
    }
    
    if (options.length === 1) {
      options.push({
        id: `fallback-2-${Date.now()}`,
        text: 'Take decisive action',
        impact: 'Being decisive could lead to quick resolution but might be risky.',
        tags: ['brave']
      });
    }
  }
  
  // Limit the number of options
  if (options.length > config.maxOptionsPerDecision) {
    options = options
      .sort((a, b) => {
        // Find the original options to get their confidence values
        const optionA = aiResponse.options.find(o => o.id === a.id);
        const optionB = aiResponse.options.find(o => o.id === b.id);
        return (optionB?.confidence || 0.5) - (optionA?.confidence || 0.5);
      })
      .slice(0, config.maxOptionsPerDecision);
  }
  
  // Create the PlayerDecision object
  return {
    id: aiResponse.decisionId,
    prompt: aiResponse.prompt,
    timestamp: Date.now(),
    location,
    options,
    context: 'AI-generated based on narrative context',
    importance: aiResponse.metadata.importance,
    characters: [], // This could be populated if AI returns character data
    aiGenerated: true
  };
}

/**
 * Generate a fallback decision when AI service is unavailable
 * 
 * @param narrativeState Current narrative state
 * @returns PlayerDecision using templates instead of AI
 */
export function generateFallbackDecision(
  narrativeState: NarrativeState
): PlayerDecision {
  // In a real implementation, this would use your existing template system
  // For now, create a simple fallback decision
  
  const decisionOptions: PlayerDecisionOption[] = [
    {
      id: `fallback-1-${Date.now()}`,
      text: 'Proceed with caution',
      impact: 'Taking a careful approach could reveal more information but might take longer.',
      tags: ['cautious']
    },
    {
      id: `fallback-2-${Date.now()}`,
      text: 'Take immediate action',
      impact: 'Being decisive could lead to quick resolution but might be risky.',
      tags: ['brave']
    },
    {
      id: `fallback-3-${Date.now()}`,
      text: 'Look for an alternative approach',
      impact: 'Seeking another way might reveal unexpected opportunities.',
      tags: ['resourceful']
    }
  ];
  
  return {
    id: `fallback-decision-${Date.now()}`,
    prompt: 'How do you want to proceed?',
    timestamp: Date.now(),
    location: narrativeState.currentStoryPoint?.locationChange,
    options: decisionOptions,
    context: 'Based on the current situation',
    importance: 'moderate',
    characters: [],
    aiGenerated: true
  };
}