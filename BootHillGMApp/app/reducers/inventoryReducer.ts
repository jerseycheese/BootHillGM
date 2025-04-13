/**
 * Inventory Reducer
 * 
 * Manages player inventory state using the slice pattern
 */

import { GameAction } from '../types/actions';
import { InventoryState } from '../types/state/inventoryState';
import { InventoryItem, ItemCategory, ItemRequirements, ItemEffect } from '../types/item.types';
import { Weapon } from '../types/weapon.types';

/**
 * Initial state for the inventory reducer
 */
export const initialInventoryState: InventoryState = {
  items: [],
  equippedWeaponId: null
};

/**
 * Helper function to normalize item properties, ensuring names and categories are always strings
 */
const normalizeItem = (item: unknown): InventoryItem => {
  // Define valid categories
  const validCategories: ItemCategory[] = ['general', 'weapon', 'consumable', 'medical'];
  
  // Handle potentially malformed item objects
  const itemObj = typeof item === 'object' && item !== null ? item : {};
  
  // Normalize the name property
  let normalizedName: string;
  if (typeof (itemObj as Record<string, unknown>).name === 'object' && 
      (itemObj as Record<string, unknown>).name !== null && 
      'name' in ((itemObj as Record<string, Record<string, unknown>>).name) && 
      typeof ((itemObj as Record<string, Record<string, unknown>>).name).name === 'string') {
    normalizedName = ((itemObj as Record<string, Record<string, unknown>>).name).name as string;
  } else if (typeof (itemObj as Record<string, unknown>).name === 'string') {
    normalizedName = (itemObj as Record<string, string>).name;
  } else {
    normalizedName = 'Unknown Item';
    console.warn('[Reducer normalizeItem] Invalid item name format:', (itemObj as Record<string, unknown>).name);
  }
  
  // Normalize the category property
  let normalizedCategory: ItemCategory;
  
  // Check for category in itemObj.category.category (nested structure)
  if (typeof (itemObj as Record<string, unknown>).category === 'object' && 
      (itemObj as Record<string, unknown>).category !== null && 
      'category' in ((itemObj as Record<string, Record<string, unknown>>).category) && 
      typeof ((itemObj as Record<string, Record<string, unknown>>).category).category === 'string') {
    
    const categoryValue = ((itemObj as Record<string, Record<string, unknown>>).category).category;
    normalizedCategory = validCategories.includes(categoryValue as ItemCategory) 
      ? categoryValue as ItemCategory 
      : 'general';
  } 
  // Check for category in itemObj.name.category (observed error case)
  else if (typeof (itemObj as Record<string, unknown>).name === 'object' && 
      (itemObj as Record<string, unknown>).name !== null && 
      'category' in ((itemObj as Record<string, Record<string, unknown>>).name) && 
      typeof ((itemObj as Record<string, Record<string, unknown>>).name).category === 'string') {
    
    const categoryValue = ((itemObj as Record<string, Record<string, unknown>>).name).category;
    normalizedCategory = validCategories.includes(categoryValue as ItemCategory) 
      ? categoryValue as ItemCategory 
      : 'general';
  } 
  // Check for direct string category
  else if (typeof (itemObj as Record<string, unknown>).category === 'string') {
    const categoryValue = (itemObj as Record<string, string>).category;
    normalizedCategory = validCategories.includes(categoryValue as ItemCategory) 
      ? categoryValue as ItemCategory 
      : 'general';
  } else {
    // Default fallback
    normalizedCategory = 'general';
  }
  
  // Normalize quantity to ensure it's a number
  let normalizedQuantity: number;
  if (typeof (itemObj as Record<string, unknown>).quantity === 'number') {
    normalizedQuantity = (itemObj as Record<string, number>).quantity;
  } else if (typeof (itemObj as Record<string, unknown>).quantity === 'string' && 
            !isNaN(Number((itemObj as Record<string, string>).quantity))) {
    normalizedQuantity = Number((itemObj as Record<string, string>).quantity);
  } else {
    normalizedQuantity = 1; // Default quantity
  }
  
  // Get item ID
  const id = typeof (itemObj as Record<string, unknown>).id === 'string' 
    ? (itemObj as Record<string, string>).id 
    : '';
    
  // Get description
  const description = typeof (itemObj as Record<string, unknown>).description === 'string' 
    ? (itemObj as Record<string, string>).description 
    : `A ${normalizedName}`;
    
  // Get other properties with proper type casting
  const requirements = (itemObj as Record<string, unknown>).requirements as ItemRequirements | undefined;
  const effect = (itemObj as Record<string, unknown>).effect as ItemEffect | undefined;
  const usePrompt = typeof (itemObj as Record<string, unknown>).usePrompt === 'string' 
    ? (itemObj as Record<string, string>).usePrompt 
    : undefined;
  const weapon = (itemObj as Record<string, unknown>).weapon as Weapon | undefined;
  const isEquipped = !!(itemObj as Record<string, unknown>).isEquipped;
  
  // Return normalized item with all required properties
  return {
    id,
    name: normalizedName,
    description,
    category: normalizedCategory,
    quantity: normalizedQuantity,
    requirements,
    effect,
    usePrompt,
    weapon,
    isEquipped
  };
};

/**
 * Inventory reducer
 */
const inventoryReducer = (state: InventoryState = initialInventoryState, action: GameAction): InventoryState => {
  switch (action.type) {
    case 'inventory/ADD_ITEM': {
      const rawNewItem = ('payload' in action) ? action.payload : null;
      
      if (!rawNewItem) return state;
      
      // Normalize the item to ensure all properties have proper formats
      const newItem = normalizeItem(rawNewItem);
      
      // Check if item already exists
      const existingItemIndex = state.items.findIndex(item => item.id === newItem.id);
      
      let updatedItems;
      if (existingItemIndex >= 0) {
        // Update quantity of existing item - More explicit approach
        const oldItem = state.items[existingItemIndex];
        const newQuantity = Number(oldItem.quantity) + Number(newItem.quantity);
        // Create a completely new object, copying necessary fields
        const updatedItem = {
            ...oldItem,
            quantity: newQuantity // Assign the calculated numeric quantity
        };
        // Create the updated items array immutably
        updatedItems = [
            ...state.items.slice(0, existingItemIndex),
            updatedItem,
            ...state.items.slice(existingItemIndex + 1)
        ];
      } else {
        // Add new item
        updatedItems = [...state.items, newItem];
      }
      
      return {
        ...state,
        items: updatedItems
      };
    }
    
    case 'inventory/REMOVE_ITEM': {
      const itemId = ('payload' in action) ? action.payload as string : null;
      
      if (!itemId) return state;
      
      // Remove the item
      return {
        ...state,
        items: state.items.filter(item => item.id !== itemId)
      };
    }

    case 'inventory/USE_ITEM': {
      const itemId = ('payload' in action) ? action.payload as string : null;

      if (!itemId) return state;

      const updatedItems = state.items.map(item => {
        // Only decrement quantity if item matches ID, has quantity > 0, AND is consumable or medical
        if (item.id === itemId && item.quantity > 0 && (item.category === 'consumable' || item.category === 'medical')) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      });

      // Only update state if an item was actually modified
      if (updatedItems.some((item, index) => item.quantity !== state.items[index].quantity)) {
        return {
          ...state,
          items: updatedItems
        };
      }

      return state; // Return original state if no item was found or quantity was already 0
    }
    
    case 'inventory/UPDATE_ITEM_QUANTITY': {
      if (!('payload' in action)) return state;
      
      const { id, quantity } = action.payload as { id: string; quantity: number };
      
      // Update item quantity
      return {
        ...state,
        items: state.items.map(item => 
          item.id === id 
            ? { ...item, quantity } 
            : item
        )
      };
    }
    
    case 'inventory/EQUIP_WEAPON': {
      const weaponId = ('payload' in action) ? action.payload as string : null;
      
      if (!weaponId) return state;
      
      // Equip weapon and unequip others
      return {
        ...state,
        equippedWeaponId: weaponId,
        items: state.items.map(item => ({
          ...item,
          isEquipped: item.id === weaponId
        }))
      };
    }
    
    case 'inventory/UNEQUIP_WEAPON': {
      const weaponId = ('payload' in action) ? action.payload as string : null;
      
      if (!weaponId) return state;
      
      // Unequip the specified weapon
      return {
        ...state,
        equippedWeaponId: state.equippedWeaponId === weaponId ? null : state.equippedWeaponId,
        items: state.items.map(item => 
          item.id === weaponId 
            ? { ...item, isEquipped: false } 
            : item
        )
      };
    }
    
    case 'inventory/SET_INVENTORY': {
      const rawItems = ('payload' in action) ? action.payload as unknown[] : null;
      
      if (!rawItems) return state;
      
      // Normalize all items to ensure proper data structure
      const normalizedItems = rawItems.map(normalizeItem);
      
      // Set entire inventory
      return {
        ...state,
        items: normalizedItems
      };
    }
    
    case 'inventory/CLEAN_INVENTORY': {
      // Remove items with quantity 0
      return {
        ...state,
        items: state.items.filter(item => item.quantity > 0)
      };
    }
    
    default:
      return state;
  }
};

export default inventoryReducer;