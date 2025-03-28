import { CombatState } from '../types/state/combatState';
import { InventoryItem } from '../types/item.types';
import { Wound } from '../types/wound';
import { GameState } from '../types/gameState';
import { GameEngineAction } from '../types/gameActions';

/**
 * Type guard to check if a value is an object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Type guard to check if a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard to check if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard to check if a value is an array
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Type guard to check if a value is a non-null object
 */
export function isNonNullObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

/**
 * Type guard to check if an action belongs to a specific domain (like 'combat', 'inventory', etc.)
 */
export function isActionDomain(action: GameEngineAction, domain: string): boolean {
  return isString(action.type) && action.type.startsWith(`${domain}/`);
}

/**
 * Type guard to check if a state object follows the slice-based structure
 */
export function isSliceBasedState(state: unknown): state is Partial<GameState> {
  return (
    isObject(state) && 
    // Check for key domain slices
    ((state.combat !== undefined) || 
     (state.character !== undefined) || 
     (state.narrative !== undefined) || 
     (state.inventory !== undefined) || 
     (state.journal !== undefined) || 
     (state.ui !== undefined))
  );
}

/**
 * Type guard to check if a normalized state has a character property
 */
export function hasCharacter(state: unknown): state is { character: Record<string, unknown> } {
  return isNonNullObject(state) && isNonNullObject((state as Record<string, unknown>).character);
}

/**
 * Type guard to check if a state has a character state property
 * This is similar to hasCharacter but specifically checks for character state structure
 */
export function hasCharacterState(state: unknown): state is GameState & { 
  character: { 
    player: Record<string, unknown> | null; 
    opponent: Record<string, unknown> | null;
  } 
} {
  if (!isNonNullObject(state)) return false;
  
  const typedState = state as Record<string, unknown>;
  if (!isNonNullObject(typedState.character)) return false;
  
  // Check that character has player and opponent properties (which can be null)
  const character = typedState.character as Record<string, unknown>;
  return 'player' in character && 'opponent' in character;
}

/**
 * Type guard to check if a normalized state has a combat property
 */
export function hasCombat(state: unknown): state is { combat: Record<string, unknown> } {
  return isNonNullObject(state) && isNonNullObject((state as Record<string, unknown>).combat);
}

/**
 * Type guard to check if a normalized state has a journal property
 */
export function hasJournal(state: unknown): state is { journal: Record<string, unknown> } {
  return isNonNullObject(state) && isNonNullObject((state as Record<string, unknown>).journal);
}

/**
 * Type guard to check if a combatState is present
 */
export function hasCombatState(state: unknown): state is { combatState: CombatState } {
  return isNonNullObject(state) && isNonNullObject((state as Record<string, unknown>).combatState);
}

/**
 * Type guard to check if a state has an inventory state property
 */
export function hasInventoryState(state: unknown): state is GameState & {
  inventory: {
    items: InventoryItem[];
  }
} {
  if (!isNonNullObject(state)) return false;
  
  const typedState = state as Record<string, unknown>;
  if (!isNonNullObject(typedState.inventory)) return false;
  
  // Check that inventory has an items array
  const inventory = typedState.inventory as Record<string, unknown>;
  return Array.isArray(inventory.items);
}

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
