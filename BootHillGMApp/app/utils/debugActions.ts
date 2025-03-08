import { GameEngineAction } from "../types/gameActions";
import { Character } from "../types/character";
import { initialNarrativeState } from "../types/narrative.types";

/**
 * Initializes a test combat scenario with a default opponent.
 * Sets up a basic brawling combat state.
 *
 * @returns {GameEngineAction} - The action to set the game state for test combat.
 */
export const initializeTestCombat = (): GameEngineAction => {
  const testOpponent: Character = {
    id: "test_opponent",
    name: "Test Opponent",
    attributes: {
      speed: 5,
      gunAccuracy: 5,
      throwingAccuracy: 5,
      strength: 5,
      baseStrength: 5,
      bravery: 5,
      experience: 5,
    },
    minAttributes: {
      speed: 1,
      gunAccuracy: 1,
      throwingAccuracy: 1,
      strength: 1,
      baseStrength: 1,
      bravery: 1,
      experience: 0
    },
    maxAttributes: {
      speed: 20,
      gunAccuracy: 20,
      throwingAccuracy: 20,
      strength: 20,
      baseStrength: 20,
      bravery: 20,
      experience: 10
    },
    wounds: [],
    isUnconscious: false,
    isNPC: true,
    isPlayer: false,
    inventory: [],
  };

  return {
    type: "SET_STATE",
    payload: {
      opponent: testOpponent,
      isCombatActive: true,
      combatState: {
        rounds: 0,
        combatType: "brawling",
        isActive: true,
        winner: null,
        participants: [],
        brawling: {
          round: 1,
          playerModifier: 0,
          opponentModifier: 0,
          playerCharacterId: "", // Will be filled in by gameReducer
          opponentCharacterId: "test_opponent",
          roundLog: [],
        },
      },
      isClient: true,
    },
  };
};

/**
 * Creates a base character object for testing.
 *
 * @param {string} id - The character's ID.
 * @param {string} name - The character's name.
 * @returns {Character} - A base character object.
 */
export const createBaseCharacter = (id: string, name: string): Character => {
  const minAttributes = {
      speed: 1,
      gunAccuracy: 1,
      throwingAccuracy: 1,
      strength: 1,
      baseStrength: 1,
      bravery: 1,
      experience: 0
    };

  return {
    isNPC: false,
    isPlayer: true,
    id,
    name,
    inventory: [],
    attributes: {
      speed: minAttributes.speed,
      gunAccuracy: minAttributes.gunAccuracy,
      throwingAccuracy: minAttributes.throwingAccuracy,
      strength: minAttributes.strength,
      baseStrength: 10, // Default base strength
      bravery: minAttributes.bravery,
      experience: minAttributes.experience,
    },
    minAttributes: minAttributes,
    maxAttributes: {
      speed: 20,
      gunAccuracy: 20,
      throwingAccuracy: 20,
      strength: 20,
      baseStrength: 20,
      bravery: 20,
      experience: 10
    },
    wounds: [],
    isUnconscious: false,
  };
};

/**
 * Resets the game state to its initial values.
 * Clears character data, inventory, journal, and narrative state.
 *
 * @returns {GameEngineAction} - The action to reset the game state.
 */
export const resetGame = (): GameEngineAction => {
  return {
    type: "SET_STATE",
    payload: {
      character: createBaseCharacter('test_character', 'Test Character'),
      inventory: [],
      journal: [],
      narrative: initialNarrativeState,
      location: null,
      isCombatActive: false,
      combatState: undefined,
      opponent: null,
      gameProgress: 0,
      npcs: [],
      quests: [],
    },
  };
};
