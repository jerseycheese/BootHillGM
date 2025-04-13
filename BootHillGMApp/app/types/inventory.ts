/**
 * Inventory Types
 * 
 * Core inventory-related type definitions
 */

import { InventoryItem, ItemCategory } from './item.types';

// Re-export ItemCategory from item.types.ts to ensure consistency
export type { ItemCategory };

/**
 * Extended inventory item with additional properties
 * for advanced item handling
 */
export interface ExtendedInventoryItem extends InventoryItem {
  // These properties are now in the base InventoryItem interface
  // Re-declaring them here for backward compatibility
  weight?: number;
  value?: number;
  durability?: number;
}

/**
 * Inventory system state interface
 */
export interface InventoryState {
  items: InventoryItem[];
  equippedWeaponId: string | null;
  maxCapacity?: number;
  encumbrance?: number;
  [key: string]: unknown;
}

/**
 * Create a basic inventory item with default values
 */
export function createBasicItem(name: string, category: ItemCategory = 'general'): InventoryItem {
  return {
    id: `item-${Date.now()}`,
    name,
    description: `Basic ${name}`,
    quantity: 1,
    category
  };
}
