/**
 * Narrative Context Defaults
 * 
 * Default values and settings for narrative context
 */

import { NarrativeContext } from '../../types/narrative.types';
import { NarrativeContextOptions } from '../../types/narrative/context.types';

/**
 * Default options for narrative context building
 * These values are used when specific options aren't provided
 */
export const DEFAULT_CONTEXT_OPTIONS: NarrativeContextOptions = {
  // Maximum number of history entries to include
  maxHistoryEntries: 10,
  
  // Maximum number of decisions to include
  maxDecisionHistory: 5,
  
  // Which sections to include in the context
  includedContextSections: [
    'narrative_history', 
    'decision_history', 
    'character_relationships', 
    'world_state', 
    'story_progression'
  ],
  
  // Default compression level for narrative text
  compressionLevel: 'medium',
  
  // Minimum relevance score (0-10) to include an element
  relevanceThreshold: 5,
  
  // Whether to boost recently created elements
  prioritizeRecentEvents: true,
  
  // Whether to include world state information
  includeWorldState: true,
  
  // Whether to include character relationship information
  includeCharacterRelationships: true,
  
  // Maximum tokens to allocate across all sections
  maxTokens: 2000,
  
  // Token allocation percentages
  tokenAllocation: {
    narrativeHistory: 40,  // 40% to narrative history
    decisionHistory: 30,   // 30% to decision history
    worldState: 15,        // 15% to world state
    relationships: 10,     // 10% to character relationships
    storyContext: 5        // 5% to story context
  }
};

/**
 * Default empty narrative context for fallback
 * Used when no narrative context is provided
 */
export const DEFAULT_NARRATIVE_CONTEXT: NarrativeContext = {
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