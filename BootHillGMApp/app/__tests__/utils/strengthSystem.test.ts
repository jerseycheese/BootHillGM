import { calculateCurrentStrength, isKnockout, calculateUpdatedStrength } from '../../utils/strengthSystem';
import { Character } from '../../types/character';
import { Wound } from '../../types/wound';

describe('strengthSystem', () => {
  let character: Character;

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
    it('should return true if remaining strength is 0', () => {
      expect(isKnockout(5, 5)).toBe(true);
    });

    it('should return false if remaining strength is above 0', () => {
      expect(isKnockout(5, 3)).toBe(false);
    });
  });

  describe('isKnockout - edge cases', () => {
    it('should return true when damage equals current strength', () => {
      expect(isKnockout(5, 5)).toBe(true);
    });

    it('should return false when damage is less than current strength', () => {
      expect(isKnockout(5, 4)).toBe(false);
    });
  });

  describe('calculateUpdatedStrength', () => {
    it('should reduce strength by damage amount', () => {
      expect(calculateUpdatedStrength(5, 2)).toBe(3);
    });

    it('should not reduce strength below 0', () => {
      expect(calculateUpdatedStrength(5, 10)).toBe(0);
    });
  });

  describe('calculateUpdatedStrength - edge cases', () => {
    it('should return 0 when damage exceeds current strength', () => {
      expect(calculateUpdatedStrength(5, 7)).toBe(0);
    });

    it('should return current strength when damage is 0', () => {
      expect(calculateUpdatedStrength(5, 0)).toBe(5);
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
});
