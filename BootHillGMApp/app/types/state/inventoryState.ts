import { InventoryItem } from '../item.types';

/**
 * Inventory state slice that manages all item-related data
 */
export interface InventoryState {
  items: InventoryItem[];
}

/**
 * Initial state for the inventory slice
 */
export const initialInventoryState: InventoryState = {
  items: []
};
