/**
 * Narrative Context Builder
 * 
 * This utility builds optimized narrative context for AI prompts,
 * with intelligent filtering, prioritization, and compression.
 */

import { NarrativeState, PlayerDecisionRecord, NarrativeContext } from '../../types/narrative.types';
import { 
  NarrativeContextOptions, 
  BuiltNarrativeContext,
  ScoredContextElement,
  ContextElementType,
  CompressedNarrativeEntry,
  CompressionLevel,
  RelevantDecision,
  NarrativeContentBlock,
  ContextBlockType,
  // Import with alias to prefix unused import with underscore
  ContextSection as _ContextSection
} from '../../types/narrative/context.types';
import { calculateRelevanceScore, generateContextTags } from '../decisionRelevanceUtils';
import { formatImpactsForAIContext } from '../decisionImpactUtils';
import { compressNarrativeText, estimateTokenCount } from './narrativeCompression';

/**
 * Default options for narrative context building
 */
const DEFAULT_CONTEXT_OPTIONS: NarrativeContextOptions = {
  maxHistoryEntries: 10,
  maxDecisionHistory: 5,
  includedContextSections: [
    'narrative_history', 
    'decision_history', 
    'character_relationships', 
    'world_state', 
    'story_progression'
  ],
  compressionLevel: 'medium',
  relevanceThreshold: 5,
  prioritizeRecentEvents: true,
  includeWorldState: true,
  includeCharacterRelationships: true,
  maxTokens: 2000,
  tokenAllocation: {
    narrativeHistory: 40,
    decisionHistory: 30,
    worldState: 15,
    relationships: 10,
    storyContext: 5
  }
};

/**
 * Default empty narrative context for fallback
 */
const DEFAULT_NARRATIVE_CONTEXT: NarrativeContext = {
  tone: 'serious',
  characterFocus: [],
  themes: [],
  worldContext: '',
  importantEvents: [],
  storyPoints: {},
  narrativeArcs: {},
  impactState: {
    reputationImpacts: {},
    relationshipImpacts: {},
    worldStateImpacts: {},
    storyArcImpacts: {},
    lastUpdated: Date.now()
  },
  narrativeBranches: {},
  pendingDecisions: [],
  decisionHistory: []
};

/**
 * Type for token allocation percentages
 */
interface TokenAllocation {
  narrativeHistory?: number;
  decisionHistory?: number;
  worldState?: number;
  relationships?: number;
  storyContext?: number;
}

/**
 * Type for block group storage
 */
interface BlockGroups {
  [key: string]: ScoredContextElement[];
}

/**
 * Type for block metadata
 */
interface BlockMetadata {
  elements: number;
  character?: string;
  location?: string;
  [key: string]: unknown;
}

/**
 * Main function to build optimized narrative context for AI
 * 
 * @param state Current narrative state
 * @param options Configuration options for context building
 * @returns Structured, optimized context for AI
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
      relevance: calculateHistoryRelevance(entry.compressed, index, compressedHistory.length),
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

/**
 * Compresses narrative history based on the specified compression level
 * 
 * @param history Array of narrative history entries
 * @param level Compression level to apply
 * @param maxEntries Maximum entries to include (most recent first)
 * @returns Array of compressed narrative entries
 */
export function compressNarrativeHistory(
  history: string[],
  level: CompressionLevel = 'medium',
  maxEntries?: number
): CompressedNarrativeEntry[] {
  // Take the most recent entries first
  const entries = maxEntries ? history.slice(-maxEntries) : [...history];
  
  // Apply appropriate compression
  return entries.map(entry => {
    const compressed = compressNarrativeText(entry, level);
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
 * 
 * @param decisions Array of decision records
 * @param currentTags Tags describing current context
 * @param maxDecisions Maximum number of decisions to return
 * @param minScore Minimum relevance score to include (0-10)
 * @returns Array of relevant decisions with metadata
 */
export function extractRelevantDecisions(
  decisions: PlayerDecisionRecord[],
  currentTags: string[] = [],
  maxDecisions: number = 5,
  minScore?: number
): RelevantDecision[] {
  if (!decisions.length) {
    return [];
  }
  
  const currentTimestamp = Date.now();
  
  // Calculate relevance scores for all decisions
  const scoredDecisions = decisions.map(decision => ({
    decision,
    relevance: calculateRelevanceScore(decision, currentTags, currentTimestamp),
    tokens: estimateTokenCount(formatDecisionForContext(decision))
  }));
  
  // Filter by minimum score if specified
  const filteredDecisions = minScore !== undefined
    ? scoredDecisions.filter(item => item.relevance >= minScore)
    : scoredDecisions;
  
  // Sort by relevance (descending) and take top N
  return filteredDecisions
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, maxDecisions);
}

/**
 * Format decision record for inclusion in context
 */
function formatDecisionForContext(decision: PlayerDecisionRecord): string {
  return `Decision: ${decision.impactDescription}
Context: ${decision.narrative}`;
}

/**
 * Prioritizes context elements based on relevance and recency
 * 
 * @param elements Array of scored context elements
 * @param recencyBoost Whether to boost recently created elements
 * @returns Prioritized array of context elements
 */
export function prioritizeContextElements(
  elements: ScoredContextElement[],
  recencyBoost: boolean = false
): ScoredContextElement[] {
  if (elements.length === 0) {
    return [];
  }
  
  // Clone the array to avoid modifying the original
  const result = [...elements];
  
  // Apply recency boost if specified
  if (recencyBoost) {
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;
    
    // Adjust relevance based on recency
    result.forEach(element => {
      const hoursAgo = (now - element.timestamp) / ONE_HOUR;
      
      // Boost recent elements (within last hour)
      if (hoursAgo < 1) {
        element.relevance += (1 - hoursAgo) * 3; // Up to +3 points for very recent items
      }
      // Slightly boost elements from last 24 hours
      else if (hoursAgo < 24) {
        element.relevance += (24 - hoursAgo) / 24; // Up to +1 point for recent items
      }
    });
  }
  
  // Sort by relevance (descending)
  return result.sort((a, b) => {
    // Primary sort by relevance
    if (b.relevance !== a.relevance) {
      return b.relevance - a.relevance;
    }
    
    // Secondary sort by recency
    return b.timestamp - a.timestamp;
  });
}

/**
 * Allocates tokens to content elements based on priorities and token allocation
 * 
 * @param elements Prioritized list of context elements
 * @param maxTokens Maximum tokens to allocate
 * @param allocation Token allocation percentages
 * @returns Array of content blocks that fit within token budget
 */
function allocateTokensToElements(
  elements: ScoredContextElement[],
  maxTokens: number,
  allocation?: TokenAllocation
): NarrativeContentBlock[] {
  // Default allocation if not provided
  const effectiveAllocation = allocation || {
    narrativeHistory: 40,
    decisionHistory: 30,
    worldState: 15,
    relationships: 10,
    storyContext: 5
  };
  
  // Create mappings from element types to block types
  const typeMapping: Record<ContextElementType, ContextBlockType> = {
    'narrative': 'narrative_history',
    'decision': 'decision',
    'character': 'character',
    'location': 'location',
    'event': 'narrative_history',
    'world_state': 'world_state',
    'story_point': 'story_progression'
  };
  
  // Group elements by block type
  const blockGroups: BlockGroups = {};
  
  elements.forEach(element => {
    const blockType = typeMapping[element.type];
    if (!blockGroups[blockType]) {
      blockGroups[blockType] = [];
    }
    blockGroups[blockType].push(element);
  });
  
  // Calculate token allocations for each block type
  const tokenAllocations: Record<ContextBlockType, number> = {
    'narrative_history': Math.floor((effectiveAllocation.narrativeHistory || 40) * maxTokens / 100),
    'decision': Math.floor((effectiveAllocation.decisionHistory || 30) * maxTokens / 100),
    'world_state': Math.floor((effectiveAllocation.worldState || 15) * maxTokens / 100),
    'character': Math.floor((effectiveAllocation.relationships || 10) * maxTokens / 100),
    'location': Math.floor((effectiveAllocation.worldState || 15) * maxTokens / 100) / 3, // Share with world state
    'story_progression': Math.floor((effectiveAllocation.storyContext || 5) * maxTokens / 100),
    'instruction': Math.floor(maxTokens * 0.05) // Reserve 5% for instructions
  };
  
  // Create content blocks respecting token allocations
  const contentBlocks: NarrativeContentBlock[] = [];
  
  // Process each block type
  Object.entries(blockGroups).forEach(([blockTypeStr, groupElements]) => {
    const blockType = blockTypeStr as ContextBlockType;
    const tokenBudget = tokenAllocations[blockType] || 0;
    
    if (tokenBudget <= 0 || !groupElements.length) {
      return;
    }
    
    // Sort elements by relevance
    const sortedElements = [...groupElements].sort((a, b) => b.relevance - a.relevance);
    
    // Fill until token budget is exhausted
    let remainingTokens = tokenBudget;
    let blockContent = '';
    const blockPriority = getBlockPriority(blockType);
    
    sortedElements.forEach(element => {
      if (element.tokens <= remainingTokens) {
        // Add element if it fits in the budget
        blockContent += (blockContent ? '\n\n' : '') + element.content;
        remainingTokens -= element.tokens;
      }
    });
    
    if (blockContent) {
      contentBlocks.push({
        type: blockType,
        content: blockContent,
        tokens: tokenBudget - remainingTokens,
        priority: blockPriority,
        metadata: { elements: groupElements.length }
      });
    }
  });
  
  // Sort blocks by priority
  return contentBlocks.sort((a, b) => a.priority - b.priority);
}

/**
 * Get priority value for different block types (lower = higher priority)
 */
function getBlockPriority(blockType: ContextBlockType): number {
  switch (blockType) {
    case 'story_progression': return 1;
    case 'world_state': return 2;
    case 'narrative_history': return 3;
    case 'decision': return 4;
    case 'character': return 5;
    case 'location': return 6;
    case 'instruction': return 0; // Instructions always first
    default: return 10;
  }
}

/**
 * Builds structured context from content blocks
 * 
 * @param blocks Array of content blocks
 * @param maxTokens Optional maximum token limit
 * @returns Formatted context string
 */
export function buildStructuredContext(
  blocks: NarrativeContentBlock[],
  maxTokens?: number
): string {
  // Sort blocks by priority if not already done
  const sortedBlocks = [...blocks].sort((a, b) => a.priority - b.priority);
  
  // Format each block with appropriate section headers
  const sectionParts: string[] = [];
  let tokenCount = 0;
  
  sortedBlocks.forEach(block => {
    // Skip if exceeding token limit
    if (maxTokens && tokenCount >= maxTokens) {
      return;
    }
    
    const section = formatBlockAsSection(block);
    const sectionTokens = estimateTokenCount(section);
    
    // Check if adding this section would exceed token limit
    if (maxTokens && tokenCount + sectionTokens > maxTokens) {
      // Skip this section if it doesn't fit completely
      return;
    }
    
    sectionParts.push(section);
    tokenCount += sectionTokens;
  });
  
  // Add an instruction section at the end
  sectionParts.push(`
## Guidance
Use the above context to maintain narrative coherence in your responses. Reference relevant past decisions and events appropriately. Maintain consistent characterization and world state.
  `.trim());
  
  return sectionParts.join('\n\n');
}

/**
 * Format a content block as a section with appropriate header
 */
function formatBlockAsSection(block: NarrativeContentBlock): string {
  const sectionTitles: Record<ContextBlockType, string> = {
    'narrative_history': 'Narrative History',
    'decision': 'Decisions',
    'character': 'Character Relationships',
    'location': 'Locations',
    'world_state': 'World State',
    'story_progression': 'Story Progression',
    'instruction': 'Instructions'
  };
  
  const title = sectionTitles[block.type] || 'Context';
  
  return `## ${title}\n${block.content}`;
}

/**
 * Calculate relevance for narrative history entries
 * 
 * @param entry The text entry
 * @param index Position in history array (higher = more recent)
 * @param totalEntries Total number of entries
 * @returns Relevance score from 0-10
 */
function calculateHistoryRelevance(entry: string, index: number, totalEntries: number): number {
  // Recency weight - more recent entries get higher score
  const recencyScore = (index / totalEntries) * 10;
  
  // Content weight - entries with important markers get higher score
  const contentScore = getContentRelevanceScore(entry);
  
  // Combine scores with weighting (recency: 70%, content: 30%)
  return (recencyScore * 0.7) + (contentScore * 0.3);
}

/**
 * Calculate content relevance based on text analysis
 */
function getContentRelevanceScore(text: string): number {
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
 */
function getCharacterRelationshipValue(character: string, context: NarrativeContext): number {
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

/**
 * Format character info for context
 */
function formatCharacterForContext(
  character: string, 
  relationshipValue: number,
  context: NarrativeContext
): string {
  let result = `${character}: `;
  
  // Add relationship description
  if (relationshipValue !== 0) {
    const relationship = relationshipValue > 0 
      ? `Friendly (${relationshipValue})` 
      : `Hostile (${relationshipValue})`;
    result += relationship;
  } else {
    result += 'Neutral';
  }
  
  // Add relevant events if available
  const relevantEvents = context.importantEvents
    ?.filter(event => event.includes(character));
  
  if (relevantEvents && relevantEvents.length > 0) {
    result += `\nHistory: ${relevantEvents.join('. ')}`;
  }
  
  return result;
}

/**
 * Format story progression for context
 */
function formatStoryProgressionForContext(context: NarrativeContext): string {
  if (!context.storyPoints || Object.keys(context.storyPoints).length === 0) {
    return '';
  }
  
  const parts: string[] = ['Current Story Points:'];
  
  // Filter for significant story points based on the tag
  const significantPoints = Object.values(context.storyPoints)
    .filter(point => point.tags?.includes('major') || point.type === 'revelation');
  
  significantPoints.forEach(point => {
    parts.push(`- ${point.title}: ${point.content}`);
  });
  
  // Include current narrative arc if available
  if (context.currentArcId && context.narrativeArcs && context.narrativeArcs[context.currentArcId]) {
    const currentArc = context.narrativeArcs[context.currentArcId];
    parts.push(`\nCurrent Arc: ${currentArc.title || context.currentArcId}`);
    
    if (currentArc.description) {
      parts.push(currentArc.description);
    }
  }
  
  return parts.join('\n');
}
