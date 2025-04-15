import { GameState } from '../types/gameState';
import { InventoryItem } from '../types/item.types';
import { Character } from '../types/character';
import { LocationType } from '../services/locationService';
import { JournalEntry } from '../types/journal';
import { InventoryState } from '../types/state/inventoryState';
import { JournalState } from '../types/state/journalState';
import { CharacterState } from '../types/state/characterState';
// Removed import of obsolete LegacyState from stateAdapters

// Define a custom type with the extra properties for testing
// This might be specific to the hook's tests, consider if it should stay there or move.
// For now, keeping it here as it's used by createGameStateWithGetters.
export interface GameStateWithTesting extends GameState {
  combatState?: unknown;
  opponent: Character | null;  // Added opponent property for test compatibility
}

// Generate a UUID for use in tests and environments where crypto.randomUUID() is not available
function generateUUID(): string {
  // Simple UUID generation fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Use crypto.randomUUID if available, otherwise use our fallback
export const getUUID = (): string => {
  try {
    return crypto.randomUUID();
  } catch {
    return generateUUID();
  }
};

// Helper function to ensure the location is a valid LocationType
export const ensureLocationType = (location: unknown): LocationType => {
  if (location && typeof location === 'object' && 'type' in location) {
    const loc = location as { type: string; name?: string; description?: string };
    
    switch (loc.type) {
      case 'town':
        return loc.name ? { type: 'town', name: loc.name } : { type: 'unknown' };
      case 'wilderness':
        return loc.description ? { type: 'wilderness', description: loc.description } : { type: 'unknown' };
      case 'landmark':
        return loc.name ? { type: 'landmark', name: loc.name, description: loc.description } : { type: 'unknown' };
      case 'unknown':
        return { type: 'unknown' };
      default:
        return { type: 'unknown' };
    }
  }
  return { type: 'unknown' };
};

/**
 * Ensures an unknown value is a valid JournalEntry or creates a default one
 */
export const ensureJournalEntry = (entry: unknown): JournalEntry => {
  if (!entry || typeof entry !== 'object') {
    // Return a default narrative entry if the entry is invalid
    return {
      id: getUUID(),
      title: 'Invalid Entry Data', // Add default title
      type: 'narrative',
      timestamp: Date.now(),
      content: 'Missing journal content',
      narrativeSummary: 'Default summary', // Add required property for narrative type
    };
  }

  // Check if entry has required properties
  const entryObj = entry as Partial<JournalEntry>;
  if (!entryObj.type || !entryObj.content || !entryObj.id) {
    return {
      id: entryObj.id || getUUID(),
      title: entryObj.title || 'Restored Entry', // Add title (use existing if possible)
      type: 'narrative', // Default to narrative if type is missing
      timestamp: entryObj.timestamp || Date.now(),
      content: entryObj.content || 'Missing journal content',
      narrativeSummary: 'narrativeSummary' in entryObj ? String(entryObj.narrativeSummary) : 'Generated summary', // Add required property
    };
  }

  // Return the valid entry
  return entry as JournalEntry;
};

/**
 * Creates an object with the necessary getter properties for GameState
 */
export const createGameStateWithGetters = (baseState: Partial<GameStateWithTesting>): GameStateWithTesting => {
  // Create a type that includes required getters
  const stateWithGetters = Object.defineProperties(
    { ...baseState },
    {
      player: {
        get: function() { 
          // Ensure character exists before accessing player
          return this.character?.player || null; 
        },
        enumerable: true,
        configurable: true
      },
      opponent: {
        get: function() { 
          // Ensure character exists before accessing opponent
          return this.character?.opponent || null; 
        },
        enumerable: true,
        configurable: true
      },
      isCombatActive: {
        get: function() { 
          // Ensure combat exists before accessing isActive
          return this.combat?.isActive || false; 
        },
        enumerable: true,
        configurable: true
      }
    }
  );

  return stateWithGetters as GameStateWithTesting;
};

/**
 * Helper to safely get a string value from normalized state
 */
export const getStringValue = (value: unknown, defaultValue: string): string => {
  if (typeof value === 'string') return value;
  return defaultValue;
};

/**
 * Helper to safely get a number value from normalized state
 */
export const getNumberValue = (value: unknown, defaultValue: number): number => {
  if (typeof value === 'number') return value;
  return defaultValue;
};

/**
 * Helper to safely get a string array from normalized state
 */
export const getStringArrayValue = (value: unknown, defaultValue: string[] = []): string[] => {
  if (Array.isArray(value)) {
    // Ensure all elements are strings
    return value.filter(item => typeof item === 'string') as string[];
  }
  return defaultValue;
};

/**
 * Creates a fresh copy of character data with all nested objects properly copied.
 * Ensures that all required character properties are present and correctly typed.
 */
export const restoreCharacter = (character: Partial<Character>): Character => {
  // Create a deep copy to avoid mutations
  const restoredCharacter = {
    ...character,
    attributes: { ...(character.attributes || {}) },
    wounds: [...(character.wounds || [])],
    // Ensure properties are properly typed (especially booleans)
    isUnconscious: Boolean(character.isUnconscious),
    isNPC: Boolean(character.isNPC),
    isPlayer: Boolean(character.isPlayer),
    // Ensure inventory is in the right format (InventoryState)
    inventory: character.inventory && typeof character.inventory === 'object' && 'items' in character.inventory
      ? { items: [...((character.inventory as InventoryState).items || [])] }
      : Array.isArray(character.inventory) // Handle legacy array format
        ? { items: [...character.inventory] }
        : { items: [] } // Default to empty items array
  } as Character;
  
  // Ensure required fields have default values if missing
  restoredCharacter.name = restoredCharacter.name || 'Unknown';
  restoredCharacter.id = restoredCharacter.id || getUUID();
  restoredCharacter.attributes = restoredCharacter.attributes || {}; // Ensure attributes object exists
  restoredCharacter.wounds = restoredCharacter.wounds || []; // Ensure wounds array exists

  return restoredCharacter;
};

// --- Normalization Functions ---

export const normalizeInventoryItems = (normalizedState: Partial<GameState>, savedState: unknown): InventoryItem[] => {
  if (normalizedState.inventory && 
      typeof normalizedState.inventory === 'object' && 
      'items' in (normalizedState.inventory as object)) {
    
    const items = (normalizedState.inventory as {items: unknown}).items;
    
    return Array.isArray(items) ? 
      items.map((item: unknown) => ({ ...item as InventoryItem })) : [];
  }
  
  // Fallback to original saved state if it was an array
  const inventory = (savedState as { inventory?: unknown })?.inventory;
  return Array.isArray(inventory) ?
    inventory.map((item: unknown) => ({ ...item as InventoryItem })) : [];
};

export const normalizeJournalEntries = (normalizedState: Partial<GameState>, savedState: unknown): JournalEntry[] => {
  // Get entries from normalized state if available
  if (normalizedState.journal && 
      typeof normalizedState.journal === 'object' && 
      'entries' in (normalizedState.journal as object)) {
    
    const entries = (normalizedState.journal as {entries: unknown}).entries;
    
    if (Array.isArray(entries)) {
      return entries.map(ensureJournalEntry);
    }
  }
  
  // Fallback to original saved state (journal array)
  const journal = (savedState as { journal?: unknown })?.journal;
  if (Array.isArray(journal)) {
    return journal.map(ensureJournalEntry);
  }
  
  // Last resort, check for root entries property (older format?)
  const entries = (savedState as { entries?: unknown })?.entries;
  if (Array.isArray(entries)) {
    return entries.map(ensureJournalEntry);
  }
  
  // If nothing is available, return empty array
  return [];
};

export const normalizeCharacterState = (savedState: unknown, opponentCharacter: Character | null): CharacterState | null => {
  // For tests that check if character is null
  const state = savedState as { character?: Partial<CharacterState> | Partial<Character> | null, player?: Partial<Character> | null };
  if (state?.character === null) {
    return null;
  }
  
  // Handle cases where character might be undefined but player isn't explicitly set
  if (state?.character === undefined && !state?.player) {
    return null; // Or potentially return default empty state? Returning null matches original logic.
  }
  
  // For tests that use the full character object directly
  if (state?.character && typeof state.character === 'object') {
    // Check if it's already in CharacterState format
    if ('player' in state.character || 'opponent' in state.character) {
      const charState = state.character as CharacterState;
      // Restore player and opponent within the state
      const restoredPlayer = charState.player ? restoreCharacter(charState.player) : null;
      const restoredOpponent = charState.opponent ? restoreCharacter(charState.opponent) : opponentCharacter; // Prioritize root opponent if charState.opponent is null/missing

      return {
        player: restoredPlayer,
        // If there's a separate opponent at root level, make sure it's included if not already present
        opponent: restoredOpponent || opponentCharacter 
      };
    }
    
    // If it's a Character object directly, create proper CharacterState
    if ('name' in state.character || 'attributes' in state.character) {
      return {
        player: restoreCharacter(state.character as Partial<Character>),
        opponent: opponentCharacter // Include restored root opponent if it exists
      };
    }
  }
  
  // If using the player property directly, create CharacterState from that
  if (state?.player && typeof state.player === 'object') {
    return {
      player: restoreCharacter(state.player as Partial<Character>),
      opponent: opponentCharacter // Include restored root opponent if it exists
    };
  }
  
  // Default: Return an empty character state instead of null if no character data found
  return {
    player: null,
    opponent: null
  } as CharacterState; 
};

export const normalizeInventoryState = (savedState: unknown, normalizedItems: InventoryItem[]): InventoryState => {
  // Tests might expect an array for direct comparison, but we need to store it in the new format
  const inventory = (savedState as { inventory?: unknown })?.inventory;
  if (Array.isArray(inventory)) {
    // Ensure items are deep copied
    return { 
      items: inventory.map((item: unknown) => ({ ...item as InventoryItem }))
    } as InventoryState;
  }
  
  // Default to using the already normalized items
  return { 
    items: normalizedItems 
  } as InventoryState;
};

export const normalizeJournalState = (normalizedEntries: JournalEntry[]): JournalState => {
  return { 
    entries: normalizedEntries 
  } as JournalState;
};
