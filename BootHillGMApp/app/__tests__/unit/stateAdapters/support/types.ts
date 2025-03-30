/**
 * Test Type Definitions
 * 
 * Contains interface definitions used in state adapter tests.
 */

import { InventoryItem } from '../../../../types/item.types';
import { CombatType } from '../../../../types/combat';
import { JournalEntry } from '../../../../types/journal';

/**
 * Partial state with inventory slice
 */
export interface PartialGameStateWithInventory {
  inventory?: {
    items: InventoryItem[];
  };
}

/**
 * Partial state with journal slice
 */
export interface PartialGameStateWithJournal {
  journal?: {
    entries: Array<{
      id: string;
      title: string;
      content?: string;
      timestamp?: number;
    }>;
  };
}

/**
 * Partial state with combat slice
 */
export interface PartialGameStateWithCombat {
  combat?: {
    isActive: boolean;
    rounds?: number;
    currentTurn?: string;
    combatType?: CombatType;
    playerTurn?: boolean;
    playerCharacterId?: string;
    opponentCharacterId?: string;
    combatLog?: unknown[];
    roundStartTime?: number;
    modifiers?: {
      player: number;
      opponent: number;
    };
  };
}

/**
 * Partial state with narrative slice
 */
export interface PartialGameStateWithNarrative {
  narrative?: {
    narrativeContext?: {
      location: string;
      time?: string;
    };
    currentStoryPoint?: unknown;
    visitedPoints?: string[];
    availableChoices?: unknown[];
    narrativeHistory?: string[];
    displayMode?: string;
  };
}

/**
 * Legacy state format type
 */
export interface LegacyState {
  player?: { id: string; name: string } | null;
  opponent?: { id: string; name: string } | null;
  inventory?: InventoryItem[];
  entries?: Array<{ id: string; title: string; content?: string; timestamp?: number }>;
  isCombatActive?: boolean;
  combatRounds?: number;
  currentTurn?: string;
  narrativeContext?: { location: string; time?: string } | null;
  currentScene?: string;
  dialogues?: Array<{ id: string; text: string }>;
  activeTab?: string;
  isMenuOpen?: boolean;
  notifications?: unknown[];
  [key: string]: unknown;
}

/**
 * Inventory with array-like behavior
 */
export interface InventoryArrayLike {
  items: InventoryItem[];
  length: number;
  find: <T>(fn: (item: InventoryItem) => boolean) => T | undefined;
  filter: (fn: (item: InventoryItem) => boolean) => InventoryItem[];
  some: (fn: (item: InventoryItem) => boolean) => boolean;
  map: <T>(fn: (item: InventoryItem) => T) => T[];
  forEach: (fn: (item: InventoryItem) => void) => void;
  reduce: <T>(fn: (acc: T, item: InventoryItem) => T, initial: T) => T;
  [index: number]: InventoryItem; // This allows numeric indexing
  [Symbol.iterator]: () => Iterator<InventoryItem>;
}

/**
 * Journal entries with array-like behavior
 */
export interface JournalEntriesArrayLike {
  length: number;
  find: (fn: (entry: JournalEntry) => boolean) => JournalEntry | undefined;
  filter: (fn: (entry: JournalEntry) => boolean) => JournalEntry[];
  [index: number]: JournalEntry;
  [Symbol.iterator]: () => Iterator<JournalEntry>;
}

// Adding a dummy test to prevent Jest error about empty test suites
if (process.env.NODE_ENV === 'test') {
  describe('Types', () => {
    test('exists only to make Jest happy', () => {
      expect(true).toBe(true);
    });
  });
}