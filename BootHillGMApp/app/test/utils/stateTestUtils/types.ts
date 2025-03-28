/**
 * Type definitions for state testing utilities
 */
import { GameState } from '../../../types/gameState';
import { GameEngineAction } from '../../../types/gameActions';
import { Character } from '../../../types/character';
import { NarrativeContext } from '../../../types/narrative.types';
import { UIState } from '../../../types/state/uiState';
import { InventoryState } from '../../../types/state/inventoryState';
import { JournalState } from '../../../types/state/journalState';

// Type definitions for test journal entries - kept separate from app JournalEntry
export interface TestJournalEntry {
  id?: string;
  title?: string;
  content: string;
  type: 'narrative' | 'combat' | 'inventory' | 'quest';
  timestamp: number;
  questTitle?: string;
  status?: 'started' | 'updated' | 'completed' | 'failed';
  [key: string]: unknown;
}

// Type definition for reducer functions
export type StateReducer<T = Partial<GameState>> = (
  state: T, 
  action: GameEngineAction
) => T;

// Define a better base mock state type with required properties
export interface BaseMockState {
  character: {
    player: Character | null;
    opponent: Character | null;
  };
  combat: {
    isActive: boolean;
    rounds: number;
    [key: string]: unknown;
  };
  inventory: InventoryState;
  journal: JournalState;
  narrative: {
    currentStoryPoint: unknown;
    visitedPoints: unknown[];
    availableChoices: unknown[];
    narrativeHistory: unknown[];
    displayMode: string;
    error: unknown;
    narrativeContext?: NarrativeContext;
  };
  ui: UIState;
  currentPlayer: string;
  npcs: string[];
  location: unknown;
  quests: string[];
  gameProgress: number;
  suggestedActions: unknown[];
}

// Augment existing Jest types with ES2015 module syntax
declare global {
  export interface JestMatchers<R> {
    toHaveItems(count: number): R;
    toHaveJournalEntries(count: number): R;
    toHaveCombatActive(): R;
  }
}