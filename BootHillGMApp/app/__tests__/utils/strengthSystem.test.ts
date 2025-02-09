import { calculateCurrentStrength, isKnockout, calculateUpdatedStrength, getCharacterStrength, validateStrengthValue } from '../../utils/strengthSystem';
import { Character } from '../../types/character';
import { Wound } from '../../types/wound';
import { CombatState } from '../../types/combat';

describe('strengthSystem', () => {
  let character: Character;
  let combatState: CombatState;

  beforeEach(() => {
    character = {
      id: 'test-char',
      name: 'Test Character',
      attributes: {
        strength: 5,
        baseStrength: 5,
        speed: 0,
        gunAccuracy: 0,
        throwingAccuracy: 0,
        bravery: 0,
        experience: 0,
      },
      skills: {},
      inventory: [],
      wounds: [],
      statusEffects: [],
      isUnconscious: false,
      isIncapacitated: false,
      isNPC: false,
      isPlayer: false,
    } as Character;

    combatState = {
      isActive: true,
      combatType: 'weapon',
      winner: null,
      participants: [character],
      rounds: 1,
      weapon: {
        playerWeapon: null,
        opponentWeapon: null,
        round: 1,
        currentRange: 10,
        roundLog: [],
        playerCharacterId: 'test-char',
        opponentCharacterId: 'opponent-char'
      }
    };
  });

  describe('calculateCurrentStrength', () => {
    it('should return base strength when no wounds are present', () => {
      expect(calculateCurrentStrength(character)).toBe(5);
    });

    it('should reduce strength based on wounds', () => {
      character.wounds = [
        { location: 'leftArm', severity: 'light', strengthReduction: 2, turnReceived: 0 } as Wound,
        { location: 'rightLeg', severity: 'light', strengthReduction: 1, turnReceived: 0 } as Wound,
      ];
      expect(calculateCurrentStrength(character)).toBe(2); // 5 - 2 - 1 = 2
    });

    it('should not reduce strength below 1 by default', () => {
      character.wounds = [
        { location: 'chest', severity: 'serious', strengthReduction: 10, turnReceived: 0 } as Wound,
      ];
      expect(calculateCurrentStrength(character)).toBe(1);
    });

    it('should allow strength to go below 1 when allowZero is true', () => {
      character.wounds = [
        { location: 'chest', severity: 'serious', strengthReduction: 10, turnReceived: 0 } as Wound,
      ];
      expect(calculateCurrentStrength(character, true)).toBe(-6); // 5 - 10 - (-1) = -6
    });
  });

  describe('calculateCurrentStrength - advanced wounds', () => {
    it('should handle multiple wounds of different severities', () => {
      character.wounds = [
        { location: 'leftArm', severity: 'light', strengthReduction: 2, turnReceived: 0 } as Wound,
        { location: 'rightLeg', severity: 'serious', strengthReduction: 7, turnReceived: 0 } as Wound,
        { location: 'abdomen', severity: 'light', strengthReduction: 3, turnReceived: 0 } as Wound,
      ];
      expect(calculateCurrentStrength(character)).toBe(1); // 5 - 2 - 7 - 3 - (-1) - (-1) = -7, clamped to 1
      expect(calculateCurrentStrength(character, true)).toBe(-8); // 5 - 2 - 7 - 3 - (-1) - (-1) = -8
    });

    it('should return 1 when strength reduced to exactly 1', () => {
      character.wounds = [
        { location: 'leftArm', severity: 'light', strengthReduction: 4, turnReceived: 0 } as Wound,
      ];
      expect(calculateCurrentStrength(character)).toBe(1); // 5 - 4 = 1
    });

     it('should return 0 when strength reduced to exactly 0 and allowZero is true', () => {
      character.wounds = [
        { location: 'chest', severity: 'serious', strengthReduction: 5, turnReceived: 0 } as Wound,
      ];
      expect(calculateCurrentStrength(character, true)).toBe(-1); // 5 - 5 - (-1) = -1
    });
  });

  describe('isKnockout', () => {
    it('should return true when damage reduces strength to exactly 0', () => {
      expect(isKnockout(5, 5)).toBe(true);
    });

    it('should return false when damage reduces strength above 0', () => {
      expect(isKnockout(5, 3)).toBe(false);
    });

    it('should return false when damage reduces strength below 0', () => {
      expect(isKnockout(5, 7)).toBe(false);
    });

    it('should handle zero initial strength', () => {
      expect(isKnockout(0, 0)).toBe(true);
    });

    it('should handle negative initial strength', () => {
      expect(isKnockout(-2, 0)).toBe(false);
    });
  });

  describe('calculateUpdatedStrength', () => {
    it('should reduce strength by damage amount', () => {
      expect(calculateUpdatedStrength(5, 2)).toBe(3);
    });

    it('should allow strength to go below 0', () => {
      expect(calculateUpdatedStrength(5, 10)).toBe(-5);
    });

    it('should handle zero damage', () => {
      expect(calculateUpdatedStrength(5, 0)).toBe(5);
    });

    it('should handle negative initial strength', () => {
      expect(calculateUpdatedStrength(-2, 3)).toBe(-5);
    });

    it('should handle exact zero result', () => {
      expect(calculateUpdatedStrength(5, 5)).toBe(0);
    });
  });

  describe('calculateCurrentStrength with location modifiers', () => {
    it('should apply head modifier', () => {
      character.wounds = [
        { location: 'head', severity: 'light', strengthReduction: 2, turnReceived: 0 } as Wound,
      ];
      expect(calculateCurrentStrength(character)).toBe(1); // 5 - 2 - (-2) = 1
    });

    it('should apply chest modifier', () => {
      character.wounds = [
        { location: 'chest', severity: 'light', strengthReduction: 2, turnReceived: 0 } as Wound,
      ];
      expect(calculateCurrentStrength(character)).toBe(2); // 5 - 2 - (-1) = 2
    });

    it('should apply limb modifier', () => {
      character.wounds = [
        { location: 'leftArm', severity: 'light', strengthReduction: 2, turnReceived: 0 } as Wound,
      ];
      expect(calculateCurrentStrength(character)).toBe(3); // 5 - 2 = 3
    });

    it('should apply multiple modifiers', () => {
      character.wounds = [
        { location: 'head', severity: 'light', strengthReduction: 2, turnReceived: 0 } as Wound,
        { location: 'rightLeg', severity: 'light', strengthReduction: 1, turnReceived: 0 } as Wound,
        { location: 'chest', severity: 'light', strengthReduction: 1, turnReceived: 0 } as Wound,
      ];
      expect(calculateCurrentStrength(character)).toBe(1); // 5 - 2 - 1 - 1 - (-2) - (-1) = -1, clamped to 1
      expect(calculateCurrentStrength(character, true)).toBe(-2); // 5 - 2 - 1 - 1 - (-2) - (-1) = -2
    });
  });

  describe('getCharacterStrength', () => {
    it('should return base strength when no combat state is provided', () => {
      expect(getCharacterStrength(character)).toBe(5);
    });

    it('should return base strength when combat state has no modifiers', () => {
      expect(getCharacterStrength(character, combatState)).toBe(5);
    });

    it('should not go below 1 with combat modifiers', () => {
      character.wounds = [
        { location: 'chest', severity: 'serious', strengthReduction: 10, turnReceived: 0 } as Wound,
      ];
      expect(getCharacterStrength(character, combatState)).toBe(1);
    });

    it('should handle wounds and combat state together', () => {
      character.wounds = [
        { location: 'leftArm', severity: 'light', strengthReduction: 2, turnReceived: 0 } as Wound,
      ];
      expect(getCharacterStrength(character, combatState)).toBe(3);
    });
  });

  describe('validateStrengthValue', () => {
    it('should return true for matching strength values', () => {
      expect(validateStrengthValue(5, character)).toBe(true);
    });

    it('should return true for values within floating point tolerance', () => {
      expect(validateStrengthValue(5.001, character)).toBe(true);
    });

    it('should return false for mismatched strength values', () => {
      expect(validateStrengthValue(4, character)).toBe(false);
    });

    it('should validate combat-modified strength', () => {
      character.wounds = [
        { location: 'chest', severity: 'light', strengthReduction: 2, turnReceived: 0 } as Wound,
      ];
      expect(validateStrengthValue(2, character, combatState)).toBe(true);
    });

    it('should handle validation with multiple wounds', () => {
      character.wounds = [
        { location: 'head', severity: 'light', strengthReduction: 2, turnReceived: 0 } as Wound,
        { location: 'chest', severity: 'light', strengthReduction: 1, turnReceived: 0 } as Wound,
      ];
      expect(validateStrengthValue(1, character, combatState)).toBe(true);
      expect(validateStrengthValue(2, character, combatState)).toBe(false);
    });
  });
});
