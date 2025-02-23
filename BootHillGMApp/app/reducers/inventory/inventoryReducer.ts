import { GameState } from "../../types/gameState";
import { GameEngineAction } from "../../types/gameActions";
import { determineIfWeapon } from "../../utils/ai/aiUtils";
import { findClosestWeapon } from "../../utils/weaponUtils";
import { Weapon } from "../../types/combat";

const initialState: Partial<GameState> = {
  inventory: [],
};

/**
 * Reducer function to handle game state updates related to inventory.
 * @param state - The current game state.
 * @param action - The action to be processed.
 * @returns The updated game state.
 */
export function inventoryReducer(state: Partial<GameState> = initialState, action: GameEngineAction): Partial<GameState> {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.inventory?.find((item) => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          inventory: state.inventory?.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      } else {
        const newItem = { ...action.payload };
        if (!newItem.category) {
          newItem.category = "general";
        }
        const isWeapon = determineIfWeapon(newItem.name);
        if (isWeapon) {
          newItem.category = "weapon";
          const closestWeapon = findClosestWeapon(newItem.name);
          if (closestWeapon) {
            newItem.weapon = closestWeapon;
          }
        }
        return { ...state, inventory: [...(state.inventory || []), newItem] };
      }
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        inventory: state.inventory?.filter((item) => item.id !== action.payload),
      };
    case 'USE_ITEM': {
      const updatedInventory = state.inventory
        ?.map((item) => {
          if (item.id === action.payload) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);

      return {
        ...state,
        inventory: updatedInventory,
      };
    }
    case 'UPDATE_ITEM_QUANTITY':
      return {
        ...state,
        inventory: state.inventory?.map(item =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        ).filter(item => item.quantity > 0)
      };
    case 'CLEAN_INVENTORY':
      return {
        ...state,
        inventory: state.inventory?.filter(item =>
          item.id &&
          item.name &&
          item.quantity > 0 &&
          !item.name.startsWith('REMOVED_ITEMS:')
        ),
      };
    case 'SET_INVENTORY':
      return { ...state, inventory: action.payload };
    case 'EQUIP_WEAPON': {
      const weaponItem = state.inventory?.find(item => item.id === action.payload);
      if (!weaponItem || weaponItem.category !== 'weapon') {
        // Handle invalid item to equip
        return state;
      }

      const updatedInventory = state.inventory?.map(item => ({
        ...item,
        isEquipped: item.id === action.payload ? true : false
      }));

      const weapon: Weapon = {
        id: weaponItem.id,
        name: weaponItem.name,
        modifiers: weaponItem.weapon?.modifiers ?? {
          accuracy: 0,
          range: 0,
          reliability: 0,
          damage: '0',
          speed: 0,
          ammunition: 0,
          maxAmmunition: 0
        },
        ammunition: weaponItem.weapon?.ammunition ?? 0,
        maxAmmunition: weaponItem.weapon?.maxAmmunition ?? 0
      };

      return {
        ...state,
        inventory: updatedInventory,
        character: state.character ? {
          ...state.character,
          weapon: weapon
        } : null
      };
    }
    case 'UNEQUIP_WEAPON': {
      const updatedInventory = state.inventory?.map(item => ({
        ...item,
        isEquipped: false
      }));

      return {
        ...state,
        inventory: updatedInventory,
        character: state.character ? {
          ...state.character,
          weapon: undefined
        } : null
      };
    }
    default:
      return state;
  }
}
