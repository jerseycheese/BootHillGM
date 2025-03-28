import { InventoryItem } from '../item.types';

/**
 * Inventory action types
 */
export type InventoryActionType =
  | 'inventory/ADD_ITEM'
  | 'inventory/REMOVE_ITEM'
  | 'inventory/USE_ITEM'
  | 'inventory/UPDATE_ITEM_QUANTITY'
  | 'inventory/CLEAN_INVENTORY'
  | 'inventory/SET_INVENTORY'
  | 'inventory/EQUIP_WEAPON'
  | 'inventory/UNEQUIP_WEAPON';

/**
 * Inventory action interfaces
 */
export interface AddItemAction {
  type: 'inventory/ADD_ITEM';
  payload: InventoryItem;
}

export interface RemoveItemAction {
  type: 'inventory/REMOVE_ITEM';
  payload: string; // Item ID
}

export interface UseItemAction {
  type: 'inventory/USE_ITEM';
  payload: string; // Item ID
}

export interface UpdateItemQuantityAction {
  type: 'inventory/UPDATE_ITEM_QUANTITY';
  payload: {
    id: string;
    quantity: number;
  };
}

export interface CleanInventoryAction {
  type: 'inventory/CLEAN_INVENTORY';
}

export interface SetInventoryAction {
  type: 'inventory/SET_INVENTORY';
  payload: InventoryItem[];
}

export interface EquipWeaponAction {
  type: 'inventory/EQUIP_WEAPON';
  payload: string; // Weapon Item ID
}

export interface UnequipWeaponAction {
  type: 'inventory/UNEQUIP_WEAPON';
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
