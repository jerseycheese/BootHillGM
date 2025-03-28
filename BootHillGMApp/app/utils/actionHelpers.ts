import { Character } from '../types/character';
import { ExtendedGameState } from '../types/extendedState';

/**
 * Creates a character object with default values for missing properties
 */
export function createCharacter(payload: Partial<Character>): Character {
  // Default attributes for a character
  const defaultAttributes = {
    speed: 5,
    gunAccuracy: 5,
    throwingAccuracy: 5,
    strength: 5,
    baseStrength: 5,
    bravery: 5,
    experience: 5,
  };

  return {
    isNPC: payload.isNPC ?? false,
    isPlayer: payload.isPlayer ?? true,
    id: payload.id ?? `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: payload.name ?? 'Unnamed Character',
    inventory: payload.inventory ?? { items: [] },
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
      ...defaultAttributes,
      ...(payload.attributes || {}),
    },
    wounds: payload.wounds ?? [],
    isUnconscious: payload.isUnconscious ?? false,
    weapon: payload.weapon,
    equippedWeapon: payload.equippedWeapon,
    strengthHistory: payload.strengthHistory ?? { 
      baseStrength: payload.attributes?.baseStrength ?? 5, 
      changes: [] 
    },
  };
}

/**
 * Updates a character in the state
 */
export function updateCharacterInState(
  state: ExtendedGameState, 
  character: Character, 
  isPlayer: boolean
): ExtendedGameState {
  // Create a new state to avoid mutation
  const newState: ExtendedGameState = { ...state };
  
  // Safely check if character state exists before accessing
  if (state.character) {
    // Update the character state
    newState.character = {
      ...state.character,
      player: isPlayer ? character : state.character.player,
      opponent: !isPlayer ? character : state.character.opponent
    };
  } else {
    // Create a new character state if none exists
    newState.character = {
      player: isPlayer ? character : null,
      opponent: !isPlayer ? character : null
    };
  }
  
  // For backward compatibility, also update the opponent reference
  if (!isPlayer) {
    newState.opponent = character;
  }
  
  return newState;
}

/**
 * Type guard to check if a value is a non-null object
 */
export function isNonNullObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}
