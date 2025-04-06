/**
 * Inventory Reducer
 * 
 * Manages player inventory state using the slice pattern
 */

import { GameAction } from '../types/actions';
import { InventoryState } from '../types/state/inventoryState';
import { InventoryItem } from '../types/item.types';

/**
 * Initial state for the inventory reducer
 */
export const initialInventoryState: InventoryState = {
  items: [],
  equippedWeaponId: null
};

/**
 * Inventory reducer
 */
const inventoryReducer = (state: InventoryState = initialInventoryState, action: GameAction): InventoryState => {
  switch (action.type) {
    case 'inventory/ADD_ITEM': {
      const newItem = ('payload' in action) ? action.payload as InventoryItem : null;
      
      if (!newItem) return state;
      
      // Check if item already exists
      const existingItemIndex = state.items.findIndex(item => item.id === newItem.id);
      
      let updatedItems;
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + newItem.quantity
        };
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
      const items = ('payload' in action) ? action.payload as InventoryItem[] : null;
      
      if (!items) return state;
      
      // Set entire inventory
      return {
        ...state,
        items
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