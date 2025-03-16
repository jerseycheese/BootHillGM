/**
 * Story Progression Types
 * 
 * This file defines types related to story progression tracking and management.
 */

import { LocationType } from '../../services/locationService';

/**
 * Represents the significance of a story point in the narrative
 */
export type StoryPointSignificance = 'major' | 'minor' | 'background' | 'character' | 'milestone';

/**
 * Represents a single point in the story progression
 */
export interface StoryProgressionPoint {
  id: string;
  title: string;
  description: string;
  significance: StoryPointSignificance;
  characters: string[]; // Character IDs involved
  timestamp: number;
  location?: LocationType;
  aiGenerated: boolean;
  tags: string[]; // Tags for categorizing and filtering story points
  previousPoint?: string; // ID of the previous story point, if any
}

/**
 * Data structure for tracking story progression
 */
export interface StoryProgressionState {
  currentPoint: string | null;
  progressionPoints: Record<string, StoryProgressionPoint>;
  mainStorylinePoints: string[]; // IDs of main story points in order
  branchingPoints: Record<string, string[]>; // Branch ID -> Points in branch
  lastUpdated: number;
}

/**
 * Input data for creating a story progression point
 */
export interface StoryProgressionData {
  currentPoint?: string | null;
  title?: string;
  description?: string;
  significance?: StoryPointSignificance;
  characters?: string[];
  tags?: string[]; // Optional tags for the story point
  isMilestone?: boolean; // Whether this is a major milestone in the story
}
