/**
 * Campaign Types
 * 
 * This file defines types for campaign and quest management
 */

import { GameState } from './gameState';

/**
 * Action type definition for suggested actions
 */
export type ActionType = 'main' | 'side' | 'optional' | 'combat' | 'basic' | 'interaction' | 'chaotic' | 'danger';

/**
 * Suggested actions that the game might propose to the player
 */
export interface SuggestedAction {
  id: string;
  title: string;
  description: string;
  type: ActionType;
  condition?: (state: GameState) => boolean;
  reward?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  location?: string;
  timeEstimate?: string;
}

/**
 * Quest type definition for more structured quest management
 */
export interface Quest {
  id: string;
  title: string;
  description: string;
  stages: QuestStage[];
  isActive: boolean;
  isCompleted: boolean;
  rewardDescription: string;
  rewardFunction?: (state: GameState) => GameState;
  failureCondition?: (state: GameState) => boolean;
  failureDescription?: string;
}

/**
 * Individual stage within a quest
 */
export interface QuestStage {
  id: string;
  description: string;
  isCompleted: boolean;
  completionCondition?: (state: GameState) => boolean;
  locationHint?: string;
  npcHint?: string;
}

/**
 * Campaign state (legacy model - now moved to slice-based approach)
 * Kept for reference during transition
 */
export interface CampaignState {
  name: string;
  description: string;
  currentChapter: number;
  chapters: CampaignChapter[];
  activeQuests: Quest[];
  completedQuests: Quest[];
  failedQuests: Quest[];
  worldFlags: Record<string, boolean>;
  reputation: Record<string, number>;
  timeline: CampaignEvent[];
}

/**
 * Chapters within a campaign
 */
export interface CampaignChapter {
  id: number;
  title: string;
  description: string;
  introNarrative: string;
  mainQuests: Quest[];
  sideQuests: Quest[];
  isCompleted: boolean;
  completionCondition?: (state: GameState) => boolean;
}

/**
 * Events that have occurred in the campaign timeline
 */
export interface CampaignEvent {
  id: string;
  title: string;
  description: string;
  timestamp: number;
  location?: string;
  relatedQuests?: string[];
  relatedNPCs?: string[];
  importance: 'minor' | 'major' | 'critical';
}