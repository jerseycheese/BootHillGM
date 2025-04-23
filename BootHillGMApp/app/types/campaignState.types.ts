/**
 * Types for the Campaign State Management System
 * 
 * This file contains type definitions for the consolidated campaign state
 * management system used throughout the application.
 */

import { GameState } from './gameState';
import { GameAction } from './actions';
import { Character } from './character';
import { InventoryItem } from './item.types';
import { JournalEntry } from './journal';
import { NarrativeContext } from './narrative.types';

/**
 * Interface defining the shape of the CampaignState context
 * This is provided by the CampaignStateManager component
 */
export interface CampaignStateContextType {
  // The complete state tree
  state: GameState;
  
  // Dispatch function for state updates
  dispatch: React.Dispatch<GameAction>;
  
  // Methods for state persistance
  saveGame: () => void;
  loadGame: () => void;
  cleanupState: () => void;
  
  // Convenience accessors (derived state)
  player: Character | null;
  opponent: Character | null;
  inventory: InventoryItem[];
  entries: JournalEntry[];
  isCombatActive: boolean;
  narrativeContext: NarrativeContext | undefined;
}

/**
 * Possible themes for the game UI
 */
export type GameTheme = 'western' | 'dark' | 'light' | 'sepia' | 'custom';

/**
 * Interface for UI settings
 */
export interface UISettings {
  theme: GameTheme;
  fontSize: 'small' | 'medium' | 'large';
  narrativeSpeed: 'slow' | 'medium' | 'fast';
  soundEnabled: boolean;
  musicEnabled: boolean;
  showTutorials: boolean;
  enableCinematicMode: boolean;
  enableDebugTools: boolean;
}

/**
 * Application-level settings that apply across campaigns
 */
export interface AppSettings {
  ui: UISettings;
  aiSettings: {
    model: string;
    temperature: number;
    maxTokens: number;
    apiEndpoint: string;
    customPrompt: string;
  };
  persistenceSettings: {
    autoSaveEnabled: boolean;
    autoSaveInterval: number; // in minutes
    keepBackupCount: number;
    cloudBackupEnabled: boolean;
  };
  debugSettings: {
    showDevTools: boolean;
    logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug' | 'verbose';
    persistLogs: boolean;
  };
}

/**
 * State of campaign-specific attributes
 */
export interface CampaignAttributes {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  lastPlayedAt: number;
  playTime: number;
  difficulty: 'easy' | 'normal' | 'hard' | 'custom';
  tags: string[];
  customAttributes: Record<string, unknown>;
}

/**
 * Campaign progression tracking
 */
export interface CampaignProgress {
  mainProgress: number; // 0-100 percentage
  completedQuests: string[];
  discoveredLocations: string[];
  keyDecisions: Record<string, string>;
  achievements: string[];
  milestones: {
    id: string;
    name: string;
    completed: boolean;
    completedAt?: number;
  }[];
}
