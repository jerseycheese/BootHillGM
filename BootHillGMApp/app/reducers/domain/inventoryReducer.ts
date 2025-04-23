/**
 * Inventory Reducer
 * 
 * Handles all inventory-related state changes including adding, removing,
 * updating, and using items in the game inventory.
 */

import { GameState } from '../../types/gameState';
import { GameAction } from '../../types/actions';
import { ActionTypes } from '../../types/actionTypes';
import { InventoryItem } from '../../types/item.types';

/**
 * Process inventory-related actions
 * 
 * @param state Current game state
 * @param action Game action to process
 * @returns Updated game state
 */
export function inventoryReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case ActionTypes.ADD_ITEM: {
      const newItem = action.payload as InventoryItem;
      // Check if item already exists to update quantity
      const existingItemIndex = state.inventory.items.findIndex(item => item.id === newItem.id);

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const updatedItems = [...state.inventory.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + newItem.quantity
        };

        return {
          ...state,
          inventory: {
            ...state.inventory,
            items: updatedItems
          }
        };
      } else {
        // Add new item
        return {
          ...state,
          inventory: {
            ...state.inventory,
            items: [...state.inventory.items, newItem]
          }
        };
      }
    }
      
    case ActionTypes.REMOVE_ITEM:
      return {
        ...state,
        inventory: {
          ...state.inventory,
          items: state.inventory.items.filter(item => item.id !== action.payload)
        }
      };
      
    case ActionTypes.USE_ITEM: {
      const useItemId = action.payload;
      const useItemIndex = state.inventory.items.findIndex(item => item.id === useItemId);
      
      if (useItemIndex >= 0) {
        const updatedItems = [...state.inventory.items];
        const currentQuantity = updatedItems[useItemIndex].quantity;
        
        if (currentQuantity <= 1) {
          // Remove item if quantity will be 0
          updatedItems.splice(useItemIndex, 1);
        } else {
          // Decrease quantity
          updatedItems[useItemIndex] = {
            ...updatedItems[useItemIndex],
            quantity: currentQuantity - 1
          };
        }
        
        return {
          ...state,
          inventory: {
            ...state.inventory,
            items: updatedItems
          }
        };
      }
      return state;
    }
      
    case ActionTypes.UPDATE_ITEM_QUANTITY: {
      // Handle both payload formats for backward compatibility
      let itemId: string;
      let quantity: number;
      
      if (typeof action.payload === 'object' && action.payload !== null) {
        if ('itemId' in action.payload && 'quantity' in action.payload) {
          // New format: { itemId: string, quantity: number }
          itemId = action.payload.itemId as string;
          quantity = action.payload.quantity as number;
        } else if ('id' in action.payload && 'quantity' in action.payload) {
          // Alternate format: { id: string, quantity: number }
          itemId = action.payload.id as string;
          quantity = action.payload.quantity as number;
        } else {
          // Invalid payload format
          return state;
        }
      } else {
        // Invalid payload type
        return state;
      }
      
      // Find the item to update
      const itemToUpdateIndex = state.inventory.items.findIndex(item => item.id === itemId);
      
      if (itemToUpdateIndex >= 0) {
        const updatedItems = [...state.inventory.items];
        
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          updatedItems.splice(itemToUpdateIndex, 1);
        } else {
          // Set to specified quantity
          updatedItems[itemToUpdateIndex] = {
            ...updatedItems[itemToUpdateIndex],
            quantity
          };
        }
        
        return {
          ...state,
          inventory: {
            ...state.inventory,
            items: updatedItems
          }
        };
      }
      return state;
    }
      
    case ActionTypes.CLEAN_INVENTORY:
      return {
        ...state,
        inventory: {
          ...state.inventory,
          items: state.inventory.items.filter(item => item.quantity > 0)
        }
      };
      
    case ActionTypes.SET_INVENTORY: {
      const items = action.payload as InventoryItem[];

      return {
        ...state,
        inventory: {
          ...state.inventory,
          items: Array.isArray(items) ? items : [] // Ensure it's an array after casting
        }
      };
    }
      
    default:
      return state;
  }
}
