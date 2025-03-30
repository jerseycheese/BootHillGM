/**
 * Helpers
 * 
 * Helper functions and type guards for state adapter tests.
 */

import { 
  InventoryArrayLike, 
  JournalEntriesArrayLike 
} from './types';

/**
 * Type guard for checking if inventory has array methods
 */
export function hasArrayMethods(obj: unknown): obj is { inventory: InventoryArrayLike } {
  return obj !== null && 
         typeof obj === 'object' && 
         'inventory' in obj && 
         obj.inventory !== null &&
         typeof obj.inventory === 'object' && 
         'find' in obj.inventory &&
         'filter' in obj.inventory;
}

/**
 * Type guard for checking if entries have array methods
 */
export function hasEntriesArray(obj: unknown): obj is { entries: JournalEntriesArrayLike } {
  return obj !== null && 
         typeof obj === 'object' && 
         'entries' in obj && 
         obj.entries !== null &&
         typeof obj.entries === 'object' && 
         'find' in obj.entries;
}

/**
 * Type guard for checking if combat flags are present
 */
export function hasCombatFlags(obj: unknown): obj is { 
  isCombatActive: boolean; 
  combatRounds: number; 
  currentTurn: string;
  combat: unknown;
} {
  return obj !== null && 
         typeof obj === 'object' && 
         'isCombatActive' in obj && 
         'combatRounds' in obj &&
         'currentTurn' in obj;
}

/**
 * Type guard for checking if narrative context is present
 */
export function hasNarrativeContext(obj: unknown): obj is {
  narrativeContext: { location: string; time?: string };
  currentScene: unknown;
  dialogues: unknown[];
} {
  return obj !== null && 
         typeof obj === 'object' && 
         'narrativeContext' in obj && 
         'currentScene' in obj &&
         'dialogues' in obj;
}

/**
 * Type guard for checking if all adapters have been applied
 */
export function isFullyAdapted(obj: unknown): obj is {
  player: unknown;
  inventory: InventoryArrayLike;
  entries: JournalEntriesArrayLike;
  isCombatActive: boolean;
  combatRounds: number;
  narrativeContext: unknown;
  currentScene: unknown;
  activeTab: string;
  isMenuOpen: boolean;
  journal: unknown;
} {
  return obj !== null && 
         typeof obj === 'object' && 
         'player' in obj &&
         'inventory' in obj &&
         'entries' in obj &&
         'isCombatActive' in obj &&
         'combatRounds' in obj &&
         'narrativeContext' in obj &&
         'currentScene' in obj &&
         'activeTab' in obj &&
         'isMenuOpen' in obj &&
         'journal' in obj;
}

// Adding a dummy test to prevent Jest error about empty test suites
if (process.env.NODE_ENV === 'test') {
  describe('Helpers', () => {
    test('exists only to make Jest happy', () => {
      expect(true).toBe(true);
    });
  });
}