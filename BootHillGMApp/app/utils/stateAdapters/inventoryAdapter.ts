import { GameState } from '../../types/gameState';
import { InventoryItem } from '../../types/item.types';

/**
 * Inventory State Adapter
 *
 * Makes the inventory slice behave like an array by proxying array methods to the items array.
 */
export const inventoryAdapter = {
  // Getter to adapt new state to old state shape
  getItems: (state: GameState) => {
    // Handle both new InventoryState and legacy array formats
    if (state?.inventory) {
      if ('items' in state.inventory && Array.isArray(state.inventory.items)) {
        return state.inventory.items || [];
      } else if (Array.isArray(state.inventory)) {
        return state.inventory;
      }
    }
    return [];
  },
  
  // Add array methods to the inventory state for backward compatibility
  adaptForTests: (state: GameState) => {
    if (!state) return state;

    // Get items from either format
    const inventoryItems = state.inventory?.items ||
                          (Array.isArray(state.inventory) ? state.inventory : []);
    
    // Create an array-like object that can be used in tests
    const adaptedInventory = {
      ...state.inventory,
      items: inventoryItems,
      
      // Add lazy-bound array methods
      get find() {
        return <T>(fn: (item: InventoryItem) => boolean): T | undefined =>
          inventoryItems.find((item) => fn(item as InventoryItem)) as T | undefined;
      },
      
      get filter() {
        return (fn: (item: InventoryItem) => boolean): unknown[] =>
          inventoryItems.filter((item) => fn(item as InventoryItem));
      },
      
      get some() {
        return (fn: (item: InventoryItem) => boolean): boolean =>
          inventoryItems.some((item) => fn(item as InventoryItem));
      },
      
      get map() {
        return <T>(fn: (item: InventoryItem) => T): T[] =>
          inventoryItems.map((item) => fn(item as InventoryItem));
      },
      
      get forEach() {
        return (fn: (item: InventoryItem) => void): void =>
          inventoryItems.forEach((item) => fn(item as InventoryItem));
      },
      
      get reduce() {
        return <T>(fn: (acc: T, item: InventoryItem) => T, initial: T): T =>
          inventoryItems.reduce((acc, item) => fn(acc, item as InventoryItem), initial);
      },
      
      // For length property access
      get length() {
        return inventoryItems.length;
      },
      
      // Include array iterator for spread operators
      get [Symbol.iterator]() {
        return function* () {
          for (let i = 0; i < inventoryItems.length; i++) {
            yield inventoryItems[i];
          }
        };
      }
    };
    
    // Create a proxy for numeric index access
    const inventoryProxy = new Proxy(adaptedInventory, {
      get(target, prop) {
        // Handle numeric indices
        if (typeof prop === 'string' && !isNaN(Number(prop))) {
          return inventoryItems[Number(prop)];
        }
        
        // Forward other properties to the adapted inventory
        return target[prop as keyof typeof target];
      }
    });
    
    return {
      ...state,
      inventory: inventoryProxy
    };
  }
};