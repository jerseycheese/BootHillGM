import { InventoryState, initialInventoryState } from '../../types/state/inventoryState';
import { GameAction } from '../../types/actions';
import { determineIfWeapon } from '../../utils/ai/aiUtils';
import { findClosestWeapon } from '../../utils/weaponUtils';
import { InventoryItem, ItemCategory, ItemRequirements, ItemEffect } from '../../types/item.types';
import { Weapon } from '../../types/weapon.types';
import {
  isNonNullObject,
  isArray,
  isString,
  isInventoryItem,
  hasId,
  safeGet
} from '../utils/typeGuards';

/**
 * Convert an unknown object to a valid InventoryItem
 */
function ensureValidItem(item: unknown): InventoryItem {
  // If it's already a valid item, just return it
  if (isInventoryItem(item)) {
    return item;
  }

  // Create a base item with required properties
  const validItem: InventoryItem = {
    id: safeGet<string>(item, 'id', `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`),
    name: safeGet<string>(item, 'name', 'Unknown Item'),
    description: safeGet<string>(item, 'description', ''),
    quantity: safeGet<number>(item, 'quantity', 1),
    category: safeGet<ItemCategory>(item, 'category', 'general')
  };

  // Copy over other optional properties if they exist
  if (isNonNullObject(item)) {
    if ('requirements' in item) validItem.requirements = item.requirements as ItemRequirements;
    if ('effect' in item) validItem.effect = item.effect as ItemEffect;
    if ('usePrompt' in item) validItem.usePrompt = String(item.usePrompt);
    if ('weapon' in item) validItem.weapon = item.weapon as Weapon;
    if ('isEquipped' in item) validItem.isEquipped = Boolean(item.isEquipped);
  }

  return validItem;
}

/**
 * Ensures the state has a valid items array of InventoryItem type
 */
function ensureItemsArray(state: unknown): InventoryState {
  // If state is null or undefined, use initial state
  if (!state) {
    return initialInventoryState;
  }

  // If state is an array (legacy format), wrap it as items with proper typing
  if (isArray(state)) {
    return {
      items: state.map(item => ensureValidItem(item))
    };
  }

  // If state is an object but state.items is missing or not an array, initialize it
  if (isNonNullObject(state)) {
    const stateObj = state as Record<string, unknown>;

    if (!('items' in stateObj) || !isArray(stateObj.items)) {
      return { ...stateObj, items: [] } as InventoryState;
    }

    // If state.items exists but needs proper typing
    return {
      ...stateObj,
      items: stateObj.items.map(item => ensureValidItem(item))
    } as InventoryState;
  }

  // Return initialized state if we reach here somehow
  return initialInventoryState;
}

/**
 * Create an InventoryItem from an ADD_ITEM payload
 * Used to ensure consistent creation of items from payloads
 */
function createItemFromPayload(payload: unknown): InventoryItem {
  if (isString(payload)) {
    // If payload is just a string ID
    return {
      id: payload,
      name: 'Unknown Item',
      description: '',
      quantity: 1,
      category: 'general'
    };
  }

  if (isNonNullObject(payload)) {
    // Extract the basic properties we need
    const item: InventoryItem = {
      id: safeGet<string>(payload, 'id', `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`),
      name: safeGet<string>(payload, 'name', 'Unknown Item'),
      description: safeGet<string>(payload, 'description', ''),
      quantity: safeGet<number>(payload, 'quantity', 1),
      category: safeGet<ItemCategory>(payload, 'category', 'general')
    };

    // Copy over other properties if they exist
    const typedPayload = payload as Record<string, unknown>;
    if ('requirements' in typedPayload) item.requirements = typedPayload.requirements as ItemRequirements;
    if ('effect' in typedPayload) item.effect = typedPayload.effect as ItemEffect;
    if ('usePrompt' in typedPayload) item.usePrompt = String(typedPayload.usePrompt);
    if ('weapon' in typedPayload) item.weapon = typedPayload.weapon as Weapon;
    if ('isEquipped' in typedPayload) item.isEquipped = Boolean(typedPayload.isEquipped);

    return item;
  }

  // Fallback for unexpected payload types
  return {
    id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: 'Unknown Item',
    description: '',
    quantity: 1,
    category: 'general'
  };
}

/**
 * Custom type guard for checking if an action has a payload
 */
function hasPayload<T>(action: GameAction): action is GameAction & { payload: T } {
  return 'payload' in action && action.payload !== undefined;
}

/**
 * Inventory slice reducer
 * Handles all inventory-related state updates
 */
export function inventoryReducer(
  state: InventoryState = initialInventoryState,
  action: GameAction
): InventoryState {
  // Make sure we have a valid state structure before any operations
  const safeState = ensureItemsArray(state);
  // Removed logging

  // Use action.type as a string for comparison
  const actionType = action.type as string;

  // ADD_ITEM and inventory/ADD_ITEM
  if (actionType === 'ADD_ITEM' || actionType === 'inventory/ADD_ITEM') {
    if (!hasPayload<unknown>(action)) {
      return safeState;
    }

    const payload = action.payload;
    const itemId = isString(payload) ? payload :
                  isNonNullObject(payload) && 'id' in payload ? String(payload.id) : '';

    if (!itemId) {
      console.warn('ADD_ITEM action missing item ID'); // Keep warn
      return safeState;
    }

    // Check if the item already exists
    const existingItem = safeState.items.find((item) => item.id === itemId);

    if (existingItem) {
      // Update existing item
      return {
        ...safeState,
        items: safeState.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                ...(isNonNullObject(payload) ? payload : {}),
                quantity: (item.quantity || 1) + (isNonNullObject(payload) && 'quantity' in payload ? Number(payload.quantity) : 1)
              }
            : item
        )
      };
    } else {
      // Create a new item
      const newItem = createItemFromPayload(payload);

      // Check for weapon based on name
      if (newItem.category !== 'weapon' && newItem.name) {
        const isWeapon = determineIfWeapon(newItem.name);
        if (isWeapon) {
          newItem.category = "weapon";
          const closestWeapon = findClosestWeapon(newItem.name);
          if (closestWeapon) {
            newItem.weapon = closestWeapon;
          }
        }
      }

      // Return new state with the item added
      return {
        ...safeState,
        items: [...safeState.items, newItem]
      };
    }
  }

  // REMOVE_ITEM and inventory/REMOVE_ITEM
  else if (actionType === 'REMOVE_ITEM' || actionType === 'inventory/REMOVE_ITEM') {
    if (!hasPayload<unknown>(action)) {
      return safeState;
    }

    const payload = action.payload;
    const itemId = isString(payload) ? payload : hasId(payload) ? payload.id : '';

    if (!itemId) {
      return safeState;
    }

    return {
      ...safeState,
      items: safeState.items.filter((item) => item.id !== itemId)
    };
  }

  // UPDATE_ITEM_QUANTITY and inventory/UPDATE_ITEM_QUANTITY
  else if (actionType === 'UPDATE_ITEM_QUANTITY' || actionType === 'inventory/UPDATE_ITEM_QUANTITY') {
    if (!hasPayload<unknown>(action)) {
      return safeState;
    }

    const payload = action.payload;

    if (!isNonNullObject(payload)) {
      return safeState;
    }

    const itemId = isString(payload) ? payload : hasId(payload) ? payload.id : '';

    if (!itemId) {
      return safeState;
    }

    return {
      ...safeState,
      items: safeState.items.map(item =>
        item.id === itemId
          ? {
              ...item,
              // For non-string payloads, use the quantity field directly
              quantity: 'quantity' in payload && typeof payload.quantity === 'number'
                ? payload.quantity
                : item.quantity
            }
          : item
      )
    };
  }

  // USE_ITEM and inventory/USE_ITEM
  else if (actionType === 'USE_ITEM' || actionType === 'inventory/USE_ITEM') {
    if (!hasPayload<unknown>(action)) {
      return safeState;
    }

    const payload = action.payload;
    const itemId = isString(payload) ? payload : hasId(payload) ? payload.id : '';

    if (!itemId) {
      return safeState;
    }

    const updatedItems = safeState.items
      .map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity: Math.max(0, item.quantity - 1)
          };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);
    // Removed logging

    return {
      ...safeState,
      items: updatedItems
    };
  }

  // CLEAN_INVENTORY and inventory/CLEAN_INVENTORY
  else if (actionType === 'CLEAN_INVENTORY' || actionType === 'inventory/CLEAN_INVENTORY') {
    return {
      ...safeState,
      items: safeState.items.filter(item =>
        item.id &&
        item.name &&
        item.quantity > 0 &&
        !item.name.startsWith('REMOVED_ITEMS:')
      )
    };
  }

  // SET_INVENTORY and inventory/SET_INVENTORY
  else if (actionType === 'SET_INVENTORY' || actionType === 'inventory/SET_INVENTORY') {
    if (!hasPayload<unknown>(action)) {
      return safeState;
    }

    const payload = action.payload;

    // Handle array format (legacy) or object format with properly typed items
    if (isArray(payload)) {
      return {
        ...safeState,
        items: payload.map(item => ensureValidItem(item))
      };
    }

    // Handle object with items property
    if (isNonNullObject(payload)) {
      const typedPayload = payload as { items?: unknown[] };
      if ('items' in typedPayload && isArray(typedPayload.items)) {
        return {
          ...safeState,
          items: typedPayload.items.map(item => ensureValidItem(item))
        };
      }
    }

    // Fallback to current state if payload is invalid
    return safeState;
  }

  // EQUIP_WEAPON and inventory/EQUIP_WEAPON
  else if (actionType === 'EQUIP_WEAPON' || actionType === 'inventory/EQUIP_WEAPON') {
    if (!hasPayload<unknown>(action)) {
      return safeState;
    }

    const payload = action.payload;
    const itemId = isString(payload) ? payload : hasId(payload) ? payload.id : '';

    if (!itemId) {
      return safeState;
    }

    const weaponItem = safeState.items.find(item => item.id === itemId);

    if (!weaponItem || weaponItem.category !== 'weapon') {
      return safeState;
    }

    const updatedItems = safeState.items.map(item => ({
      ...item,
      isEquipped: item.id === itemId
    }));

    return {
      ...safeState,
      items: updatedItems
    };
  }

  // UNEQUIP_WEAPON and inventory/UNEQUIP_WEAPON
  else if (actionType === 'UNEQUIP_WEAPON' || actionType === 'inventory/UNEQUIP_WEAPON') {
    const updatedItems = safeState.items.map(item => ({
      ...item,
      isEquipped: false
    }));

    return {
      ...safeState,
      items: updatedItems
    };
  }

  // Handle SET_STATE for state restoration
  else if (actionType === 'SET_STATE') {
    if (!hasPayload<Partial<Record<string, unknown>>>(action)) {
      return safeState;
    }

    const payloadObj = action.payload;

    if (!('inventory' in payloadObj)) {
      return safeState;
    }

    // Ensure we have a valid items array in the restored state
    return ensureItemsArray(payloadObj.inventory);
  }

  // Default case
  return safeState;
}
