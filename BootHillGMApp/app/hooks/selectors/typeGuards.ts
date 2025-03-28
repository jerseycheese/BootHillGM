/**
 * Type Guards for State Selectors
 * 
 * This module provides type guard functions that are specialized for the
 * various state slices. These are designed to work with the selector hooks
 * to ensure type safety when accessing state.
 */

import { CharacterState } from '../../types/state/characterState';
import { InventoryState } from '../../types/state/inventoryState';
import { JournalState } from '../../types/state/journalState';
import { CombatState } from '../../types/state/combatState';
import { NarrativeState } from '../../types/narrative.types';
import { Character } from '../../types/character';
import { InventoryItem } from '../../types/item.types';
import { JournalEntry } from '../../types/journal';

/**
 * Type guard to check if an object is a Character
 */
export function isCharacter(obj: unknown): obj is Character {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'id' in obj &&
    'name' in obj &&
    'attributes' in obj
  );
}

/**
 * Type guard to check if an object is a CharacterState
 */
export function isCharacterState(obj: unknown): obj is CharacterState {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'player' in obj
  );
}

/**
 * Type guard to check if an object is an inventory array
 */
export function isInventoryArray(obj: unknown): obj is InventoryItem[] {
  return Array.isArray(obj) && 
    obj.length > 0 ? 
    ('name' in obj[0] && 'id' in obj[0]) : 
    true; // Empty arrays are valid
}

/**
 * Type guard to check if an object is an InventoryState
 */
export function isInventoryState(obj: unknown): obj is InventoryState {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'items' in obj &&
    Array.isArray((obj as InventoryState).items)
  );
}

/**
 * Type guard to check if an object is a JournalEntry array
 */
export function isJournalArray(obj: unknown): obj is JournalEntry[] {
  return Array.isArray(obj) && 
    obj.length > 0 ? 
    ('content' in obj[0] || 'title' in obj[0]) : 
    true; // Empty arrays are valid
}

/**
 * Type guard to check if an object is a JournalState
 */
export function isJournalState(obj: unknown): obj is JournalState {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'entries' in obj &&
    Array.isArray((obj as JournalState).entries)
  );
}

/**
 * Type guard to check if an object is a CombatState
 */
export function isCombatState(obj: unknown): obj is CombatState {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'isActive' in obj &&
    typeof (obj as CombatState).isActive === 'boolean'
  );
}

/**
 * Type guard to check if an object is a NarrativeState
 */
export function isNarrativeState(obj: unknown): obj is NarrativeState {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'narrativeHistory' in obj &&
    Array.isArray((obj as NarrativeState).narrativeHistory)
  );
}

/**
 * Gets player character from either a Character or CharacterState
 */
export function getPlayerFromCharacter(character: CharacterState | Character | null | undefined): Character | null {
  if (!character) {
    return null;
  }
  
  // If it has a player property, treat as CharacterState
  if ('player' in character) {
    const player = character.player;
    return player;
  }
  
  // If it has attributes, treat as Character
  if ('attributes' in character) {
    const char = character as Character;
    return char;
  }
  
  return null;
}

/**
 * Gets inventory items regardless of state format
 */
export function getItemsFromInventory(inventory: InventoryState | InventoryItem[] | null | undefined): InventoryItem[] {
  if (!inventory) return [];
  
  // If it's an array, it's already items
  if (Array.isArray(inventory)) {
    return inventory;
  }
  
  // If it has an items property, use that
  if ('items' in inventory && Array.isArray(inventory.items)) {
    return inventory.items;
  }
  
  return [];
}

/**
 * Gets journal entries regardless of state format
 */
export function getEntriesFromJournal(journal: JournalState | JournalEntry[] | null | undefined): JournalEntry[] {
  if (!journal) return [];
  
  // If it's an array, it's already entries
  if (Array.isArray(journal)) {
    return journal;
  }
  
  // If it has an entries property, use that
  if ('entries' in journal && Array.isArray(journal.entries)) {
    return journal.entries;
  }
  
  return [];
}
