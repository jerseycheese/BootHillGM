/**
 * Narrative Arc Types
 * 
 * This file defines types related to narrative arcs, branches, and impact systems.
 */

import { Character } from '../character';

/**
 * Represents the accumulated state of decision impacts
 */
export type WorldStateImpactValue = number;

/**
 * Defines the type of impact a decision has on the game world
 */
export type DecisionImpactType =
  | 'reputation'    // Impact on character's reputation
  | 'relationship'  // Impact on relationship with NPCs
  | 'story-arc'     // Impact on story progression
  | 'world-state'   // Impact on the game world state
  | 'character'     // Impact on character development
  | 'inventory';    // Impact on items/resources

/**
 * Defines the severity of a decision impact
 */
export type ImpactSeverity =
  | 'major'     // Significant, long-lasting impact
  | 'moderate'  // Medium-level impact
  | 'minor';    // Small, possibly temporary impact

/**
 * Defines a single impact of a player decision
 */
export interface DecisionImpact {
  id: string;
  type: DecisionImpactType;
  target: string;           // Entity affected (character name, location, etc.)
  severity: ImpactSeverity;
  description: string;      // Human-readable description
  value: number;            // Numeric value/magnitude (-10 to +10)
  duration?: number;        // Duration in milliseconds, undefined = permanent
  conditions?: string[];    // Conditions that might modify this impact
  relatedDecisionIds?: string[]; // IDs of related decisions
}

/**
 * Defines a narrative branch that can be taken based on player choices
 * 
 * @property id - Unique identifier for this branch
 * @property startPoint - Starting StoryPoint ID
 * @property endPoints - Possible ending StoryPoint IDs
 * @property requirements - Optional requirements to access this branch
 * @property isActive - Whether this branch is currently active
 */
export interface NarrativeBranch {
  id: string;
  title: string;
  startPoint: string;
  endPoints: string[];
  requirements?: {
    items?: string[];
    attributes?: Array<{
      attribute: keyof Character['attributes'];
      minValue: number;
    }>;
    visitedPoints?: string[];
  };
  isActive: boolean;
  isCompleted?: boolean;
}

/**
 * Defines a complete narrative arc made up of multiple branches, potentially spanning multiple locations
 * 
 * @property id - Unique identifier for this arc
 * @property title - Title of the narrative arc
 * @property description - Short description
 * @property branches - Array of branches in this arc or references to branch IDs
 * @property startingBranch - ID of the first branch
 * @property isCompleted - Whether this arc has been completed
 */
export interface NarrativeArc {
  id: string;
  title: string;
  description: string;
  branches: NarrativeBranch[];
  startingBranch: string;
  isCompleted: boolean;
}