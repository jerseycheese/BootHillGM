import { GameState } from '../types/gameState';
import { GameEngineAction } from '../types/gameActions';
import { Character } from '../types/character';
import { Weapon } from '../types/combat';
import { ensureCombatState } from '../types/combat';
import { determineIfWeapon } from '../services/ai/index';
import { findClosestWeapon } from '../utils/weaponUtils';

/**
 * Reducer function to handle game state updates based on actions.
 * 
 * @param state - The current game state.
 * @param action - The action to be processed.
 * @returns The updated game state.
 */
export function gameReducer(state: GameState, action: GameEngineAction): GameState {
  switch (action.type) {
    case 'SET_PLAYER':
      return { ...state, currentPlayer: action.payload };
    case 'ADD_NPC':
      return { ...state, npcs: [...state.npcs, action.payload] };
    case 'SET_LOCATION':
      return { ...state, location: action.payload };
    case 'ADD_ITEM': {
      const existingItem = state.inventory.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          inventory: state.inventory.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      } else {
        const newItem = { ...action.payload };
        if (!newItem.category) {
          newItem.category = 'general';
        }
        determineIfWeapon(newItem.name, newItem.description)
          .then((isWeapon: boolean) => {
            if (isWeapon) {
              newItem.category = 'weapon';
              const closestWeapon = findClosestWeapon(newItem.name);
              if (closestWeapon) {
                newItem.weapon = closestWeapon;
              }
            }
          })
          .catch((error: Error) => {
            // Handle error during weapon determination
          });
        return { ...state, inventory: [...state.inventory, newItem] };
      }
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        inventory: state.inventory.filter(item => item.id !== action.payload)
      };
    case 'USE_ITEM': {
      const updatedInventory = state.inventory.map(item => {
        if (item.id === action.payload) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      }).filter(item => item.quantity > 0);

      return {
        ...state,
        inventory: updatedInventory
      };
    }
    case 'ADD_QUEST':
      return { ...state, quests: [...state.quests, action.payload] };
    case 'SET_CHARACTER':
      return { ...state, character: action.payload };
    case 'UPDATE_CHARACTER':
      if (!state.character) {
        return state;
      }
      return {
        ...state,
        character: {
          ...state.character,
          ...action.payload,
          attributes: {
            ...state.character.attributes,
            ...(action.payload.attributes || {})
          }
        }
      };
    case 'SET_NARRATIVE':
      return { ...state, narrative: action.payload };
    case 'SET_GAME_PROGRESS':
      return { ...state, gameProgress: action.payload };
    case 'UPDATE_JOURNAL':
      return { ...state, journal: Array.isArray(action.payload) ? action.payload : [...state.journal, action.payload] };
    case 'SET_OPPONENT': {
      if (!action.payload) {
        return { ...state, opponent: null };
      }

      const defaultAttributes = {
        speed: 5,
        gunAccuracy: 5,
        throwingAccuracy: 5,
        strength: 5,
        baseStrength: 5,
        bravery: 5,
        experience: 5
      };

      const opponent: Character = {
        name: action.payload.name ?? 'Unknown Opponent',
        inventory: action.payload.inventory ?? [],
        attributes: {
          ...defaultAttributes,
          ...(action.payload.attributes || {})
        },
        wounds: action.payload.wounds ?? [],
        isUnconscious: action.payload.isUnconscious ?? false
      };

      return { ...state, opponent };
    }
    case 'SET_COMBAT_ACTIVE':
      return {
        ...state,
        isCombatActive: action.payload,
        ...((!action.payload) && {
          opponent: null,
          combatState: undefined
        })
      };
    case 'UPDATE_COMBAT_STATE':
      return {
        ...state,
        combatState: action.payload 
          ? ensureCombatState({
              ...state.combatState,
              ...action.payload,
              isActive: true
            })
          : state.combatState
      };
    case 'SET_COMBAT_TYPE':
      return {
        ...state,
        combatState: ensureCombatState({
          ...state.combatState,
          combatType: action.payload,
          isActive: true
        })
      };
    case 'UPDATE_ITEM_QUANTITY':
      return {
        ...state,
        inventory: state.inventory.map(item =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        ).filter(item => item.quantity > 0)
      };
    case 'CLEAN_INVENTORY':
      return {
        ...state,
        inventory: state.inventory.filter(item => 
          item.id &&
          item.name && 
          item.quantity > 0 && 
          !item.name.startsWith('REMOVED_ITEMS:')
        ),
      };
    case 'SET_INVENTORY':
      return { ...state, inventory: action.payload };
    case 'SET_SAVED_TIMESTAMP':
      return { ...state, savedTimestamp: action.payload };
    case 'SET_STATE':
      return {
        ...state,
        ...action.payload,
        isCombatActive: Boolean(action.payload.isCombatActive),
        opponent: action.payload.opponent ? {
          ...action.payload.opponent,
          attributes: { ...action.payload.opponent.attributes },
          wounds: [...action.payload.opponent.wounds],
          isUnconscious: Boolean(action.payload.opponent.isUnconscious)
        } : null,
        combatState: action.payload.combatState 
          ? ensureCombatState(action.payload.combatState)
          : undefined,
        isClient: true
      };
    case 'SET_SUGGESTED_ACTIONS':
      return { ...state, suggestedActions: action.payload };
    case 'EQUIP_WEAPON': {
      const weaponItem = state.inventory.find(item => item.id === action.payload);
      if (!weaponItem || weaponItem.category !== 'weapon') {
        // Handle invalid item to equip
        return state;
      }

      const updatedInventory = state.inventory.map(item => ({
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
      const updatedInventory = state.inventory.map(item => ({
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
