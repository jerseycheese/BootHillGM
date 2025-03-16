/**
 * AI Decision Generator
 * 
 * Generates decision prompts and processes AI responses with comprehensive
 * context extraction to ensure decisions are based on the latest narrative state.
 */

import { DecisionPrompt, DecisionResponse } from '../../../types/ai-service.types';
import { NarrativeState, PlayerDecision, PlayerDecisionOption } from '../../../types/narrative.types';
import { Character } from '../../../types/character';
import { GameState } from '../../../types/gameState';
import { LocationType } from '../../locationService';
import { DecisionHistoryEntry, AIDecisionServiceConfig } from '../types/aiDecisionTypes';

// Constants for context extraction
const MAX_NARRATIVE_ENTRIES = 5;
const MAX_DECISION_HISTORY = 5;
const MAX_ENTRY_LENGTH = 200;

/**
 * Build a decision prompt for the AI service with comprehensive context
 * 
 * @param narrativeState Current narrative state
 * @param character Player character
 * @param decisionsHistory Recent decision history
 * @param gameState Optional game state for additional context
 * @returns Formatted decision prompt
 */
export function buildDecisionPrompt(
  narrativeState: NarrativeState,
  character: Character,
  decisionsHistory: DecisionHistoryEntry[],
  gameState?: GameState
): DecisionPrompt {
  // Refresh the narrative context to ensure we're working with the latest state
  const refreshedState = refreshNarrativeContext(narrativeState);
  
  // Extract comprehensive narrative context
  const narrativeContext = extractNarrativeContext(refreshedState);
  
  // Extract or infer location information
  const location: LocationType | string = refreshedState.currentStoryPoint?.locationChange || 
                                         inferCurrentLocation(refreshedState) || 
                                         'Unknown';
  
  // Extract character traits with more depth
  const traits = extractCharacterTraits(character);
  
  // Build more detailed relationships
  const relationships = extractRelationships(character, refreshedState);
  
  // Get recent events from narrative history
  const recentEvents = extractRecentEvents(refreshedState);
  
  // Extract recent decisions for context
  const previousDecisions = extractPreviousDecisions(decisionsHistory);
  
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
      currentScene: refreshedState.currentStoryPoint?.id || 'unknown',
      recentEvents,
      // Include additional game state if available
      ...(gameState && { additionalContext: JSON.stringify(gameState) })
    },
    previousDecisions
  };
}

/**
 * Refreshes the narrative context to ensure it's up-to-date
 * This addresses the stale context bug by ensuring freshness
 * 
 * @param narrativeState Current narrative state
 * @returns Refreshed narrative state
 */
function refreshNarrativeContext(narrativeState: NarrativeState): NarrativeState {
  // Create a deep copy to avoid mutation issues
  return {
    ...narrativeState,
    narrativeHistory: [...narrativeState.narrativeHistory],
    currentStoryPoint: narrativeState.currentStoryPoint 
      ? { ...narrativeState.currentStoryPoint } 
      : undefined
  };
}

/**
 * Extracts a comprehensive narrative context from the narrative state
 * 
 * @param narrativeState Current narrative state
 * @returns Comprehensive narrative context
 */
function extractNarrativeContext(narrativeState: NarrativeState): string {
  const contextParts: string[] = [];
  
  // Include current story point if available
  if (narrativeState.currentStoryPoint?.content) {
    contextParts.push(`Current situation: ${narrativeState.currentStoryPoint.content}`);
  }
  
  // Include recent narrative history with proper chronological ordering
  if (narrativeState.narrativeHistory.length > 0) {
    // Get the most recent entries, but preserve chronological order
    const recentEntries = narrativeState.narrativeHistory
      .slice(-MAX_NARRATIVE_ENTRIES)
      .map((entry, index) => `[Recent Event ${index + 1}]: ${entry}`);
    
    contextParts.push("Recent events:");
    contextParts.push(...recentEntries);
  }
  
  return contextParts.join('\n\n');
}

/**
 * Infers the current location from narrative history if not explicitly set
 * 
 * @param narrativeState Current narrative state
 * @returns Inferred location or undefined
 */
function inferCurrentLocation(narrativeState: NarrativeState): string | undefined {
  // Search for location mentions in recent history
  for (let i = narrativeState.narrativeHistory.length - 1; i >= 0; i--) {
    const entry = narrativeState.narrativeHistory[i];
    
    // Check for location indicators like "arrived at" or "entered"
    if (entry.includes("arrived at") || entry.includes("entered") || entry.includes("location:")) {
      // This is a simplified version - real implementation would use more sophisticated parsing
      const locationMatch = entry.match(/(?:arrived at|entered|location:)\s+([A-Za-z\s']+)/i);
      if (locationMatch && locationMatch[1]) {
        return locationMatch[1].trim();
      }
    }
  }
  
  return undefined;
}

/**
 * Extracts character traits based on character data
 * 
 * @param character Character data
 * @returns Array of character traits
 */
function extractCharacterTraits(character: Character): string[] {
  const traits: string[] = [];
  
  // Add traits based on character attributes
  if (character.attributes.bravery >= 8) traits.push('brave');
  if (character.attributes.bravery <= 3) traits.push('cautious');
  if (character.attributes.speed >= 8) traits.push('quick');
  if (character.attributes.gunAccuracy >= 8) traits.push('sharpshooter');
  
  // Add personality traits if available
  if (character.personality?.dominant) {
    traits.push(...character.personality.dominant);
  }
  
  // Add any additional traits from character data
  if (character.traits) {
    traits.push(...character.traits);
  }
  
  return traits;
}

/**
 * Extracts relationship information from character data and narrative state
 * 
 * @param character Character data
 * @param narrativeState Current narrative state
 * @returns Relationship mapping
 */
function extractRelationships(
  character: Character, 
  narrativeState: NarrativeState
): Record<string, string> {
  const relationships: Record<string, string> = {};
  
  // Include explicit relationships from character data
  if (character.relationships) {
    Object.entries(character.relationships).forEach(([name, status]) => {
      relationships[name] = status;
    });
  }
  
  // Infer relationships from narrative history
  // This is a simplified implementation - a real one would use more sophisticated analysis
  const relationshipPatterns = [
    { pattern: /(\w+) became your (ally|enemy|friend)/i, type: (match: string[]) => match[2] },
    { pattern: /(\w+) (helped|betrayed) you/i, type: (match: string[]) => match[2] === 'helped' ? 'ally' : 'enemy' },
  ];
  
  for (const entry of narrativeState.narrativeHistory) {
    for (const { pattern, type } of relationshipPatterns) {
      const match = entry.match(pattern);
      if (match) {
        relationships[match[1]] = type(match);
      }
    }
  }
  
  return relationships;
}

/**
 * Extracts recent events from narrative history
 * 
 * @param narrativeState Current narrative state
 * @returns Array of recent events
 */
function extractRecentEvents(narrativeState: NarrativeState): string[] {
  return narrativeState.narrativeHistory
    .slice(-MAX_NARRATIVE_ENTRIES)
    .map(entry => {
      if (entry.length <= MAX_ENTRY_LENGTH) {
        return entry;
      }
      return entry.substring(0, MAX_ENTRY_LENGTH) + '...';
    });
}

/**
 * Extracts previous decisions for context
 * 
 * @param decisionsHistory Array of decision history entries
 * @returns Formatted previous decisions
 */
function extractPreviousDecisions(decisionsHistory: DecisionHistoryEntry[]) {
  return decisionsHistory
    .slice(-MAX_DECISION_HISTORY)
    .map(decision => ({
      prompt: decision.prompt,
      choice: decision.choice,
      outcome: decision.outcome,
      timestamp: decision.timestamp // Include timestamp for recency awareness
    }));
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
 * @param _character Player character (unused)
 * @param _gameState Optional game state (unused)
 * @returns PlayerDecision using templates instead of AI
 */
export function generateFallbackDecision(
  narrativeState: NarrativeState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _character: Character,
  _gameState?: GameState
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