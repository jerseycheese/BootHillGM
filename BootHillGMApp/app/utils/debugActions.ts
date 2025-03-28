import { GameEngineAction } from "../types/gameActions";
import { Character } from "../types/character";
import { initialNarrativeState } from "../types/narrative.types";
import { CharacterState } from "../types/state/characterState";
import { InventoryState } from "../types/state/inventoryState";
import { JournalState } from "../types/state/journalState";
import { CombatState } from "../types/state/combatState";

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
    inventory: { items: [] },
  };

  // Create a combat state object using the correct interface
  const combatState: CombatState = {
    rounds: 0,
    combatType: "brawling",
    isActive: true,
    // Adding required properties from CombatState interface
    playerTurn: true,
    playerCharacterId: "", // Will be filled in by gameReducer
    opponentCharacterId: "test_opponent",
    combatLog: [],
    roundStartTime: Date.now(),
    modifiers: {
      player: 0,
      opponent: 0
    },
    currentTurn: null
  };

  // Create a character state with player and opponent
  const characterState: CharacterState = {
    player: null, // Will be set by existing player in state
    opponent: testOpponent
  };

  return {
    type: "SET_STATE",
    payload: {
      // Use the domain-specific slices
      character: characterState,
      combat: combatState,
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
    inventory: { items: [] },
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
  // Create test character
  const testCharacter = createBaseCharacter('test_character', 'Test Character');
  
  // Create character state
  const characterState: CharacterState = {
    player: testCharacter,
    opponent: null
  };
  
  // Create inventory state
  const inventoryState: InventoryState = {
    items: []
  };
  
  // Create journal state
  const journalState: JournalState = {
    entries: []
  };
  
  // Create empty combat state with all required properties
  const combatState: CombatState = {
    rounds: 0,
    combatType: 'brawling',
    isActive: false,
    playerTurn: true,
    playerCharacterId: '',
    opponentCharacterId: '',
    combatLog: [],
    roundStartTime: 0,
    modifiers: {
      player: 0,
      opponent: 0
    },
    currentTurn: null
  };

  return {
    type: "SET_STATE",
    payload: {
      // Use domain-specific state slices
      character: characterState,
      inventory: inventoryState,
      journal: journalState,
      narrative: initialNarrativeState,
      combat: combatState,
      
      // Top-level properties
      location: null,
      gameProgress: 0,
      npcs: [],
      quests: [],
    },
  };
};
