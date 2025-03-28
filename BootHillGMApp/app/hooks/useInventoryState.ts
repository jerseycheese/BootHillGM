/**
 * Inventory State Selector Hooks
 * 
 * This module provides selector hooks for accessing inventory state data.
 */

import { InventoryItem } from '../types/item.types';
import { InventoryState } from '../types/state/inventoryState';
import { createSelectorHook, createSlicePropertySelector } from './createSelectorHook';

/**
 * Hook that returns the entire inventory state slice
 */
export const useInventoryState = createSelectorHook<InventoryState>(
  (state) => state.inventory
);

/**
 * Hook that returns all inventory items
 */
export const useInventoryItems = createSlicePropertySelector<InventoryState, InventoryItem[]>(
  'inventory',
  (inventoryState) => inventoryState.items
);

/**
 * Hook that returns the count of inventory items
 */
export const useInventoryItemCount = createSelectorHook<number>(
  (state) => state.inventory.items.length
);

/**
 * Hook that returns items of a specific category
 * @param category The category of items to retrieve
 */
export function useItemsByCategory(category: string) {
  return createSelectorHook<InventoryItem[]>(
    (state) => state.inventory.items.filter(item => item.category === category)
  );
}

/**
 * Hook that returns a specific item by id
 * @param itemId The id of the item to retrieve
 */
export function useItemById(itemId: string) {
  return createSelectorHook<InventoryItem | undefined>(
    (state) => state.inventory.items.find(item => item.id === itemId)
  );
}

/**
 * Hook that checks if the inventory has an item of a specific category
 * @param category The category to check for
 */
export function useHasItemCategory(category: string) {
  return createSelectorHook<boolean>(
    (state) => state.inventory.items.some(item => item.category === category)
  );
}
