/**
 * Narrative Context Builder
 * 
 * This utility builds optimized narrative context for AI prompts,
 * with intelligent filtering, prioritization, and compression.
 */

import { NarrativeState } from '../../types/narrative.types';
import { 
  NarrativeContextOptions, 
  BuiltNarrativeContext,
  ScoredContextElement
} from '../../types/narrative/context.types';
import { generateContextTags } from '../decisionRelevanceUtils';
import { formatImpactsForAIContext } from '../decisionImpactUtils';
import { estimateTokenCount } from './narrativeCompression';
import { 
  DEFAULT_CONTEXT_OPTIONS, 
  DEFAULT_NARRATIVE_CONTEXT 
} from './narrativeContextDefaults';
import { 
  compressNarrativeHistory, 
  extractRelevantDecisions 
} from './narrativeContextProcessors';
import { prioritizeContextElements } from './narrativeContextPrioritization';
import { 
  formatDecisionForContext, 
  formatCharacterForContext, 
  formatStoryProgressionForContext 
} from './narrativeContextFormatters';
import { 
  getCharacterRelationshipValue, 
  calculateHistoryRelevance 
} from './narrativeContextScoring';
import { BlockMetadata } from './narrativeContextTypes';
import { 
  allocateTokensToElements, 
  buildStructuredContext 
} from './narrativeContextTokens';

/**
 * Main function to build optimized narrative context for AI
 * 
 * @param state - Current narrative state
 * @param options - Configuration options for context building
 * @returns Structured, optimized context for AI interactions
 */
export function buildNarrativeContext(
  state: NarrativeState,
  options: NarrativeContextOptions = {}
): BuiltNarrativeContext {
  // Start timing for performance measurement
  const startTime = performance.now();
  
  // Merge options with defaults
  const effectiveOptions = {
    ...DEFAULT_CONTEXT_OPTIONS,
    ...options
  };
  
  // Extract relevant state properties
  const { narrativeHistory } = state;
  
  // Use the default narrative context for fallback
  const narrativeContext = state.narrativeContext || DEFAULT_NARRATIVE_CONTEXT;
  
  // Generate context tags for relevance scoring
  const contextTags = generateContextTags(
    undefined, // Will be replaced with actual location when available
    narrativeContext.characterFocus,
    narrativeContext.themes
  );
  
  // STEP 1: Compress narrative history if needed
  const compressedHistory = compressNarrativeHistory(
    narrativeHistory,
    effectiveOptions.compressionLevel || 'medium',
    effectiveOptions.maxHistoryEntries
  );
  
  // STEP 2: Extract relevant decisions
  const relevantDecisions = narrativeContext.decisionHistory 
    ? extractRelevantDecisions(
        narrativeContext.decisionHistory,
        contextTags,
        effectiveOptions.maxDecisionHistory || 5,
        effectiveOptions.relevanceThreshold
      )
    : [];
  
  // STEP 3: Create context elements and score them
  const contextElements: ScoredContextElement[] = [];
  
  // Add narrative history elements
  compressedHistory.forEach((entry, index) => {
    contextElements.push({
      id: `narrative-${index}`,
      content: entry.compressed,
      relevance: calculateHistoryRelevance(
        entry.compressed, 
        index, 
        compressedHistory.length
      ),
      timestamp: Date.now() - ((compressedHistory.length - index) * 10000), // Approximate timestamps
      type: 'narrative',
      tokens: entry.tokens.compressed
    });
  });
  
  // Add decision elements
  relevantDecisions.forEach(decision => {
    contextElements.push({
      id: `decision-${decision.decision.decisionId}`,
      content: formatDecisionForContext(decision.decision),
      relevance: decision.relevance,
      timestamp: decision.decision.timestamp,
      type: 'decision',
      tokens: decision.tokens
    });
  });
  
  // Add character elements if relevant
  if (narrativeContext.characterFocus && 
      (effectiveOptions.includedContextSections?.includes('character_relationships') || 
       effectiveOptions.includeCharacterRelationships)) {
    narrativeContext.characterFocus.forEach((character, index) => {
      const relationshipValue = getCharacterRelationshipValue(character, narrativeContext);
      contextElements.push({
        id: `character-${index}`,
        content: formatCharacterForContext(character, relationshipValue, narrativeContext),
        relevance: 7, // Base relevance for characters
        timestamp: Date.now(),
        type: 'character',
        tokens: estimateTokenCount(character) + 20 // Rough estimate
      });
    });
  }
  
  // Add world state elements if relevant
  if (narrativeContext.impactState && 
      (effectiveOptions.includedContextSections?.includes('world_state') || 
       effectiveOptions.includeWorldState)) {
    const worldStateContent = formatImpactsForAIContext(narrativeContext.impactState);
    if (worldStateContent) {
      contextElements.push({
        id: 'world-state',
        content: worldStateContent,
        relevance: 8, // High relevance for world state
        timestamp: Date.now(),
        type: 'world_state',
        tokens: estimateTokenCount(worldStateContent)
      });
    }
  }
  
  // Add story progression elements if available
  if (narrativeContext.storyPoints && Object.keys(narrativeContext.storyPoints).length > 0) {
    const storyProgressionContent = formatStoryProgressionForContext(narrativeContext);
    contextElements.push({
      id: 'story-progression',
      content: storyProgressionContent,
      relevance: 9, // Very high relevance for story progression
      timestamp: Date.now(),
      type: 'story_point',
      tokens: estimateTokenCount(storyProgressionContent)
    });
  }
  
  // STEP 4: Prioritize and filter context elements
  const prioritizedElements = prioritizeContextElements(
    contextElements, 
    effectiveOptions.prioritizeRecentEvents
  );
  
  // STEP 5: Allocate tokens and build content blocks
  const contentBlocks = allocateTokensToElements(
    prioritizedElements,
    effectiveOptions.maxTokens || 2000,
    effectiveOptions.tokenAllocation
  );
  
  // STEP 6: Build structured context
  const formattedContext = buildStructuredContext(contentBlocks);
  
  // Calculate statistics and metadata
  const tokenEstimate = contentBlocks.reduce((sum, block) => sum + block.tokens, 0);
  const originalTokens = contextElements.reduce((sum, elem) => sum + elem.tokens, 0);
  const compressionRatio = originalTokens > 0 ? 1 - (tokenEstimate / originalTokens) : 0;
  
  // Extract included elements for reporting
  const includedCharacters = contentBlocks
    .filter(block => block.type === 'character')
    .map(block => (block.metadata as BlockMetadata | undefined)?.character || '')
    .filter(Boolean);
  
  const includedLocations = contentBlocks
    .filter(block => block.type === 'location')
    .map(block => (block.metadata as BlockMetadata | undefined)?.location || '')
    .filter(Boolean);
  
  const narrativeEntries = contentBlocks.filter(block => block.type === 'narrative_history').length;
  const decisionEntries = contentBlocks.filter(block => block.type === 'decision').length;
  
  // Collect relevance scores for reporting
  const relevanceScores: Record<string, number> = {};
  prioritizedElements.forEach(elem => {
    relevanceScores[elem.id] = elem.relevance;
  });
  
  // Build the final result
  const result: BuiltNarrativeContext = {
    formattedContext,
    tokenEstimate,
    includedElements: {
      historyEntries: narrativeEntries,
      decisions: decisionEntries,
      characters: includedCharacters,
      locations: includedLocations,
      recentEvents: narrativeContext.importantEvents || []
    },
    metadata: {
      compressionRatio,
      buildTime: performance.now() - startTime,
      relevanceScores
    }
  };
  
  return result;
}