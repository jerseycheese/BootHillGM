import { InventoryItem } from '../item.types';
import { ActionTypes } from '../actionTypes';

/**
 * Inventory action interfaces using ActionTypes
 */
export interface AddItemAction {
  type: typeof ActionTypes.ADD_ITEM;
  payload: InventoryItem;
}

export interface RemoveItemAction {
  type: typeof ActionTypes.REMOVE_ITEM;
  payload: string; // Item ID
}

export interface UseItemAction {
  type: typeof ActionTypes.USE_ITEM;
  payload: string; // Item ID
}

export interface UpdateItemQuantityAction {
  type: typeof ActionTypes.UPDATE_ITEM_QUANTITY;
  payload: {
    id: string;
    quantity: number;
  };
}

export interface CleanInventoryAction {
  type: typeof ActionTypes.CLEAN_INVENTORY;
}

export interface SetInventoryAction {
  type: typeof ActionTypes.SET_INVENTORY;
  payload: InventoryItem[];
}

export interface EquipWeaponAction {
  type: typeof ActionTypes.EQUIP_WEAPON;
  payload: string; // Weapon Item ID
}

export interface UnequipWeaponAction {
  type: typeof ActionTypes.UNEQUIP_WEAPON;
  payload: string; // Weapon Item ID
}

/**
 * Combined inventory actions type
 */
export type InventoryAction =
  | AddItemAction
  | RemoveItemAction
  | UseItemAction
  | UpdateItemQuantityAction
  | CleanInventoryAction
  | SetInventoryAction
  | EquipWeaponAction
  | UnequipWeaponAction;
