import { validateCombatEndState } from '../../utils/combatStateValidation';
import { CombatState as LegacyCombatState, CombatType } from '../../types/combat';
import { ExtendedGameState } from '../../types/extendedState';
import { gameReducer } from '../../reducers/gameReducer';
import { ActionTypes } from '../../types/actionTypes';

describe('combatStateValidation', () => {
  describe('validateCombatEndState', () => {
    it('should validate a complete brawling end state', () => {
      const validState: LegacyCombatState = {
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
          playerCharacterId: 'player-1',
          opponentCharacterId: 'opponent-1',
          roundLog: []
        }
      };

      const result = validateCombatEndState(validState);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required properties', () => {
      const invalidState = {
        combatType: 'brawling' as CombatType,
        // Missing brawling state for brawling combat
      } as unknown as LegacyCombatState;

      const result = validateCombatEndState(invalidState);
      expect(result.isValid).toBe(false);
      // We only need to check that it detected the missing brawling property
      expect(result.errors).toContainEqual({
        code: 'MISSING_PROPERTY',
        message: 'Missing required property: brawling state for brawling combat',
        property: 'brawling'
      });
    });

    it('should clean up brawling-specific properties', () => {
      const stateWithExtraProps: LegacyCombatState = {
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
          playerCharacterId: 'player-1',
          opponentCharacterId: 'opponent-1',
          roundLog: []
        } // Test cleanup of brawling property
      };

      const result = validateCombatEndState(stateWithExtraProps);
      expect(result.isValid).toBe(true);
      expect(result.cleanedState).not.toHaveProperty('brawling');
    });

    it('should handle corrupted state objects', () => {
      const corruptedState = {
        invalidProperty: 'corrupted',
        combatType: 'brawling' as CombatType,
      } as unknown as LegacyCombatState;

      const result = validateCombatEndState(corruptedState);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        code: 'MISSING_PROPERTY',
        message: 'Missing required property: brawling state for brawling combat',
        property: 'brawling'
      });
    });

    it('should integrate with combat reducer', () => {
      const defaultCharacter = {
        id: 'player',
        name: 'Player',
        isNPC: false,
        isPlayer: true,
        attributes: {
          speed: 5,
          gunAccuracy: 5,
          throwingAccuracy: 5,
          strength: 5,
          baseStrength: 5,
          bravery: 5,
          experience: 5
        },
        minAttributes: {
          speed: 1,
          gunAccuracy: 1,
          throwingAccuracy: 1,
          strength: 8,
          baseStrength: 8,
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
          experience: 11
        },
        wounds: [],
        isUnconscious: false,
        inventory: { items: [] }
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
        minAttributes: {
          speed: 1,
          gunAccuracy: 1,
          throwingAccuracy: 1,
          strength: 8,
          baseStrength: 8,
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
          experience: 11
        },
        wounds: [],
        isUnconscious: false,
        inventory: { items: [] }
      };
    
      // Update to match new state structure with ExtendedGameState
      const initialState: Partial<ExtendedGameState> = {
        currentPlayer: 'player',
        quests: [],
        combat: {
          isActive: true,
          combatType: 'brawling',
          rounds: 0,
          playerTurn: true,
          playerCharacterId: 'player-1',
          opponentCharacterId: 'opponent-1',
          combatLog: [],
          roundStartTime: 0,
          modifiers: { player: 0, opponent: 0 },
          currentTurn: null
        },
        character: {
          player: defaultCharacter,
          opponent: opponent
        },
        npcs: [],
        inventory: { items: [] },
        journal: { entries: [] },
        location: null,
        gameProgress: 0,
        savedTimestamp: 0,
        suggestedActions: [],
        narrative: {
          currentStoryPoint: null,
          visitedPoints: [],
          availableChoices: [],
          narrativeHistory: [],
          displayMode: 'standard',
          context: "",
          error: null
        },
        ui: {
          isLoading: false,
          modalOpen: null,
          notifications: [],
          activeTab: 'default'
        },
        meta: {}
      };
    
      // Test end combat with the ExtendedGameState using ActionTypes
      const state = gameReducer(initialState as ExtendedGameState, { type: ActionTypes.END_COMBAT });
      
      // Test that combat is inactive after END_COMBAT action
      expect(state.combat.isActive).toBe(false);
      
      // Since we're using slice architecture, check that opponent is null
      expect(state.character?.opponent).toBeNull();
    });
  });
});