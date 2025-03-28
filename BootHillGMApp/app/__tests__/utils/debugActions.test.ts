import { initializeTestCombat } from '../../utils/debugActions';
import { GameEngineAction } from '../../types/gameActions';

describe('debugActions', () => {
  it('should create an action to initialize test combat', () => {
    const expectedAction: GameEngineAction = {
      type: "SET_STATE",
      payload: {
        character: {
          player: null,
          opponent: {
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
            inventory: {
              items: []
            },
          },
        },
        combat: {
          rounds: 0,
          combatType: "brawling",
          isActive: true,
          playerTurn: true,
          playerCharacterId: "", // Will be filled in by gameReducer
          opponentCharacterId: "test_opponent",
          combatLog: [],
          roundStartTime: expect.any(Number), // Add back for type compliance, checked separately
          modifiers: {
            player: 0,
            opponent: 0
          },
          currentTurn: null
        },
        isClient: true,
      },
    };

    // Call the function to get the actual action
    const actualAction = initializeTestCombat();

    // Ensure we have the correct action type before accessing payload
    if (actualAction.type === 'SET_STATE' && expectedAction.type === 'SET_STATE') {
      // Also ensure the combat slice exists in the payload
      if (!actualAction.payload.combat) {
        throw new Error('Actual action payload is missing the combat slice');
      }
      // 1. Check the dynamic timestamp separately
      expect(actualAction.payload.combat.roundStartTime).toEqual(expect.any(Number));

      // 2. Create a copy of the actual payload and remove the dynamic part for comparison
      const actualPayloadForComparison = JSON.parse(JSON.stringify(actualAction.payload));
      delete actualPayloadForComparison.combat.roundStartTime;

      // 3. Create the expected payload *without* the dynamic part
      const expectedPayloadWithoutTimestamp = JSON.parse(JSON.stringify(expectedAction.payload));
      delete expectedPayloadWithoutTimestamp.combat.roundStartTime; // Remove it from expected for comparison

      // 4. Compare the static parts
      expect(actualPayloadForComparison).toEqual(expectedPayloadWithoutTimestamp);
      expect(actualAction.type).toEqual(expectedAction.type); // Type comparison is still useful
    } else {
      // Fail the test if the action type is not SET_STATE
      throw new Error(`Expected action type SET_STATE but received ${actualAction.type}`);
    }
  });
});
