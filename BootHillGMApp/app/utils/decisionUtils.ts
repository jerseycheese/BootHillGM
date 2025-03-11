/**
 * Utility functions for working with player decisions
 */
import { v4 as uuidv4 } from 'uuid';
import { 
  PlayerDecision, 
  PlayerDecisionOption, 
  PlayerDecisionRecord,
  DecisionImportance,
} from '../types/narrative.types';
import { LocationType } from '../services/locationService';

/**
 * Creates a new player decision with default values
 * 
 * @param prompt The prompt text for the decision
 * @param options Array of decision options
 * @param context Narrative context for this decision
 * @param importance Importance level of this decision
 * @returns A new PlayerDecision object
 */
export function createDecision(
  prompt: string,
  options: PlayerDecisionOption[],
  context: string,
  importance: DecisionImportance = 'moderate',
  location?: LocationType,
  characters: string[] = []
): PlayerDecision {
  return {
    id: uuidv4(),
    prompt,
    timestamp: Date.now(),
    options,
    context,
    importance,
    location,
    characters,
    aiGenerated: true
  };
}

/**
 * Creates a decision option with default values
 * 
 * @param text The display text for the option
 * @param impact Description of the potential impact
 * @param tags Optional tags for categorization
 * @returns A new PlayerDecisionOption object
 */
export function createDecisionOption(
  text: string,
  impact: string,
  tags: string[] = []
): PlayerDecisionOption {
  return {
    id: uuidv4(),
    text,
    impact,
    tags
  };
}

/**
 * Creates a decision record when a player makes a choice
 * 
 * @param decision The original decision presented to the player
 * @param selectedOptionId The ID of the option the player selected
 * @param narrative The narrative response after the decision
 * @returns A new PlayerDecisionRecord object
 */
export function createDecisionRecord(
  decision: PlayerDecision,
  selectedOptionId: string,
  narrative: string
): PlayerDecisionRecord {
  const selectedOption = decision.options.find(option => option.id === selectedOptionId);
  
  if (!selectedOption) {
    throw new Error(`Option with ID ${selectedOptionId} not found in decision ${decision.id}`);
  }
  
  // Calculate initial relevance score based on importance
  let relevanceScore = 5; // Default mid-range score
  
  switch (decision.importance) {
    case 'critical':
      relevanceScore = 10;
      break;
    case 'significant':
      relevanceScore = 8;
      break;
    case 'moderate':
      relevanceScore = 5;
      break;
    case 'minor':
      relevanceScore = 2;
      break;
  }
  
  // Gather all tags from both the decision and the selected option
  const allTags = [
    ...(selectedOption.tags || []),
    ...(decision.characters || []).map(character => `character:${character}`),
    `importance:${decision.importance}`
  ];
  
  if (decision.location?.type) {
    allTags.push(`location:${decision.location.type}`);

    if (decision.location.type === 'town' || decision.location.type === 'landmark') {
      if (decision.location.name) {
        allTags.push(`place:${decision.location.name}`);
      }
    }
  }
  
  return {
    decisionId: decision.id,
    selectedOptionId,
    timestamp: Date.now(),
    narrative,
    impactDescription: selectedOption.impact,
    tags: allTags,
    relevanceScore,
    
    // For significant/critical decisions, set a longer expiration time
    expirationTimestamp: decision.importance === 'minor' 
      ? Date.now() + (7 * 24 * 60 * 60 * 1000) // 1 week for minor decisions
      : undefined // No expiration for more important decisions
  };
}

/**
 * Formats decision history for inclusion in AI context
 * 
 * @param decisions Array of decision records to format
 * @param maxDecisions Maximum number of decisions to include
 * @returns Formatted string for AI context
 */
export function formatDecisionsForAIContext(
  decisions: PlayerDecisionRecord[],
  maxDecisions: number = 5
): string {
  if (!decisions.length) {
    return '';
  }
  
  // Sort by relevance score (descending) and take top N
  const topDecisions = [...decisions]
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxDecisions);
  
  return `
Player's past important decisions:
${topDecisions.map((record, index) => `
${index + 1}. Decision: ${record.impactDescription}
   Context: ${record.narrative.substring(0, 100)}...`).join('\n')}
  `.trim();
}

/**
 * Checks if a decision has expired based on its expiration timestamp
 * 
 * @param decision The decision record to check
 * @returns True if the decision has expired, false otherwise
 */
export function hasDecisionExpired(decision: PlayerDecisionRecord): boolean {
  return Boolean(
    decision.expirationTimestamp && 
    decision.expirationTimestamp < Date.now()
  );
}

/**
 * Filters decision history to only include relevant decisions
 * 
 * @param decisions Array of decision records
 * @param currentTags Tags relevant to current context (optional)
 * @param minRelevance Minimum relevance score (optional)
 * @returns Filtered array of decision records
 */
export function filterRelevantDecisions(
  decisions: PlayerDecisionRecord[],
  currentTags: string[] = [],
  minRelevance: number = 0
): PlayerDecisionRecord[] {
  return decisions.filter(decision => {
    // Filter out expired decisions
    if (hasDecisionExpired(decision)) {
      return false;
    }
    
    // Filter by minimum relevance score
    if (decision.relevanceScore < minRelevance) {
      return false;
    }
    
    // If no tags provided, just use relevance score
    if (!currentTags.length) {
      return true;
    }
    
    // Check for tag overlap
    return decision.tags.some(tag => currentTags.includes(tag));
  });
}