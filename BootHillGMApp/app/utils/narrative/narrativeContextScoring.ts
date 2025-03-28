/**
 * Narrative Context Scoring
 * 
 * Utilities for scoring and evaluating narrative context elements
 * to determine relevance and priority for inclusion in AI context.
 */

import { NarrativeContext } from '../../types/narrative.types';

/**
 * Calculate relevance for narrative history entries
 * 
 * @param entry - The text entry to evaluate
 * @param index - Position in history array (higher = more recent)
 * @param totalEntries - Total number of entries in the history
 * @returns Relevance score from 0-10
 */
export function calculateHistoryRelevance(entry: string, index: number, totalEntries: number): number {
  // Recency weight - more recent entries get higher score
  const recencyScore = (index / totalEntries) * 10;
  
  // Content weight - entries with important markers get higher score
  const contentScore = getContentRelevanceScore(entry);
  
  // Combine scores with weighting (recency: 70%, content: 30%)
  return (recencyScore * 0.7) + (contentScore * 0.3);
}

/**
 * Calculate content relevance based on text analysis
 * 
 * @param text - Text content to analyze
 * @returns Relevance score from 0-10
 */
export function getContentRelevanceScore(text: string): number {
  let score = 5; // Base score
  
  // Increase score for entries that mention characters
  if (/Sheriff|Marshall|Pete|John|[A-Z][a-z]+ [A-Z][a-z]+/.test(text)) {
    score += 1;
  }
  
  // Increase score for entries with dialogue (likely important conversation)
  if (/"[^"]+"|'[^']+'/.test(text)) {
    score += 1;
  }
  
  // Increase score for entries with action/combat words
  if (/shoot|fight|attack|defend|run|chase|escape|hiding|ambush/.test(text)) {
    score += 1;
  }
  
  // Increase score for entries with decision markers
  if (/decide|choice|option|chose|elect|pick|select/.test(text)) {
    score += 1;
  }
  
  // Increase score for entries mentioning important objects
  if (/gun|rifle|revolver|pistol|knife|gold|money|treasure|map|badge/.test(text)) {
    score += 0.5;
  }
  
  return Math.min(score, 10); // Cap at 10
}

/**
 * Get character relationship value from context
 * 
 * @param character - Character name to look up
 * @param context - Narrative context with relationship data
 * @returns Relationship value (-10 to 10) or 0 if not found
 */
export function getCharacterRelationshipValue(character: string, context: NarrativeContext): number {
  if (!context.impactState?.relationshipImpacts) {
    return 0;
  }
  
  // Check player's relationship with this character
  const playerRelationships = context.impactState.relationshipImpacts['player'];
  if (playerRelationships && typeof playerRelationships[character] === 'number') {
    return playerRelationships[character];
  }
  
  return 0;
}