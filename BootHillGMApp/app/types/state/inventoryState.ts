import { InventoryItem } from '../item.types';

/**
 * Inventory state slice that manages all item-related data
 */
export interface InventoryState {
  items: InventoryItem[];
  equippedWeaponId: string | null;
}

/**
 * Initial state for the inventory slice
 * This is used when a brand new game state is created
 */
export const initialInventoryState: InventoryState = {
  items: [], // Will be populated through game initialization
  equippedWeaponId: null,
};