/**
 * Inventory Action Creators
 * 
 * This file contains action creators for the inventory reducer.
 */

import { InventoryItem } from '../types/item.types';
import { ActionTypes } from '../types/actionTypes';

/**
 * Action creator for adding an item to the inventory
 * @param item - Item to add
 * @returns Inventory action object
 */
export const addItem = (item: InventoryItem) => ({
  type: ActionTypes.ADD_ITEM,
  payload: item
});

/**
 * Action creator for removing an item from the inventory
 * @param itemId - ID of the item to remove
 * @returns Inventory action object
 */
export const removeItem = (itemId: string) => ({
  type: ActionTypes.REMOVE_ITEM,
  payload: itemId
});

/**
 * Action creator for using an item from the inventory
 * @param itemId - ID of the item to use
 * @returns Inventory action object
 */
export const useItem = (itemId: string) => ({
  type: ActionTypes.USE_ITEM,
  payload: itemId
});

/**
 * Action creator for updating an item's quantity
 * @param id - ID of the item to update
 * @param quantity - New quantity
 * @returns Inventory action object
 */
export const updateItemQuantity = (id: string, quantity: number) => ({
  type: ActionTypes.UPDATE_ITEM_QUANTITY,
  payload: { id, quantity }
});

/**
 * Action creator for equipping a weapon
 * @param itemId - ID of the weapon to equip
 * @returns Inventory action object
 */
export const equipWeapon = (itemId: string) => ({
  type: ActionTypes.EQUIP_WEAPON,
  payload: itemId
});

/**
 * Action creator for unequipping a weapon
 * @param itemId - ID of the weapon to unequip
 * @returns Inventory action object
 */
export const unequipWeapon = (itemId: string) => ({
  type: ActionTypes.UNEQUIP_WEAPON,
  payload: itemId
});

/**
 * Action creator for setting the entire inventory
 * @param items - Array of items to set as the inventory
 * @returns Inventory action object
 */
export const setInventory = (items: InventoryItem[]) => ({
  type: ActionTypes.SET_INVENTORY,
  payload: items
});

/**
 * Action creator for cleaning the inventory (removing items with quantity 0)
 * @returns Inventory action object
 */
export const cleanInventory = () => ({
  type: ActionTypes.CLEAN_INVENTORY
});
