import { validateCombatEndState } from '../../utils/combatStateValidation';
import { CombatState, BrawlingState } from '../../types/combat';
import { GameState } from '../../types/gameState';
import { gameReducer } from '../../reducers/gameReducer';

describe('combatStateValidation', () => {
  describe('validateCombatEndState', () => {
    it('should validate a complete brawling end state', () => {
      const validState: CombatState = {
        isActive: true,
        combatType: 'brawling',
        winner: null,
        participants: [],
        rounds: 0,
        combatLog: []
      };

      const result = validateCombatEndState(validState);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required properties', () => {
      const invalidState = {
        combatType: 'brawling',
        // Missing participants and rounds
      } as unknown as CombatState;

      const result = validateCombatEndState(invalidState);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        code: 'MISSING_PROPERTY',
        message: 'Missing required property: participants',
        property: 'participants'
      });
      expect(result.errors).toContainEqual({
        code: 'INVALID_VALUE',
        message: 'Invalid value for rounds',
        property: 'rounds',
        expected: 'number >= 0',
        actual: undefined
      });
    });

    it('should clean up brawling-specific properties', () => {
      const stateWithExtraProps: CombatState = {
        isActive: true,
        combatType: 'brawling',
        winner: null,
        participants: [],
        rounds: 0,
        combatLog: [],
        brawling: {
          round: 1,
          playerModifier: 0,
          opponentModifier: 0,
          playerStrength: 10,
          playerBaseStrength: 10,
          opponentStrength: 10,
          opponentBaseStrength: 10,
          roundLog: []
        } // Test cleanup of brawling property
      };

      const result = validateCombatEndState(stateWithExtraProps);
      expect(result.isValid).toBe(true);
      expect(result.cleanedState).not.toHaveProperty('brawling');
    });

    it('should handle corrupted state objects', () => {
      const corruptedState = {
        invalidProperty: 'corrupted'
      } as unknown as CombatState;

      const result = validateCombatEndState(corruptedState);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        code: 'INVALID_VALUE',
        message: 'Invalid value for combatType',
        property: 'combatType',
        expected: 'brawling',
        actual: undefined
      });
      expect(result.errors).toContainEqual({
        code: 'MISSING_PROPERTY',
        message: 'Missing required property: participants',
        property: 'participants'
      });
      expect(result.errors).toContainEqual({
        code: 'INVALID_VALUE',
        message: 'Invalid value for rounds',
        property: 'rounds',
        expected: 'number >= 0',
        actual: undefined
      });
    });

    it('should integrate with combat reducer', () => {
      const defaultCharacter = {
        id: 'player',
        name: 'Player',
        isNPC: false,
        attributes: {
          speed: 5,
          gunAccuracy: 5,
          throwingAccuracy: 5,
          strength: 5,
          baseStrength: 5,
          bravery: 5,
          experience: 5
        },
        wounds: [],
        isUnconscious: false,
        inventory: [],
        isPlayer: true
      };

      const opponent = {
        id: 'opponent1',
        name: 'Opponent',
        isNPC: true,
        isPlayer: false,
        attributes: {
          speed: 5,
          gunAccuracy: 5,
          throwingAccuracy: 5,
          strength: 5,
          baseStrength: 5,
          bravery: 5,
          experience: 5
        },
        wounds: [],
        isUnconscious: false,
        inventory: []
      };
    
      const initialState: GameState = {
        currentPlayer: 'player',
        quests: [],
        isCombatActive: true,
        combatState: {
          isActive: true,
          combatType: 'brawling',
          winner: null,
          participants: [defaultCharacter, opponent],
          rounds: 0,
          combatLog: [],
          brawling: {
            round: 1,
            playerModifier: 0,
            opponentModifier: 0,
            playerStrength: 10,
            playerBaseStrength: 10,
            opponentStrength: 10,
            opponentBaseStrength: 10,
            roundLog: []
          } as BrawlingState
        },
        opponent: opponent,
        npcs: [],
        inventory: [],
        journal: [],
        character: defaultCharacter,
        location: '',
        gameProgress: 0,
        savedTimestamp: 0,
        suggestedActions: [],
        narrative: ''
      };
    
      // Test valid end combat
      let state = gameReducer(initialState, { type: 'END_COMBAT' });
      expect(state.isCombatActive).toBe(false);
      expect(state.opponent).toBeNull();
      expect(state.combatState).toBeUndefined();

      // Test invalid end combat (missing participants)
      const invalidState: GameState = {
        ...initialState,
        combatState: {
          isActive: true,
          combatType: 'brawling',
          winner: null,
          participants: undefined, // Invalid: missing participants
          rounds: 0,
          combatLog: [],
          brawling: {
            round: 1,
            playerModifier: 0,
            opponentModifier: 0,
            playerStrength: 10,
            playerBaseStrength: 10,
            opponentStrength: 10,
            opponentBaseStrength: 10,
            roundLog: []
          } as BrawlingState
        } as unknown as CombatState,
      };
      state = gameReducer(invalidState, { type: 'END_COMBAT' });
      expect(state.isCombatActive).toBe(false);
      expect(state.opponent).toBeNull();
      expect(state.combatState).toBeUndefined();
    });
  });
});