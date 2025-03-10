import { calculateUpdatedStrength } from "../utils/strengthSystem";
import { GameState } from "../types/gameState";
import { GameEngineAction, UpdateCharacterPayload } from "../types/gameActions";
import type { Character } from "../types/character";
import { ensureCombatState } from "../types/combat";
import { validateCombatEndState } from "../utils/combatStateValidation";
import { inventoryReducer } from "./inventory/inventoryReducer";
import { journalReducer } from "./journal/journalReducer";
import { narrativeReducer } from "./narrativeReducer";

/**
 * Reducer function to handle game state updates related to the game in general,
 * delegating to sub-reducers as necessary for specific domains.
 * @param state - The current game state.
 * @param action - The action to be processed.
 * @returns The updated game state.
 */
export function gameReducer(state: GameState, action: GameEngineAction): GameState {
    // Delegate inventory-related actions to the inventoryReducer
  if (
    action.type === 'ADD_ITEM' ||
    action.type === 'REMOVE_ITEM' ||
    action.type === 'USE_ITEM' ||
    action.type === 'UPDATE_ITEM_QUANTITY' ||
    action.type === 'CLEAN_INVENTORY' ||
    action.type === 'SET_INVENTORY' ||
    action.type === 'EQUIP_WEAPON' ||
    action.type === 'UNEQUIP_WEAPON'
  ) {
    return {
      ...state,
      ...inventoryReducer(state, action),
    };
  }

  // Delegate journal-related actions to the journalReducer
  if (action.type === 'UPDATE_JOURNAL') {
    return {
      ...state,
      ...journalReducer(state, action)
    };
  }

  // Delegate narrative-related actions to the narrativeReducer
  if (
    action.type === 'NAVIGATE_TO_POINT' ||
    action.type === 'SELECT_CHOICE' ||
    action.type === 'ADD_NARRATIVE_HISTORY' ||
    action.type === 'SET_DISPLAY_MODE' ||
    action.type === 'START_NARRATIVE_ARC' ||
    action.type === 'COMPLETE_NARRATIVE_ARC' ||
    action.type === 'ACTIVATE_BRANCH' ||
    action.type === 'COMPLETE_BRANCH' ||
    action.type === 'UPDATE_NARRATIVE_CONTEXT' ||
    action.type === 'RESET_NARRATIVE'
  ) {
    return {
      ...state,
      narrative: narrativeReducer(state.narrative, action),
    };
  }

  switch (action.type) {
    case 'SET_PLAYER':
      return { ...state, currentPlayer: action.payload };
    case 'ADD_NPC':
      return { ...state, npcs: [...state.npcs, action.payload] };
    case 'SET_LOCATION':
      return { ...state, location: action.payload }; // Store the entire location object
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
        minAttributes: action.payload.minAttributes ?? {
          speed: 0,
          gunAccuracy: 0,
          throwingAccuracy: 0,
          strength: 0,
          baseStrength: 0,
          bravery: 0,
          experience: 0,
        },
        maxAttributes: typeof action.payload.maxAttributes === 'number' ? {
          speed: action.payload.maxAttributes,
          gunAccuracy: action.payload.maxAttributes,
          throwingAccuracy: action.payload.maxAttributes,
          strength: action.payload.maxAttributes,
          baseStrength: action.payload.maxAttributes,
          bravery: action.payload.maxAttributes,
          experience: action.payload.maxAttributes,
        } : action.payload.maxAttributes ?? {
          speed: 10,
          gunAccuracy: 10,
          throwingAccuracy: 10,
          strength: 10,
          baseStrength: 10,
          bravery: 10,
          experience: 10,
        },
        attributes: {
          speed: action.payload.attributes?.speed ?? 5,
          gunAccuracy: action.payload.attributes?.gunAccuracy ?? 5,
          throwingAccuracy: action.payload.attributes?.throwingAccuracy ?? 5,
          strength: action.payload.attributes?.strength ?? 5,
          baseStrength: action.payload.attributes?.baseStrength ?? 5,
          bravery: action.payload.attributes?.bravery ?? 5,
          experience: action.payload.attributes?.experience ?? 5,
        },
        wounds: action.payload.wounds ?? [],
        isUnconscious: action.payload.isUnconscious ?? false,
        weapon: action.payload.weapon,
        equippedWeapon: action.payload.equippedWeapon,
        strengthHistory: { baseStrength: action.payload.attributes?.baseStrength ?? 5, changes: [] },
      };

      return {
        ...state,
        character,
      };
    }
    case 'UPDATE_CHARACTER': {
      if (!state.character) {
        return state;
      }
      const payload = action.payload as UpdateCharacterPayload;
      const targetCharacter = payload.id === state.character.id ? state.character : state.opponent;

      if (!targetCharacter) {
        return state;
      }

      let updatedAttributes = payload.attributes || {};
      let updatedHistory = targetCharacter.strengthHistory;

      if (payload.attributes && payload.attributes.strength !== undefined && payload.damageInflicted !== undefined) {
          const { newStrength, updatedHistory: newHistory } = calculateUpdatedStrength(targetCharacter, payload.damageInflicted);
          updatedAttributes = {
              ...targetCharacter.attributes,
              ...payload.attributes,
              strength: newStrength
          };
          updatedHistory = newHistory;
      }

      const updatedCharacter = {
        ...targetCharacter,
        ...payload, //should contain id and damageInflicted
        attributes: {
          ...targetCharacter.attributes,
          ...updatedAttributes,
          baseStrength: targetCharacter.attributes.baseStrength
        },
        wounds: [...(payload.wounds || targetCharacter.wounds)],
        strengthHistory: updatedHistory
      };

      const newState = (payload.id === state.character.id) ? {
        ...state,
        character: updatedCharacter
      } : {
        ...state,
        opponent: updatedCharacter
      }
      return newState;
    }
    case 'SET_NARRATIVE':
      return {
        ...state,
        narrative: {
          ...state.narrative,
          narrativeHistory: [...(state.narrative?.narrativeHistory || []), action.payload]
        }
      };
    case 'SET_GAME_PROGRESS':
      return { ...state, gameProgress: action.payload };
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
        experience: 5,
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
        isPlayer: false,
        minAttributes: action.payload.minAttributes ?? {
          speed: 0,
          gunAccuracy: 0,
          throwingAccuracy: 0,
          strength: 0,
          baseStrength: 0,
          bravery: 0,
          experience: 0,
        },
        maxAttributes: typeof action.payload.maxAttributes === 'number' ? {
          speed: action.payload.maxAttributes,
          gunAccuracy: action.payload.maxAttributes,
          throwingAccuracy: action.payload.maxAttributes,
          strength: action.payload.maxAttributes,
          baseStrength: action.payload.maxAttributes,
          bravery: action.payload.maxAttributes,
          experience: action.payload.maxAttributes,
        } : action.payload.maxAttributes ?? {
          speed: 10,
          gunAccuracy: 10,
          throwingAccuracy: 10,
          strength: 10,
          baseStrength: 10,
          bravery: 10,
          experience: 10,
        },
      };

      return { ...state, opponent };
    }
    case 'SET_COMBAT_ACTIVE': {
      if (!action.payload) { // Only proceed if setting to false
        const validationResult = state.combatState ? validateCombatEndState(state.combatState) : { isValid: true, errors: [] };
        if (!validationResult.isValid) {
          // TODO: Handle invalid combat end state (e.g., dispatch an error action)
        }
      }
      // Forcibly end combat even if validation fails.
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
    case 'END_COMBAT': {
      if (!state.combatState) {
        return state;
      }

      const validationResult = validateCombatEndState(state.combatState);

      if (!validationResult.isValid) {
        // Invalid combat end state. Dispatch an error action.
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
