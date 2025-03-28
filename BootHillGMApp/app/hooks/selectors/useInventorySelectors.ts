/**
 * Inventory-related state selector hooks
 * 
 * Contains selectors for accessing inventory state in a memoized way.
 */
import { InventoryItem } from '../../types/item.types';
import { createStateHook } from '../createStateHook';

/**
 * Returns all inventory items
 */
export const useInventoryItems = createStateHook<InventoryItem[], [InventoryItem[] | undefined]>(
  (state) => state.inventory?.items ?? [],
  (state) => [state.inventory?.items]
);

/**
 * Returns a specific inventory item by ID
 * 
 * @param itemId The ID of the item to find
 */
export const useInventoryItem = (itemId: string) => createStateHook<InventoryItem | undefined, [InventoryItem[] | undefined]>(
  (state) => state.inventory?.items?.find(item => item.id === itemId),
  (state) => [state.inventory?.items]
)();

/**
 * Returns all items of a specific category
 * 
 * @param category The category to filter by
 */
export const useInventoryByCategory = (category: string) => createStateHook<InventoryItem[], [InventoryItem[] | undefined]>(
  (state) => state.inventory?.items?.filter(item => item.category === category) ?? [],
  (state) => [state.inventory?.items]
)();

/**
 * Returns all weapon items
 */
export const useWeapons = createStateHook<InventoryItem[], [InventoryItem[] | undefined]>(
  (state) => state.inventory?.items?.filter(item => item.category === 'weapon') ?? [],
  (state) => [state.inventory?.items]
);

/**
 * Returns all healing/medical items
 */
export const useHealingItems = createStateHook<InventoryItem[], [InventoryItem[] | undefined]>(
  (state) => state.inventory?.items?.filter(item => (item.category as string) === 'medical' || (item.category as string) === 'healing') ?? [],
  (state) => [state.inventory?.items]
);

/**
 * Returns all consumable items
 */
export const useConsumableItems = createStateHook<InventoryItem[], [InventoryItem[] | undefined]>(
  (state) => state.inventory?.items?.filter(item => item.category === 'consumable') ?? [],
  (state) => [state.inventory?.items]
);

/**
 * Returns all equipped items
 */
export const useEquippedItems = createStateHook<InventoryItem[], [InventoryItem[] | undefined]>(
  (state) => state.inventory?.items?.filter(item => item.isEquipped) ?? [],
  (state) => [state.inventory?.items]
);

/**
 * Returns the currently equipped weapon (if any)
 */
export const useEquippedWeapon = createStateHook<InventoryItem | undefined, [InventoryItem[] | undefined]>(
  (state) => state.inventory?.items?.find(item => item.category === 'weapon' && item.isEquipped),
  (state) => [state.inventory?.items]
);

/**
 * Returns whether the player has any weapons
 */
export const useHasWeapons = createStateHook<boolean, [InventoryItem[] | undefined]>(
  (state) => state.inventory?.items?.some(item => item.category === 'weapon') ?? false,
  (state) => [state.inventory?.items]
);

/**
 * Returns whether the player has any healing items
 */
export const useHasHealingItems = createStateHook<boolean, [InventoryItem[] | undefined]>(
  (state) => state.inventory?.items?.some(item => (item.category as string) === 'medical' || (item.category as string) === 'healing') ?? false,
  (state) => [state.inventory?.items]
);

/**
 * Returns whether the player has a specific item by ID
 * 
 * @param itemId The ID of the item to check
 */
export const useHasItem = (itemId: string) => createStateHook<boolean, [InventoryItem[] | undefined]>(
  (state) => state.inventory?.items?.some(item => item.id === itemId) ?? false,
  (state) => [state.inventory?.items]
)();

/**
 * Returns the total number of inventory items
 */
export const useInventoryCount = createStateHook<number, [InventoryItem[] | undefined]>(
  (state) => state.inventory?.items?.length ?? 0,
  (state) => [state.inventory?.items]
);

/**
 * Returns the number of items of a specific category
 * 
 * @param category The category to count
 */
export const useInventoryCategoryCount = (category: string) => createStateHook<number, [InventoryItem[] | undefined]>(
  (state) => state.inventory?.items?.filter(item => item.category === category)?.length ?? 0,
  (state) => [state.inventory?.items]
)();

/**
 * Returns inventory statistics including counts by category
 */
export const useInventoryStats = createStateHook<
  { totalItems: number; totalQuantity: number; weaponCount: number; healingCount: number }, 
  [InventoryItem[] | undefined]
>(
  (state) => {
    const items = state.inventory?.items ?? [];
    return {
      totalItems: items.length,
      totalQuantity: items.reduce((sum, item) => sum + (item.quantity || 1), 0),
      weaponCount: items.filter(item => item.category === 'weapon').length,
      // Check for both 'medical' and 'healing' categories
      healingCount: items.filter(item => (item.category as string) === 'medical' || (item.category as string) === 'healing').length
    };
  },
  (state) => [state.inventory?.items]
);

// Keeping these aliases for backward compatibility
export const useInventoryItemById = useInventoryItem;
export const useInventoryItemsByCategory = useInventoryByCategory;
