/**
 * Type definitions for state testing utilities
 */
import { GameState } from '../../../types/gameState';
import { GameEngineAction } from '../../../types/gameActions';
import { Character } from '../../../types/character';
// Import specific types needed for BaseMockState.narrative
import {
  NarrativeContext,
  StoryPoint,
  NarrativeChoice,
  NarrativeDisplayMode,
  NarrativeErrorInfo
} from '../../../types/narrative.types';
import { UIState } from '../../../types/state/uiState';
import { InventoryState } from '../../../types/state/inventoryState';
import { JournalState } from '../../../types/state/journalState';
import { LocationType } from '../../../services/locationService'; // Import LocationType
import { SuggestedAction } from '../../../types/campaign'; // Import SuggestedAction

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
    // Update types to match NarrativeState
    currentStoryPoint: StoryPoint | null;
    visitedPoints: string[];
    availableChoices: NarrativeChoice[];
    narrativeHistory: string[];
    displayMode: NarrativeDisplayMode;
    error: NarrativeErrorInfo | null;
    narrativeContext?: NarrativeContext;
  };
  ui: UIState;
  currentPlayer: string;
  npcs: string[];
  location: LocationType | null; // Update location type
  quests: string[];
  gameProgress: number;
  suggestedActions: SuggestedAction[]; // Update suggestedActions type
}

// Augment existing Jest types with ES2015 module syntax
declare global {
  export interface JestMatchers<R> {
    toHaveItems(count: number): R;
    toHaveJournalEntries(count: number): R;
    toHaveCombatActive(): R;
  }
}