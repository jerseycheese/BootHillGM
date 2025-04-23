/**
 * Narrative Context Types
 * 
 * This file defines types related to narrative context and state.
 */

import { StoryPoint } from './story-point.types';
import { NarrativeArc, NarrativeBranch } from './arc.types';
import { PlayerDecision, PlayerDecisionRecord } from './decision.types';

/**
 * Represents the accumulated state of decision impacts
 */
export type WorldStateImpactValue = number;

/**
 * Interface for tracking impact state on the game world
 */
export interface ImpactState {
  reputationImpacts: Record<string, number>; // Character -> reputation value
  relationshipImpacts: Record<string, Record<string, number>>; // Character -> Target -> value
  worldStateImpacts: Record<string, WorldStateImpactValue>; // Key -> value for world state changes
  storyArcImpacts: Record<string, number>; // Story arc ID -> progression value
  lastUpdated: number; // Timestamp of last update
}

/**
 * Comprehensive context for the narrative system
 */
export interface NarrativeContext {
  tone?: 'serious' | 'lighthearted' | 'tense' | 'mysterious';
  characterFocus?: string[];
  themes?: string[];
  worldContext?: string;
  importantEvents?: string[];
  storyPoints?: Record<string, StoryPoint>;
  narrativeArcs?: Record<string, NarrativeArc>;
  impactState?: ImpactState;
  narrativeBranches?: Record<string, NarrativeBranch>;
  currentArcId?: string;
  currentBranchId?: string;

  // Decision tracking
  activeDecision?: PlayerDecision;
  pendingDecisions?: PlayerDecision[];
  decisionHistory: PlayerDecisionRecord[]; // Replaces playerChoices
  
  // Recent narrative context - added for issue #210 fix
  recentEvents?: string;

  // Location information - added to fix type errors
  location?: {
    type: 'town' | 'wilderness' | 'landmark';
    name?: string;
    description?: string;
  };
  
  // Additional properties used in tests
  currentTags?: string[];
  sceneType?: string;
}

/**
 * Compression levels for narrative text
 */
export type CompressionLevel = 'none' | 'low' | 'medium' | 'high';

/**
 * Options for narrative context building
 */
export interface NarrativeContextOptions {
  maxHistoryEntries?: number;
  maxDecisionHistory?: number;
  includedContextSections?: ContextSection[];
  compressionLevel?: CompressionLevel;
  relevanceThreshold?: number;
  prioritizeRecentEvents?: boolean;
  includeWorldState?: boolean;
  includeCharacterRelationships?: boolean;
  includeLore?: boolean;
  focusTags?: string[];

  maxTokens?: number;
  tokenAllocation?: {
    narrativeHistory?: number;
    decisionHistory?: number;
    worldState?: number;
    relationships?: number;
    storyContext?: number;
    lore?: number; // New token allocation for lore
  };
}

/**
 * Context section types
 */
export type ContextSection = 
  'narrative_history' | 
  'decision_history' | 
  'character_relationships' | 
  'world_state' | 
  'story_progression' |
  'lore'; // New section type for lore

/**
 * Element types for context building
 */
export type ContextElementType = 
  'narrative' | 
  'decision' | 
  'character' | 
  'location' | 
  'event' | 
  'world_state' | 
  'story_point' |
  'lore'; // New element type for lore

/**
 * Types of content blocks
 */
export type ContextBlockType = 
  'narrative_history' | 
  'decision' | 
  'character' | 
  'location' | 
  'world_state' | 
  'story_progression' | 
  'instruction' |
  'lore'; // New block type for lore

/**
 * Interface for narrative content blocks
 */
export interface NarrativeContentBlock {
  type: ContextBlockType;
  content: string;
  tokens: number;
  priority: number;
  metadata: Record<string, unknown>;
}

/**
 * Compressed narrative entry
 */
export interface CompressedNarrativeEntry {
  original: string;
  compressed: string;
  compressionRatio: number;
  tokens: {
    original: number;
    compressed: number;
  };
}

/**
 * Relevant decision with metadata
 */
export interface RelevantDecision {
  decision: PlayerDecisionRecord;
  relevance: number;
  tokens: number;
}

/**
 * Element with relevance score
 */
export interface ScoredContextElement {
  id: string;
  content: string;
  relevance: number;
  timestamp: number;
  type: ContextElementType;
  tokens: number;
}

/**
 * Results of narrative context building
 */
export interface BuiltNarrativeContext {
  formattedContext: string;
  tokenEstimate: number;
  includedElements: {
    historyEntries: number;
    decisions: number;
    characters: string[];
    locations: string[];
    recentEvents: string[];
    loreFacts?: number; // New field for lore facts
  };
  metadata: {
    compressionRatio: number;
    buildTime: number;
    relevanceScores: Record<string, number>;
  };
}

/**
 * Narrative summary structure
 */
export interface NarrativeSummary {
  summary: string;
  keyPoints: string[];
  characterMentions: Record<string, number>;
  tokenCount: number;
  compressionRatio: number;
}