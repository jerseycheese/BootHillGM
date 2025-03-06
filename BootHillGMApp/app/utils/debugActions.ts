import { GameEngineAction } from "../types/gameActions";
import { Character } from "../types/character";

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
