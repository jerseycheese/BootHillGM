/**
 * Narrative Context Processors
 * 
 * Utility functions for processing narrative context elements
 * such as compression and relevance filtering.
 */

import { PlayerDecisionRecord } from '../../types/narrative.types';
import { 
  CompressedNarrativeEntry,
  CompressionLevel,
  RelevantDecision
} from '../../types/narrative/context.types';
import { calculateRelevanceScore } from '../decisionRelevanceUtils';
import { compressNarrativeText, estimateTokenCount } from './narrativeCompression';
import { formatDecisionForContext } from './narrativeContextFormatters';

/**
 * Create an empty compressed entry object
 * Used as fallback for undefined entries
 */
function createEmptyCompressedEntry(): CompressedNarrativeEntry {
  return {
    original: '',
    compressed: '',
    compressionRatio: 0,
    tokens: {
      original: 0,
      compressed: 0
    }
  };
}

/**
 * Compresses narrative history based on the specified compression level
 * 
 * @param history - Array of narrative history entries
 * @param level - Compression level to apply
 * @param maxEntries - Maximum entries to include (most recent first)
 * @returns Array of compressed narrative entries with metadata
 */
export function compressNarrativeHistory(
  history: string[],
  level: CompressionLevel = 'medium',
  maxEntries?: number
): CompressedNarrativeEntry[] {
  if (!history || history.length === 0) {
    return [];
  }
  
  // Validate compression level
  const validLevel = ['none', 'low', 'medium', 'high'].includes(level) 
    ? level 
    : 'medium';
  
  // Take the most recent entries first
  const entries = maxEntries && maxEntries > 0 
    ? history.slice(-maxEntries) 
    : [...history];
  
  // Apply appropriate compression
  return entries.map(entry => {
    if (!entry) return createEmptyCompressedEntry(); // Now defined before call
    
    const compressed = compressNarrativeText(entry, validLevel);
    const originalTokens = estimateTokenCount(entry);
    const compressedTokens = estimateTokenCount(compressed);
    
    return {
      original: entry,
      compressed,
      compressionRatio: originalTokens > 0 ? 1 - (compressedTokens / originalTokens) : 0,
      tokens: {
        original: originalTokens,
        compressed: compressedTokens
      }
    };
  });
}


/**
 * Extracts relevant decisions from the decision history
 * based on context tags and relevance scoring
 * 
 * @param decisions - Array of decision records
 * @param currentTags - Tags describing current context
 * @param maxDecisions - Maximum number of decisions to return
 * @param minScore - Minimum relevance score to include (0-10)
 * @returns Array of relevant decisions with metadata
 */
export function extractRelevantDecisions(
  decisions: PlayerDecisionRecord[],
  currentTags: string[] = [],
  maxDecisions: number = 5,
  minScore?: number
): RelevantDecision[] {
  if (!decisions || decisions.length === 0) {
    return [];
  }
  
  const currentTimestamp = Date.now();
  const safeTags = Array.isArray(currentTags) ? currentTags : [];
  
  // Calculate relevance scores for all decisions
  const scoredDecisions = decisions.map(decision => ({
    decision,
    relevance: calculateRelevanceScore(decision, safeTags, currentTimestamp),
    tokens: estimateTokenCount(formatDecisionForContext(decision))
  }));
  
  // Filter by minimum score if specified
  const filteredDecisions = minScore !== undefined && !isNaN(minScore)
    ? scoredDecisions.filter(item => item.relevance >= minScore)
    : scoredDecisions;
  
  // Ensure maxDecisions is valid
  const safeMaxDecisions = maxDecisions > 0 ? maxDecisions : 5;
  
  // Sort by relevance (descending) and take top N
  return filteredDecisions
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, safeMaxDecisions);
}