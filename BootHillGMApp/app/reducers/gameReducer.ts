import { GameState } from '../types/gameState';
import { GameEngineAction } from '../types/gameActions';
import { Character } from '../types/character';
import { Weapon } from '../types/combat';
import { ensureCombatState } from '../types/combat';
import { determineIfWeapon } from '../utils/ai/aiUtils';
import { findClosestWeapon } from '../utils/weaponUtils';
import { validateCombatEndState } from '../utils/combatStateValidation';

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
        const isWeapon = determineIfWeapon(newItem.name);
        if (isWeapon) {
          newItem.category = 'weapon';
          const closestWeapon = findClosestWeapon(newItem.name);
          if (closestWeapon) {
            newItem.weapon = closestWeapon;
          }
        }
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
    case 'SET_CHARACTER': {
      if (!action.payload) {
        return state;
      }
      
      const character: Character = {
        isNPC: action.payload.isNPC ?? false,
        isPlayer: action.payload.isPlayer ?? true,
        id: action.payload.id,
        name: action.payload.name,
        inventory: action.payload.inventory ?? [],
        attributes: {
          speed: action.payload.attributes?.speed ?? 5,
          gunAccuracy: action.payload.attributes?.gunAccuracy ?? 5,
          throwingAccuracy: action.payload.attributes?.throwingAccuracy ?? 5,
          strength: action.payload.attributes?.strength ?? 5,
          baseStrength: action.payload.attributes?.baseStrength ?? 5,
          bravery: action.payload.attributes?.bravery ?? 5,
          experience: action.payload.attributes?.experience ?? 5
        },
        wounds: action.payload.wounds ?? [],
        isUnconscious: action.payload.isUnconscious ?? false,
        weapon: action.payload.weapon,
        equippedWeapon: action.payload.equippedWeapon
      };

      return {
        ...state,
        character
      };
    }
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
            ...(action.payload.attributes || {}),
            baseStrength: state.character.attributes.baseStrength
          },
          wounds: [...(action.payload.wounds || state.character.wounds)],
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
        id: `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: action.payload.name ?? 'Unknown Opponent',
        inventory: action.payload.inventory ?? [],
        attributes: {
          ...defaultAttributes,
          ...(action.payload.attributes || {})
        },
        wounds: action.payload.wounds ?? [],
        isUnconscious: action.payload.isUnconscious ?? false,
        isNPC: true,
        isPlayer: false
      };

      return { ...state, opponent };
    }
    case 'SET_COMBAT_ACTIVE': {
      if (!action.payload) { // Only proceed if setting to false
        const validationResult = state.combatState ? validateCombatEndState(state.combatState) : { isValid: true, errors: [] };
        if (!validationResult.isValid) {
          return state; // Keep the state unchanged if validation fails
        }
      }
      return {
        ...state,
        isCombatActive: action.payload,
        ...((!action.payload) && {
          opponent: null,
          combatState: undefined
        })
      };
    }
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
    case 'END_COMBAT': {
      if (!state.combatState) {
        return state;
      }

      const validationResult = validateCombatEndState(state.combatState);

      if (!validationResult.isValid) {
        // TODO: Handle invalid combat end state (e.g., dispatch an error action)
      }
      // Forcibly end combat even if validation fails
      return {
        ...state,
        isCombatActive: false,
        opponent: null,
        combatState: undefined // Reset combat state
      };
    }
    default:
      return state;
  }
}
