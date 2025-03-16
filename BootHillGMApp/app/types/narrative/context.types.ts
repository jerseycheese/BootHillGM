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
  characterFocus: string[];
  themes: string[];
  worldContext: string;
  importantEvents: string[];
  storyPoints: Record<string, StoryPoint>;
  narrativeArcs: Record<string, NarrativeArc>;
  impactState: ImpactState;
  narrativeBranches: Record<string, NarrativeBranch>;
  currentArcId?: string;
  currentBranchId?: string;

  // Decision tracking
  activeDecision?: PlayerDecision;
  pendingDecisions: PlayerDecision[];
  decisionHistory: PlayerDecisionRecord[]; // Replaces playerChoices
}