/**
 * State Types
 * 
 * Defines the types for the application state.
 */

// Import the CombatTurn interface and CombatType to ensure consistency
import { CombatTurn } from './combatState';
import { CombatType } from '../combat';

// Forward declarations to avoid circular dependencies
export interface InventoryState {
  items: Array<{
    id: string;
    name: string;
    type: string;
    [key: string]: unknown; // Allow for additional properties
  }>;
}

export interface JournalState {
  entries: Array<{
    id: string;
    title: string;
    content: string;
    timestamp: number;
    [key: string]: unknown; // Allow for additional properties
  }>;
}

export interface NarrativeState {
  context: {
    location?: string;
    time?: string;
    mood?: string;
    [key: string]: unknown; // Allow for additional properties
  } | null;
  currentScene: string | null;
  dialogues: Array<{
    id: string;
    speaker: string;
    text: string;
    [key: string]: unknown; // Allow for additional properties
  }>;
}

/**
 * Character state
 */
export interface CharacterState {
  player: {
    id?: string;
    name?: string;
    strength?: number;
    health?: number;
    maxHealth?: number;
    [key: string]: unknown; // Allow for additional properties
  } | null;
  opponent: {
    id?: string;
    name?: string;
    strength?: number;
    health?: number;
    maxHealth?: number;
    [key: string]: unknown; // Allow for additional properties
  } | null;
}

/**
 * Combat state - aligned with combatState.ts
 */
export interface CombatState {
  isActive: boolean;
  combatType: CombatType;
  rounds: number;
  playerTurn: boolean;
  playerCharacterId: string;
  opponentCharacterId: string;
  combatLog: Array<{
    text: string;
    timestamp: number;
    type?: 'action' | 'result' | 'system';
    data?: Record<string, unknown>;
  }>;
  roundStartTime: number;
  modifiers: {
    player: number;
    opponent: number;
  };
  currentTurn: CombatTurn | null;
}

/**
 * UI state
 */
export interface UIState {
  activeTab: string;
  isMenuOpen: boolean;
  notifications: Array<{
    id: string;
    message: string;
    type: string;
    [key: string]: unknown; // Allow for additional properties
  }>;
  [key: string]: unknown; // Allow for additional properties
}

/**
 * Game state
 */
export interface GameState {
  character: CharacterState;
  inventory: InventoryState;
  journal: JournalState;
  combat: CombatState;
  narrative: NarrativeState;
  ui: UIState;
  version?: number;
  
  // Legacy properties for backward compatibility
  player?: unknown;
  opponent?: unknown;
  isCombatActive?: boolean;
  narrativeContext?: unknown;
  entries?: unknown[];
  [key: string]: unknown; // Allow for additional properties
}