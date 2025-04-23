/**
 * Inventory Selector Hooks
 * 
 * Custom hooks that provide access to inventory-related state.
 */

import { useMemo } from 'react';
import { useGameState } from '../../context/GameStateProvider';
import { InventoryItem } from '../../types/item.types';

/**
 * Returns all items in the inventory
 */
export const useInventoryItems = () => {
  const { state } = useGameState();
  return useMemo(() => {
    return state.inventory?.items || [];
  }, [state.inventory?.items]);
};

/**
 * Returns an item from the inventory by ID
 * @param id The ID of the item to find
 */
export const useInventoryItem = (id: string): InventoryItem | undefined => {
  const { state } = useGameState();
  return useMemo(() => {
    const items = state.inventory?.items || [];
    return items.find(item => item.id === id);
  }, [state.inventory?.items, id]);
};

/**
 * Returns all items in the inventory of a specific category
 * @param category The category to filter by
 */
export const useInventoryByCategory = (category: string): InventoryItem[] => {
  const { state } = useGameState();
  return useMemo(() => {
    const items = state.inventory?.items || [];
    return items.filter(item => 
      item.category === category // Only check category, 'type' is removed
    );
  }, [state.inventory?.items, category]);
};

/**
 * Returns all weapons in the inventory
 */
export const useWeapons = () => {
  const { state } = useGameState();
  return useMemo(() => {
    const items = state.inventory?.items || [];
    return items.filter(item => 
      item.category === 'weapon' // Only check category
    );
  }, [state.inventory?.items]);
};

/**
 * Returns the currently equipped weapon, if any
 */
export const useEquippedWeapon = () => {
  const { state } = useGameState();
  return useMemo(() => {
    const items = state.inventory?.items || [];
    return items.find(item => 
      (item.category === 'weapon') && // Only check category
      item.isEquipped
    );
  }, [state.inventory?.items]);
};

/**
 * Returns all medical items in the inventory
 */
export const useMedicalItems = () => {
  const { state } = useGameState();
  return useMemo(() => {
    const items = state.inventory?.items || [];
    return items.filter(item => 
      item.category === 'medical' // Only check category
    );
  }, [state.inventory?.items]);
};

/**
 * Returns whether the inventory has an item with the specified ID
 */
export const useHasItem = (id: string): boolean => {
  const { state } = useGameState();
  return useMemo(() => {
    const items = state.inventory?.items || [];
    return items.some(item => item.id === id);
  }, [state.inventory?.items, id]);
};

/**
 * Returns statistics about the inventory
 */
export const useInventoryStats = () => {
  const { state } = useGameState();
  return useMemo(() => {
    const items = state.inventory?.items || [];
    const totalItems = items.length;
    const totalQuantity = items.reduce((total, item) => total + (item.quantity || 1), 0);
    
    const categoryCounts: Record<string, number> = { /* Intentionally empty */ };
    items.forEach(item => {
      const category = item.category || 'unknown'; // Use only category
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    return {
      totalItems,
      totalQuantity,
      categoryCounts
    };
  }, [state.inventory?.items]);
};

/**
 * Returns the ID of the currently equipped weapon, if any
 */
export const useEquippedWeaponId = (): string | null => {
  const { state } = useGameState();
  return useMemo(() => {
    const items = state.inventory?.items || [];
    const equippedWeapon = items.find(item => 
      (item.category === 'weapon') && // Only check category
      item.isEquipped
    );
    return equippedWeapon?.id || null;
  }, [state.inventory?.items]);
};

/**
 * Returns all consumable items in the inventory
 */
export const useConsumableItems = () => {
  const { state } = useGameState();
  return useMemo(() => {
    const items = state.inventory?.items || [];
    return items.filter(item => 
      item.category === 'consumable' // Only check category
    );
  }, [state.inventory?.items]);
};

// For backward compatibility, export useItemById as an alias for useInventoryItem
export const useItemById = useInventoryItem;
