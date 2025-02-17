import { initializeTestCombat } from '../../utils/debugActions';
import { GameEngineAction } from '../../types/gameActions';

describe('debugActions', () => {
  it('should create an action to initialize test combat', () => {
    const expectedAction: GameEngineAction = {
      type: "SET_STATE",
      payload: {
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
          wounds: [],
          isUnconscious: false,
          isNPC: true,
          isPlayer: false,
          inventory: [],
        },
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
    expect(initializeTestCombat()).toEqual(expectedAction);
  });
});
