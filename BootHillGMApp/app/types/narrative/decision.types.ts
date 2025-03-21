/**
 * Decision Types
 * 
 * This file defines types related to player decisions in the narrative.
 */

import { LocationType } from '../../services/locationService';
import { DecisionImpact } from './arc.types';

/**
 * Defines the importance level of a player decision
 */
export type DecisionImportance =
  | 'critical'    // Major story-affecting decision
  | 'significant' // Important but not story-changing decision
  | 'moderate'    // Medium-impact decision
  | 'minor';      // Small or flavor decision

/**
 * Defines a single option in a player decision
 */
export interface PlayerDecisionOption {
  id: string;
  text: string;
  impact: string;
  tags?: string[];
}

/**
 * Defines a decision point presented to the player
 * 
 * @property id - Unique identifier for the decision
 * @property prompt - Text prompt describing the decision
 * @property timestamp - When the decision was presented
 * @property location - Where the decision took place
 * @property options - Available options for this decision
 * @property context - The narrative context when this decision was presented
 * @property importance - How significant this decision is
 * @property characters - Characters involved in this decision
 * @property aiGenerated - Whether this was generated by AI or predefined
 */
export interface PlayerDecision {
  id: string;
  prompt: string;
  timestamp: number;
  location?: LocationType;
  options: PlayerDecisionOption[];
  context: string;
  importance: DecisionImportance;
  characters?: string[];
  aiGenerated: boolean;
}

/**
 * Defines a record of a player's decision
 * 
 * @property decisionId - Reference to the original decision
 * @property selectedOptionId - ID of the option that was chosen
 * @property timestamp - When the decision was made
 * @property narrative - The narrative response after the decision
 * @property impactDescription - Description of the impact
 * @property tags - Tags for categorization and filtering
 * @property relevanceScore - Dynamically calculated score (0-10)
 * @property expirationTimestamp - Optional timestamp when this decision becomes less relevant
 */
export interface PlayerDecisionRecord {
  decisionId: string;
  selectedOptionId: string;
  timestamp: number;
  narrative: string;
  impactDescription: string;
  tags: string[];
  relevanceScore: number;
  expirationTimestamp?: number;
}

/**
 * Extended PlayerDecisionRecord with impact metadata
 */
export interface PlayerDecisionRecordWithImpact extends PlayerDecisionRecord {
  impacts: DecisionImpact[];
  processedForImpact: boolean; // Flag to track if impact processing has occurred
  lastImpactUpdate: number;    // Timestamp of last impact update
}