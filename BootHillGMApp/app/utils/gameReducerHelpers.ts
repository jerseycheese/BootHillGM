import { ExtendedGameState } from '../types/extendedState';
import { InventoryItem } from '../types/item.types';
import { Wound } from '../types/wound';
import { LogEntry } from '../types/combat';
import { CombatState, CombatTurn, CombatLogEntry } from '../types/state/combatState';
import { convertLogEntry } from './combatAdapter';
import { GameEngineAction } from '../types/gameActions';
import { GameAction } from '../types/actions';
import { inventoryReducer } from '../reducers/inventory/inventoryReducer';
import { journalReducer } from '../reducers/journal/journalReducer';
import { JournalState } from '../types/state/journalState';
import { isNonNullObject } from '../reducers/gameTypes';

/**
 * Maps an unknown array to a typed array by applying a transformation function
 */
export function mapToTypedArray<T>(array: unknown[] | undefined, mapFn: (item: unknown) => T): T[] {
  if (!array) return [];
  return array.map(mapFn);
}

/**
 * Convert inventory items from unknown to InventoryItem type
 */
export function convertToInventoryItem(item: unknown): InventoryItem {
  if (!isNonNullObject(item)) {
    return {
      id: `item_${Date.now()}`,
      name: 'Unknown Item',
      description: '',
      quantity: 1,
      category: 'general'
    };
  }
  
  return {
    id: String(item.id || `item_${Date.now()}`),
    name: String(item.name || 'Unknown Item'),
    description: String(item.description || ''),
    quantity: Number(item.quantity || 1),
    category: String(item.category || 'general'),
    ...(item as Record<string, unknown>)
  } as InventoryItem;
}

/**
 * Convert wounds from unknown to Wound type
 */
export function convertToWound(wound: unknown): Wound {
  if (!isNonNullObject(wound)) {
    return {
      location: 'chest',
      severity: 'light',
      strengthReduction: 3,
      turnReceived: 0,
      damage: 0
    };
  }
  
  return {
    location: String(wound.location || 'chest') as Wound['location'],
    severity: String(wound.severity || 'light') as Wound['severity'],
    strengthReduction: Number(wound.strengthReduction || 3),
    turnReceived: Number(wound.turnReceived || 0),
    damage: Number(wound.damage || 0)
  };
}

/**
 * Convert legacy LogEntry to CombatLogEntry
 */
export function convertLegacyLogEntry(entry: LogEntry): CombatLogEntry {
  return {
    text: entry.text,
    timestamp: entry.timestamp,
    // Convert legacy types to new types
    type: entry.type === 'hit' || entry.type === 'critical' ? 'result' :
          entry.type === 'miss' ? 'result' :
          entry.type === 'info' ? 'system' : 'action',
    // Store original type in data for reference
    data: { originalType: entry.type }
  };
}

/**
 * Convert combat log entries for UPDATE_COMBAT_STATE
 * This fixes the type error related to log entry type differences
 */
export function convertCombatLogEntries(
  logEntries?: (LogEntry | CombatState['combatLog'][0])[]
): CombatLogEntry[] {
  if (!logEntries || !Array.isArray(logEntries)) {
    return [];
  }

  return logEntries.map(entry => {
    // Check if it's already the right type (CombatLogEntry)
    if ('data' in entry || ('type' in entry && (
      entry.type === 'action' || 
      entry.type === 'result' || 
      entry.type === 'system' || 
      entry.type === undefined))) {
      return entry as CombatLogEntry;
    }
    
    // Otherwise convert from legacy format (LogEntry)
    if ('type' in entry && (
      entry.type === 'hit' ||
      entry.type === 'miss' ||
      entry.type === 'critical' ||
      entry.type === 'info')) {
      return convertLegacyLogEntry(entry as LogEntry);
    }
    
    // Fallback for unknown formats - use a more specific type than 'any'
    return convertLogEntry(entry as unknown as LogEntry) as CombatLogEntry;
  });
}

/**
 * Ensure NPCs array contains strings and not character objects
 * This is needed because sometimes tests initialize NPCs as string array
 * but the objects get converted to character-like objects during serialization/deserialization
 */
export function ensureNPCsArray(npcs: unknown): string[] {
  if (!npcs) return [];
  
  if (Array.isArray(npcs)) {
    return npcs.map(npc => {
      if (typeof npc === 'string') {
        return npc;
      } else if (isNonNullObject(npc)) {
        // If it's an object that got created during serialization/deserialization,
        // convert it back to a string
        return JSON.stringify(npc);
      }
      return String(npc);
    });
  }
  
  return [];
}

// Define more specific type for currentTurn parameter to avoid 'any'
type CurrentTurnInput = string | CombatTurn | null | undefined;

/**
 * Transform string-based currentTurn into CombatTurn object
 */
export function transformCurrentTurn(currentTurn: CurrentTurnInput, state: ExtendedGameState): CombatTurn | null {
  // Handle null/undefined
  if (!currentTurn) return null;
  
  // If it's already a CombatTurn object, return it
  if (typeof currentTurn === 'object' && currentTurn !== null && 'playerId' in currentTurn) {
    return currentTurn as CombatTurn;
  }
  
  // If it's a string like 'player' or 'opponent', convert it to a CombatTurn object
  if (typeof currentTurn === 'string') {
    return { 
      playerId: currentTurn === 'player' 
        ? state.character?.player?.id || ''
        : state.character?.opponent?.id || '',
      actions: []
    };
  }
  
  // Default fallback
  return null;
}

/**
 * Convert CombatTurn object to string value for legacy code
 */
export function combatTurnToString(turn: CombatTurn | null | undefined): 'player' | 'opponent' | undefined {
  if (!turn) return undefined;
  
  // Simple heuristic - if the playerId contains "player", return "player", otherwise "opponent"
  return turn.playerId.toLowerCase().includes('player') ? 'player' : 'opponent';
}

/**
 * Processes inventory state updates while maintaining backward compatibility
 * This ensures that both the domain-slice structure (inventory.items) and 
 * legacy flat structure (inventory as array) are properly updated
 */
export function processInventoryState(state: ExtendedGameState, action: GameEngineAction): ExtendedGameState {
  // Get the updated inventory slice - use type assertion to cast action to GameAction
  const inventorySlice = inventoryReducer(state.inventory, action as unknown as GameAction);
  
  // Create a new state with the updated inventory slice
  const newState: ExtendedGameState = {
    ...state,
    inventory: inventorySlice
  };
  
  // For backward compatibility - also update any inventory array properties
  // This helps with tests that expect inventory to be an array
  if (Array.isArray(state.inventory)) {
    // If state.inventory was an array (legacy format), 
    // we need to set it up as both an array and an object with items
    const inventoryItems = inventorySlice?.items || [];
    newState.inventory.items = inventoryItems;
    
    // Make the inventory property iterable for tests
    // @ts-expect-error - intentionally adding array-like properties
    newState.inventory.forEach = Array.prototype.forEach.bind(inventoryItems);
    // @ts-expect-error - intentionally adding array-like properties
    newState.inventory.map = Array.prototype.map.bind(inventoryItems);
    // @ts-expect-error - intentionally adding array-like properties 
    newState.inventory.filter = Array.prototype.filter.bind(inventoryItems);
    // @ts-expect-error - intentionally adding array-like properties
    newState.inventory.find = Array.prototype.find.bind(inventoryItems);
    // @ts-expect-error - intentionally adding array-like properties
    newState.inventory.some = Array.prototype.some.bind(inventoryItems);
    // @ts-expect-error - intentionally adding array-like properties
    newState.inventory.length = inventoryItems.length;
    
    // Add iterator for spread operator
    // @ts-expect-error - intentionally adding array-like properties
    newState.inventory[Symbol.iterator] = function* () {
      for (let i = 0; i < inventoryItems.length; i++) {
        yield inventoryItems[i];
      }
    };
  }
  
  return newState;
}

/**
 * Processes journal state updates while maintaining backward compatibility
 * This ensures that both the domain-slice structure (journal.entries) and
 * legacy flat structures (journal as array, entries as array) are properly updated
 */
export function processJournalState(state: ExtendedGameState, action: GameEngineAction): ExtendedGameState {
  // Get the updated journal slice - use type assertion to cast action to GameAction
  const journalSlice = journalReducer(state.journal, action as unknown as GameAction);
  
  // Create a new state with the updated journal slice
  const newState: ExtendedGameState = {
    ...state,
    journal: journalSlice
  };
  
  // For backward compatibility - expose journal entries at root level
  if ((journalSlice as JournalState).entries) {
    newState.entries = (journalSlice as JournalState).entries;
    
    // If state.journal was an array (legacy format), add array-like behavior
    if (Array.isArray(state.journal)) {
      const journalEntries = (journalSlice as JournalState).entries || [];
      newState.journal.entries = journalEntries;
      
      // Make the journal property iterable for tests
      // @ts-expect-error - intentionally adding array-like properties
      newState.journal.forEach = Array.prototype.forEach.bind(journalEntries);
      // @ts-expect-error - intentionally adding array-like properties
      newState.journal.map = Array.prototype.map.bind(journalEntries);
      // @ts-expect-error - intentionally adding array-like properties
      newState.journal.filter = Array.prototype.filter.bind(journalEntries);
      // @ts-expect-error - intentionally adding array-like properties
      newState.journal.find = Array.prototype.find.bind(journalEntries);
      // @ts-expect-error - intentionally adding array-like properties
      newState.journal.some = Array.prototype.some.bind(journalEntries);
      // @ts-expect-error - intentionally adding array-like properties
      newState.journal.length = journalEntries.length;
      
      // Add iterator for spread operator
      // @ts-expect-error - intentionally adding array-like properties
      newState.journal[Symbol.iterator] = function* () {
        for (let i = 0; i < journalEntries.length; i++) {
          yield journalEntries[i];
        }
      };
    }
  }
  
  return newState;
}