/**
 * Decision Relevance Utilities
 * 
 * This file contains utilities for scoring and filtering player decisions based on
 * their relevance to the current narrative context. These utilities help determine
 * which past decisions should be prioritized for inclusion in AI context.
 */

import { PlayerDecisionRecord, PlayerDecisionRecordWithImpact } from '../types/narrative.types';
import { LocationType } from '../services/locationService';
import { hasDecisionExpired } from './decisionUtils';

/**
 * Configuration options for relevance scoring
 */
export interface RelevanceConfig {
  recencyWeight: number;     // Weight for recency factor (0-1)
  tagMatchWeight: number;    // Weight for tag matching (0-1)
  importanceWeight: number;  // Weight for decision importance (0-1)
  impactWeight: number;      // Weight for impact severity (0-1)
  maxAge: number;            // Maximum age in milliseconds to consider (~2 weeks default)
  minRelevanceScore: number; // Minimum score to be considered relevant
}

/**
 * Default configuration for relevance scoring
 */
export const DEFAULT_RELEVANCE_CONFIG: RelevanceConfig = {
  recencyWeight: 0.3,
  tagMatchWeight: 0.4,
  importanceWeight: 0.2,
  impactWeight: 0.1,
  maxAge: 14 * 24 * 60 * 60 * 1000, // 2 weeks in milliseconds
  minRelevanceScore: 0.3
};

/**
 * Calculate how well the decision's tags match current context tags.
 * This function compares the tags associated with a decision to the tags
 * representing the current narrative context. It calculates a score based on
 * the number and quality of matches.
 *
 * @param decisionTags Tags associated with the decision
 * @param currentTags Tags relevant to current context
 * @returns A score from 0 to 1 representing the tag match relevance.
 *          Returns 0 if either tag list is empty.
 */
function calculateTagMatchScore(
  decisionTags: string[],
  currentTags: string[]
): number {
  if (!currentTags.length || !decisionTags.length) {
    return 0;
  }

  // Convert currentTags to a Set for faster lookups
  const currentTagsSet = new Set(currentTags.map(tag => tag.toLowerCase()));

  // Count matching tags using a more flexible matching logic
  const matchingTags = decisionTags.filter(tag => {
    const lowerTag = tag.toLowerCase();
    return [...currentTagsSet].some(currentTag =>
      // Match if tags are exactly the same, or if one tag includes the other
      currentTag === lowerTag ||
      currentTag.includes(lowerTag) ||
      lowerTag.includes(currentTag)
    );
  });

  // Scoring logic:
  // - Base score is the ratio of matching tags to total decision tags.
  // - Increase score for decisions with more tags to reward better context.
  // - Weights partial matches higher when more tags are present, up to a cap.
  const matchRatio = matchingTags.length / Math.max(decisionTags.length, 1);
  const tagCountFactor = Math.min(decisionTags.length / 5, 1); // Factor scales with tag count, up to 5 tags
  
  // Combine match ratio and tag count factor for final score
  return matchRatio * (0.7 + (0.3 * tagCountFactor)); // Weighted combination
}

/**
 * Convert the static relevance score to a normalized importance score.
 * This function normalizes the static relevance score (assigned to decisions
 * at creation time) to a 0-1 scale, making it comparable with other dynamic
 * relevance factors.
 *
 * @param relevanceScore The static relevance score (0-10)
 * @returns A normalized score from 0 to 1.
 */
function calculateImportanceScore(relevanceScore: number): number {
  // Convert 0-10 score to 0-1 scale
  return Math.min(Math.max(relevanceScore / 10, 0), 1);
}

/**
 * Calculate an impact score based on decision impacts (if available).
 * This function calculates a score based on the severity of impacts associated
 * with a decision, if impact data is available. Decisions with more severe
 * impacts are considered more relevant.
 *
 * @param decision The decision record to evaluate
 * @returns A score from 0 to 1 based on impact severity.
 *          Returns 0.5 for decisions without explicit impact data,
 *          to give them a moderate baseline relevance.
 */
function calculateImpactScore(decision: PlayerDecisionRecord): number {
  // If it's a decision with impacts, use that information
  if ('impacts' in decision && Array.isArray(decision.impacts)) {
    const impactRecord = decision as PlayerDecisionRecordWithImpact;
    
    // No impacts means no score
    if (!impactRecord.impacts.length) {
      return 0;
    }
    
    // Sum the absolute values of all impacts and normalize
    const totalImpactValue = impactRecord.impacts.reduce((sum, impact) => 
      sum + Math.abs(impact.value), 0);
    
    // Normalize to 0-1 scale (capping at an arbitrary "significant" total of 20)
    return Math.min(totalImpactValue / 20, 1);
  }
  
  // For regular decisions without impact data, return a moderate score
  return 0.5;
}

/**
 * Calculates a relevance score for a decision based on various factors
 * 
 * @param decision The decision record to score
 * @param currentTags Tags relevant to current context (location, NPCs, themes)
 * @param currentTimestamp Current timestamp for recency calculation
 * @param config Optional custom configuration
 * @returns A relevance score from 0 to 10, where 10 is most relevant
 */
export function calculateRelevanceScore(
  decision: PlayerDecisionRecord,
  currentTags: string[] = [],
  currentTimestamp: number = Date.now(),
  config: RelevanceConfig = DEFAULT_RELEVANCE_CONFIG
): number {
  // Return 0 for expired decisions
  if (hasDecisionExpired(decision)) {
    return 0;
  }

  // Calculate recency score (1.0 for now, decreasing to 0.0 for maxAge)
  const age = currentTimestamp - decision.timestamp;
  const recencyScore = age > config.maxAge ? 0 : 1 - (age / config.maxAge);

  // Calculate tag matching score (0.0 to 1.0)
  const tagMatchScore = calculateTagMatchScore(decision.tags, currentTags); // Now defined before call

  // Calculate importance score (0.0 to 1.0)
  const importanceScore = calculateImportanceScore(decision.relevanceScore); // Now defined before call

  // Calculate impact score if available (0.0 to 1.0)
  const impactScore = calculateImpactScore(decision); // Now defined before call

  // Combine scores with weights based on configuration
  // Rationale:
  // - Recency:  Recent decisions are more likely to be relevant (default weight: 0.3)
  // - Tag Match: Decisions matching current context tags are highly relevant (default weight: 0.4)
  // - Importance: Decisions marked as important should have higher relevance (default weight: 0.2)
  // - Impact: Decisions with significant narrative impact are also more relevant (default weight: 0.1)
  // Weights are configurable via RelevanceConfig interface.
  const weightedScore =
    (recencyScore * config.recencyWeight) +
    (tagMatchScore * config.tagMatchWeight) +
    (importanceScore * config.importanceWeight) +
    (impactScore * config.impactWeight);

  // Convert the combined weighted score to a 0-10 scale and round to one decimal place for readability
  return Math.round(weightedScore * 100) / 10;
}


/**
 * Generate a set of context tags based on current game state
 * 
 * @param location Current location
 * @param characters Characters in the current scene
 * @param themes Current narrative themes
 * @returns Array of context tags
 */
export function generateContextTags(
  location?: LocationType,
  characters: string[] = [],
  themes: string[] = []
): string[] {
  const tags: string[] = [];
  
  // Add location tags
  if (location) {
    tags.push(`location:${location.type}`);
    
    if (location.type === 'town' || location.type === 'landmark') {
      if ('name' in location && location.name) {
        tags.push(`place:${location.name}`);
      }
    }
  }
  
  // Add character tags
  characters.forEach(character => {
    tags.push(`character:${character}`);
  });
  
  // Add theme tags
  themes.forEach(theme => {
    tags.push(`theme:${theme}`);
  });
  
  return tags;
}

/**
 * Filter decisions to return the most relevant ones for the current context
 * 
 * @param decisions Array of all decision records
 * @param currentTags Tags describing current context
 * @param maxDecisions Maximum number of decisions to return
 * @param minScore Minimum relevance score to include (0-10)
 * @returns Array of the most relevant decisions
 */
export function filterMostRelevantDecisions(
  decisions: PlayerDecisionRecord[],
  currentTags: string[] = [],
  maxDecisions: number = 5,
  minScore: number = 3
): PlayerDecisionRecord[] {
  if (!decisions.length) {
    return [];
  }
  
  const currentTimestamp = Date.now();
  
  // Calculate relevance scores for all decisions
  const scoredDecisions = decisions.map(decision => ({
    decision,
    score: calculateRelevanceScore(decision, currentTags, currentTimestamp)
  }));
  
  // Filter by minimum score and sort by relevance (descending)
  return scoredDecisions
    .filter(item => item.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxDecisions)
    .map(item => item.decision);
}

/**
 * Format relevant decisions into a compact representation for AI context
 * 
 * @param decisions Array of relevant decision records
 * @param maxTokens Maximum approximate tokens to use
 * @returns Formatted string for AI context
 */
export function formatDecisionsForAIContext(
  decisions: PlayerDecisionRecord[],
  maxTokens: number = 800
): string {
  if (!decisions.length) {
    return '';
  }
  
  // Estimate tokens - rough heuristic: ~4 chars per token
  const estimatedTokensPerDecision = 100; // Approximate
  const maxDecisions = Math.max(1, Math.floor(maxTokens / estimatedTokensPerDecision));
  
  // Take top N decisions based on token limit
  const topDecisions = decisions.slice(0, maxDecisions);
  
  // Format each decision
  const formattedDecisions = topDecisions.map((record, index) => {
    // Extract basic info
    const { impactDescription } = record;
    
    // Format the decision in a compact way
    return `
Decision ${index + 1}: ${impactDescription}
Context: ${record.narrative.substring(0, 150)}${record.narrative.length > 150 ? '...' : ''}`;
  });
  
  // Combine into a single string with header
  return `
Player's past relevant decisions:
${formattedDecisions.join('\n')}
`.trim();
}

/**
 * Create a compact history representation for efficient use in AI context
 * 
 * @param decisions All player decision records
 * @param currentLocation Current location
 * @param currentCharacters Characters in the current scene
 * @param themes Current narrative themes
 * @param maxDecisions Maximum number of decisions to include
 * @returns Formatted string for AI context
 */
export function createDecisionHistoryContext(
  decisions: PlayerDecisionRecord[],
  currentLocation?: LocationType,
  currentCharacters: string[] = [],
  themes: string[] = [],
  maxDecisions: number = 5
): string {
  // Generate context tags
  const contextTags = generateContextTags(currentLocation, currentCharacters, themes);
  
  // Filter to most relevant decisions
  const relevantDecisions = filterMostRelevantDecisions(
    decisions,
    contextTags,
    maxDecisions
  );
  
  // Format for AI context
  return formatDecisionsForAIContext(relevantDecisions);
}