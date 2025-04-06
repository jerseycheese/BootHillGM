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
 */
export const initialInventoryState: InventoryState = {
  items: [],
  equippedWeaponId: null,
};
