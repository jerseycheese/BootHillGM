/**
 * Type Guard Utilities for Reducers
 * 
 * This module provides type guard functions that help ensure 
 * type safety when processing actions in reducers.
 */

import { GameAction } from '../../types/actions';
import { CharacterState } from '../../types/state/characterState';
import { CombatState } from '../../types/state/combatState';
import { InventoryState } from '../../types/state/inventoryState';
import { JournalState } from '../../types/state/journalState';
import { NarrativeState } from '../../types/state/narrativeState';
import { UIState } from '../../types/state/uiState';
import { InventoryItem } from '../../types/item.types';
import { JournalEntry } from '../../types/journal';
import { Character } from '../../types/character';

/**
 * Helper function to safely check if something is a non-null object
 */
export function isNonNullObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

/**
 * Type guard to check if a value is an array
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Type guard to check if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard to check if a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

/**
 * Type guard to check if a value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard to check if an action is of a specific type
 */
export function isActionType<T extends GameAction>(
  action: GameAction, 
  type: T['type']
): action is T {
  return action.type === type;
}

/**
 * Type guard to check if a state has a character slice
 */
export function hasCharacterSlice(state: unknown): state is { character: CharacterState } {
  return isNonNullObject(state) && 
         isNonNullObject((state as Record<string, unknown>).character);
}

/**
 * Type guard to check if a state has a combat slice
 */
export function hasCombatSlice(state: unknown): state is { combat: CombatState } {
  return isNonNullObject(state) && 
         isNonNullObject((state as Record<string, unknown>).combat);
}

/**
 * Type guard to check if a state has an inventory slice
 */
export function hasInventorySlice(state: unknown): state is { inventory: InventoryState } {
  return isNonNullObject(state) && 
         isNonNullObject((state as Record<string, unknown>).inventory) &&
         isArray((state as { inventory: { items: unknown[] } }).inventory.items);
}

/**
 * Type guard to check if a state has a journal slice
 */
export function hasJournalSlice(state: unknown): state is { journal: JournalState } {
  return isNonNullObject(state) && 
         isNonNullObject((state as Record<string, unknown>).journal) &&
         isArray((state as { journal: { entries: unknown[] } }).journal.entries);
}

/**
 * Type guard to check if a state has a narrative slice
 */
export function hasNarrativeSlice(state: unknown): state is { narrative: NarrativeState } {
  return isNonNullObject(state) && 
         isNonNullObject((state as Record<string, unknown>).narrative);
}

/**
 * Type guard to check if a state has a ui slice
 */
export function hasUISlice(state: unknown): state is { ui: UIState } {
  return isNonNullObject(state) && 
         isNonNullObject((state as Record<string, unknown>).ui);
}

/**
 * Type guard to check if a value is a valid Character
 */
export function isCharacter(value: unknown): value is Character {
  return isNonNullObject(value) && 
         'id' in value &&
         'name' in value &&
         isNonNullObject((value as Record<string, unknown>).attributes);
}

/**
 * Type guard to check if a value is a valid InventoryItem
 */
export function isInventoryItem(value: unknown): value is InventoryItem {
  return isNonNullObject(value) && 
         'id' in value &&
         'name' in value &&
         'quantity' in value;
}

/**
 * Type guard to check if a value is a valid JournalEntry
 */
export function isJournalEntry(value: unknown): value is JournalEntry {
  return isNonNullObject(value) && 
         'type' in value &&
         'timestamp' in value &&
         'content' in value;
}

/**
 * Helper function to safely extract property from an object with a default value
 */
export function safeGet<T>(obj: unknown, key: string, defaultValue: T): T {
  if (isNonNullObject(obj) && key in obj) {
    const value = obj[key];
    return value !== undefined && value !== null 
      ? value as unknown as T
      : defaultValue;
  }
  return defaultValue;
}

/**
 * Maps an unknown array to a typed array using a transform function
 */
export function mapToTypedArray<T>(array: unknown[] | undefined, mapFn: (item: unknown) => T): T[] {
  if (!array) return [];
  return array.map(mapFn);
}

/**
 * Helper function to determine if a value is an action payload with ID
 */
export function hasId(value: unknown): value is { id: string } {
  return isNonNullObject(value) && 
         'id' in value && 
         typeof value.id === 'string';
}
