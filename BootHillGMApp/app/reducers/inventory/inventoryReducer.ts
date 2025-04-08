/**
 * Inventory Reducer
 * 
 * Manages inventory state including items, equipped weapons, and related operations.
 * Supports multiple action types for adding, removing, and updating items.
 */

import { InventoryState, initialInventoryState } from '../../types/state/inventoryState';
import { InventoryItem } from '../../types/item.types';
import { GameAction } from '../../types/actions';

/**
 * Custom type guard for checking if an action has a payload
 */
function hasPayload<T>(action: GameAction): action is GameAction & { payload: T } {
  return 'payload' in action && action.payload !== undefined;
}

/**
 * Normalizes an item object to ensure it conforms to the InventoryItem interface
 * Handles potentially complex or malformed item structures from AI responses
 * 
 * @param item - The item to normalize, potentially from an AI response
 * @returns A properly formatted InventoryItem object
 */
function normalizeItem(item: unknown): InventoryItem {
  if (!item || typeof item !== 'object') {
    return {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: 'Unknown Item',
      description: 'An unidentified item',
      quantity: 1,
      category: 'general'
    };
  }
  
  const itemObj = item as Record<string, unknown>;
  
  return {
    id: typeof itemObj.id === 'string' ? itemObj.id : `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: typeof itemObj.name === 'string' ? itemObj.name : 'Unknown Item',
    description: typeof itemObj.description === 'string' ? itemObj.description : 'An unidentified item',
    quantity: typeof itemObj.quantity === 'number' ? itemObj.quantity : 1,
    category: typeof itemObj.category === 'string' ? itemObj.category : 'general',
    ...itemObj // Preserve other properties
  } as InventoryItem;
}

/**
 * Inventory Reducer
 * Processes inventory-related actions and updates state accordingly
 */
export function inventoryReducer(
  state: InventoryState = initialInventoryState,
  action: GameAction
): InventoryState {
  const actionType = action.type as string;
  
  switch(actionType) {
    case 'ADD_ITEM':
    case 'inventory/ADD_ITEM': {
      if (!hasPayload<unknown>(action)) {
        return state;
      }
      
      const newItem = normalizeItem(action.payload);
      const existingItemIndex = state.items.findIndex(item => item.id === newItem.id);
      
      if (existingItemIndex >= 0) {
        // If item already exists, increase quantity
        const updatedItems = [...state.items];
        const existingItem = updatedItems[existingItemIndex];
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + (newItem.quantity || 1)
        };
        
        return { ...state, items: updatedItems };
      }
      
      // Otherwise add as new item
      return { ...state, items: [...state.items, newItem] };
    }
    
    case 'REMOVE_ITEM':
    case 'inventory/REMOVE_ITEM': {
      if (!hasPayload<string>(action)) {
        return state;
      }
      
      const itemId = action.payload;
      return { ...state, items: state.items.filter(item => item.id !== itemId) };
    }
    
    case 'USE_ITEM':
    case 'inventory/USE_ITEM': {
      if (!hasPayload<string>(action)) {
        return state;
      }
      
      const itemId = action.payload;
      const itemIndex = state.items.findIndex(item => item.id === itemId);
      
      if (itemIndex < 0) {
        return state;
      }
      
      const updatedItems = [...state.items];
      const item = updatedItems[itemIndex];
      
      if (item.quantity <= 1) {
        // Remove item if quantity reaches zero
        return { ...state, items: updatedItems.filter((_, i) => i !== itemIndex) };
      }
      
      // Decrease quantity otherwise
      updatedItems[itemIndex] = { ...item, quantity: item.quantity - 1 };
      return { ...state, items: updatedItems };
    }
    
    case 'UPDATE_ITEM_QUANTITY':
    case 'inventory/UPDATE_ITEM_QUANTITY': {
      if (!hasPayload<{ id: string, quantity: number }>(action)) {
        return state;
      }
      
      const { id, quantity } = action.payload;
      const itemIndex = state.items.findIndex(item => item.id === id);
      
      if (itemIndex < 0) {
        return state;
      }
      
      const updatedItems = [...state.items];
      
      if (quantity <= 0) {
        // Remove item if quantity is zero or negative
        return { ...state, items: updatedItems.filter((_, i) => i !== itemIndex) };
      }
      
      // Update quantity otherwise
      updatedItems[itemIndex] = { ...updatedItems[itemIndex], quantity };
      return { ...state, items: updatedItems };
    }
    
    case 'CLEAN_INVENTORY':
    case 'inventory/CLEAN_INVENTORY': {
      // Remove items with quantity zero or less
      const validItems = state.items.filter(item => item.quantity > 0);
      return { ...state, items: validItems };
    }
    
    case 'SET_INVENTORY':
    case 'inventory/SET_INVENTORY': {
      if (!hasPayload<unknown>(action)) {
        return state;
      }
      
      const payload = action.payload;
      
      // Handle array of items
      if (Array.isArray(payload)) {
        const items = payload.map(item => normalizeItem(item));
        return { ...state, items };
      }
      
      // Handle object with items array
      if (payload && typeof payload === 'object' && 'items' in payload && Array.isArray(payload.items)) {
        const items = payload.items.map(item => normalizeItem(item));
        return { ...state, items };
      }
      
      return state;
    }
    
    case 'EQUIP_WEAPON':
    case 'inventory/EQUIP_WEAPON': {
      if (!hasPayload<string>(action)) {
        return state;
      }
      
      const itemId = action.payload;
      const item = state.items.find(i => i.id === itemId);
      
      if (!item || item.category !== 'weapon') {
        return state;
      }
      
      return { ...state, equippedWeaponId: itemId };
    }
    
    case 'UNEQUIP_WEAPON':
    case 'inventory/UNEQUIP_WEAPON': {
      return { ...state, equippedWeaponId: null };
    }
    
    case 'SET_STATE': {
      if (!hasPayload<Record<string, unknown>>(action)) {
        return state;
      }
      
      const { inventory } = action.payload;
      
      if (!inventory) {
        return state;
      }
      
      // Handle direct inventory state object
      if (typeof inventory === 'object' && 'items' in inventory && Array.isArray(inventory.items)) {
        const typedInventory = inventory as unknown as InventoryState;
        return {
          items: typedInventory.items.map(normalizeItem),
          equippedWeaponId: typedInventory.equippedWeaponId || null
        };
      }
      
      // Handle array of items (legacy format)
      if (Array.isArray(inventory)) {
        return {
          ...state,
          items: inventory.map(normalizeItem)
        };
      }
      
      return state;
    }
    
    default:
      return state;
  }
}