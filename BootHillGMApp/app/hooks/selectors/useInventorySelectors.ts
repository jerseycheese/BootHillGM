import { useMemo } from 'react';
import { InventoryItem } from '../../types/item.types';
import { useCampaignState } from '../useCampaignStateContext';

/**
 * Returns all inventory items
 */
export const useInventoryItems = (): InventoryItem[] => {
  const { state } = useCampaignState();
  
  return useMemo(() => {
    // Safely handle undefined state or inventory
    if (!state) return [];
    
    // Handle both legacy array format and new InventoryState format
    if (Array.isArray(state.inventory)) {
      return state.inventory;
    }
    
    // Handle new structure with items property
    if (state.inventory && 'items' in state.inventory) {
      return state.inventory.items || [];
    }
    
    return [];
  }, [state]);
};

/**
 * Returns a specific inventory item by ID
 */
export const useInventoryItem = (itemId: string): InventoryItem | undefined => {
  const items = useInventoryItems();
  
  return useMemo(() => {
    return items.find(item => item.id === itemId);
  }, [items, itemId]);
};

/**
 * Returns all items of a specific category
 */
export const useInventoryByCategory = (category: string): InventoryItem[] => {
  const items = useInventoryItems();
  
  return useMemo(() => {
    return items.filter(item => item.category === category);
  }, [items, category]);
};

/**
 * Returns all weapon items
 */
export const useWeapons = (): InventoryItem[] => {
  const items = useInventoryItems();
  
  return useMemo(() => {
    return items.filter(item => item.category === 'weapon');
  }, [items]);
};

/**
 * Returns all healing/medical items
 */
export const useHealingItems = (): InventoryItem[] => {
  const items = useInventoryItems();
  
  return useMemo(() => {
    return items.filter(item => (item.category as string) === 'medical' || (item.category as string) === 'healing');
  }, [items]);
};

/**
 * Returns all consumable items
 */
export const useConsumableItems = (): InventoryItem[] => {
  const items = useInventoryItems();
  
  return useMemo(() => {
    return items.filter(item => item.category === 'consumable');
  }, [items]);
};

/**
 * Returns all equipped items
 */
export const useEquippedItems = (): InventoryItem[] => {
  const items = useInventoryItems();
  
  return useMemo(() => {
    return items.filter(item => item.isEquipped);
  }, [items]);
};

/**
 * Returns the currently equipped weapon (if any)
 */
export const useEquippedWeapon = (): InventoryItem | undefined => {
  const items = useInventoryItems();
  
  return useMemo(() => {
    return items.find(item => item.category === 'weapon' && item.isEquipped);
  }, [items]);
};

/**
 * Returns whether the player has any weapons
 */
export const useHasWeapons = (): boolean => {
  const items = useInventoryItems();
  
  return useMemo(() => {
    return items.some(item => item.category === 'weapon');
  }, [items]);
};

/**
 * Returns whether the player has any healing items
 */
export const useHasHealingItems = (): boolean => {
  const items = useInventoryItems();
  
  return useMemo(() => {
    return items.some(item => (item.category as string) === 'medical' || (item.category as string) === 'healing');
  }, [items]);
};

/**
 * Returns whether the player has a specific item by ID
 */
export const useHasItem = (itemId: string): boolean => {
  const items = useInventoryItems();
  
  return useMemo(() => {
    return items.some(item => item.id === itemId);
  }, [items, itemId]);
};

/**
 * Returns the total number of inventory items
 */
export const useInventoryCount = (): number => {
  const items = useInventoryItems();
  
  return useMemo(() => {
    return items.length;
  }, [items]);
};

/**
 * Returns the number of items of a specific category
 */
export const useInventoryCategoryCount = (category: string): number => {
  const items = useInventoryItems();
  
  return useMemo(() => {
    return items.filter(item => item.category === category).length;
  }, [items, category]);
};

/**
 * Returns inventory statistics including counts by category
 */
export const useInventoryStats = (): { totalItems: number; totalQuantity: number; weaponCount: number; healingCount: number } => {
  const items = useInventoryItems();
  
  return useMemo(() => {
    return {
      totalItems: items.length,
      totalQuantity: items.reduce((sum, item) => sum + (item.quantity || 1), 0),
      weaponCount: items.filter(item => item.category === 'weapon').length,
      healingCount: items.filter(item => (item.category as string) === 'medical' || (item.category as string) === 'healing').length
    };
  }, [items]);
};

// Keeping these aliases for backward compatibility
export const useInventoryItemById = useInventoryItem;
export const useInventoryItemsByCategory = useInventoryByCategory;
