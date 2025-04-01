import { Character } from '../../types/character';
import { CharacterState } from '../../types/state/characterState';
import { ExtendedGameState } from '../../types/extendedState';
import { calculateUpdatedStrength } from '../../utils/strengthSystem';
import { InventoryItem } from '../../types/item.types';
import { Wound } from '../../types/wound';
import { Weapon } from '../../types/weapon.types';

/**
/**
 * Type for inventory in character payload
 */
export interface CharacterInventory {
  items: InventoryItem[];
}

/**
 * Update character payload type
 */
export interface UpdateCharacterPayload {
  id: string;
  attributes?: {
    speed?: number;
    gunAccuracy?: number;
    throwingAccuracy?: number;
    strength?: number;
    baseStrength?: number;
    bravery?: number;
    experience?: number;
  };
  damageInflicted?: number;
  wounds?: Wound[];
  [key: string]: unknown;
}
/**
 * Character set payload type
 */
export interface CharacterSetPayload {
  id: string;
  name: string;
  isNPC?: boolean;
  isPlayer?: boolean;
  inventory?: CharacterInventory | InventoryItem[];
  minAttributes?: {
    speed: number;
    gunAccuracy: number;
    throwingAccuracy: number;
    strength: number;
    baseStrength: number;
    bravery: number;
    experience: number;
  };
  maxAttributes?: number | {
    speed: number;
    gunAccuracy: number;
    throwingAccuracy: number;
    strength: number;
    baseStrength: number;
    bravery: number;
    experience: number;
  };
  attributes?: {
    speed?: number;
    gunAccuracy?: number;
    throwingAccuracy?: number;
    strength?: number;
    baseStrength?: number;
    bravery?: number;
    experience?: number;
  };
  wounds?: Wound[];
  isUnconscious?: boolean;
  weapon?: Partial<Weapon> | null;
  equippedWeapon?: Partial<InventoryItem> | null;
}

/**
 * Processes SET_CHARACTER action
 */
export function processSetCharacter(state: ExtendedGameState, payload: CharacterSetPayload | null): ExtendedGameState {
  if (!payload) {
    return state;
  }

  const playerCharacter: Character = {
    isNPC: payload.isNPC ?? false,
    isPlayer: payload.isPlayer ?? true,
    id: payload.id,
    name: payload.name,
    inventory: Array.isArray(payload.inventory) ? { items: [] } : payload.inventory ?? { items: [] },
    minAttributes: payload.minAttributes ?? {
      speed: 0,
      gunAccuracy: 0,
      throwingAccuracy: 0,
      strength: 0,
      baseStrength: 0,
      bravery: 0,
      experience: 0,
    },
    maxAttributes: typeof payload.maxAttributes === 'number' ? {
      speed: payload.maxAttributes,
      gunAccuracy: payload.maxAttributes,
      throwingAccuracy: payload.maxAttributes,
      strength: payload.maxAttributes,
      baseStrength: payload.maxAttributes,
      bravery: payload.maxAttributes,
      experience: payload.maxAttributes,
    } : payload.maxAttributes ?? {
      speed: 10,
      gunAccuracy: 10,
      throwingAccuracy: 10,
      strength: 10,
      baseStrength: 10,
      bravery: 10,
      experience: 10,
    },
    attributes: {
      speed: payload.attributes?.speed ?? 5,
      gunAccuracy: payload.attributes?.gunAccuracy ?? 5,
      throwingAccuracy: payload.attributes?.throwingAccuracy ?? 5,
      strength: payload.attributes?.strength ?? 5,
      baseStrength: payload.attributes?.baseStrength ?? 5,
      bravery: payload.attributes?.bravery ?? 5,
      experience: payload.attributes?.experience ?? 5,
    },
    wounds: payload.wounds ?? [],
    isUnconscious: payload.isUnconscious ?? false,
    // Type fixes: handle null values by converting to undefined
    weapon: payload.weapon === null ? undefined : payload.weapon as Weapon,
    equippedWeapon: payload.equippedWeapon === null ? undefined : payload.equippedWeapon as InventoryItem,
    strengthHistory: { baseStrength: payload.attributes?.baseStrength ?? 5, changes: [] },
  };

  // Update character state to match structure expected in GameState
  const characterState: CharacterState = {
    ...state.character,
    player: playerCharacter,
    opponent: state.character?.opponent || null
  };

  return {
    ...state,
    character: characterState
  };
}

/**
 * Processes UPDATE_CHARACTER action
 */
export function processUpdateCharacter(state: ExtendedGameState, payload: UpdateCharacterPayload): ExtendedGameState {
  if (!state.character) {
    return state;
  }
  
  // Find the target character in either character.player or character.opponent
  const isPlayerUpdate = state.character.player && payload.id === state.character.player.id;
  const targetCharacter = isPlayerUpdate ? state.character.player : state.character.opponent;

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
    ...payload,
    attributes: {
      ...targetCharacter.attributes,
      ...updatedAttributes,
      baseStrength: targetCharacter.attributes.baseStrength
    },
    wounds: [...(payload.wounds || targetCharacter.wounds)],
    strengthHistory: updatedHistory
  };

  // Update either player or opponent in character state
  const updatedCharacterState: CharacterState = {
    ...state.character,
    player: isPlayerUpdate ? updatedCharacter : state.character.player,
    opponent: !isPlayerUpdate ? updatedCharacter : state.character.opponent
  };

  // Create a new state with both the updated character slice and backward compatibility
  const newState: ExtendedGameState = {
    ...state,
    character: updatedCharacterState
  };

  // For backward compatibility
  if (!isPlayerUpdate) {
    newState.opponent = updatedCharacter;
  }

  return newState;
}

/**
 * Opponent set payload type
 */
export interface OpponentSetPayload {
  name?: string;
  inventory?: CharacterInventory | InventoryItem[];
  attributes?: {
    speed?: number;
    gunAccuracy?: number;
    throwingAccuracy?: number;
    strength?: number;
    baseStrength?: number;
    bravery?: number;
    experience?: number;
  };
  wounds?: Wound[];
  isUnconscious?: boolean;
  minAttributes?: {
    speed: number;
    gunAccuracy: number;
    throwingAccuracy: number;
    strength: number;
    baseStrength: number;
    bravery: number;
    experience: number;
  };
  maxAttributes?: number | {
    speed: number;
    gunAccuracy: number;
    throwingAccuracy: number;
    strength: number;
    baseStrength: number;
    bravery: number;
    experience: number;
  };
}

/**
 * Processes SET_OPPONENT action
 */
export function processSetOpponent(state: ExtendedGameState, payload: OpponentSetPayload | null): ExtendedGameState {
  if (!payload) {
    return { 
      ...state,
      character: {
        ...state.character,
        player: state.character?.player ?? null, // Ensure player is Character | null, handle potential null character slice
        opponent: null
      },
      opponent: null // For backward compatibility
    };
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
    name: payload.name ?? 'Unknown Opponent',
    inventory: Array.isArray(payload.inventory) ? { items: [] } : payload.inventory ?? { items: [] },
    attributes: {
      ...defaultAttributes,
      ...(payload.attributes || {})
    },
    wounds: payload.wounds ?? [],
    isUnconscious: payload.isUnconscious ?? false,
    isNPC: true,
    isPlayer: false,
    minAttributes: payload.minAttributes ?? {
      speed: 0,
      gunAccuracy: 0,
      throwingAccuracy: 0,
      strength: 0,
      baseStrength: 0,
      bravery: 0,
      experience: 0,
    },
    maxAttributes: typeof payload.maxAttributes === 'number' ? {
      speed: payload.maxAttributes,
      gunAccuracy: payload.maxAttributes,
      throwingAccuracy: payload.maxAttributes,
      strength: payload.maxAttributes,
      baseStrength: payload.maxAttributes,
      bravery: payload.maxAttributes,
      experience: payload.maxAttributes,
    } : payload.maxAttributes ?? {
      speed: 10,
      gunAccuracy: 10,
      throwingAccuracy: 10,
      strength: 10,
      baseStrength: 10,
      bravery: 10,
      experience: 10,
    },
  };

  return { 
    ...state,
    character: {
      ...state.character,
      player: state.character?.player ?? null, // Ensure player is Character | null
      opponent
    },
    opponent // For backward compatibility
  };
}
