import { calculateCurrentStrength, isCharacterDefeated, WOUND_EFFECTS } from '../../utils/strengthSystem';
import { Character } from '../../types/character';

describe('Strength System', () => {
  const mockCharacter: Character = {
    name: 'Test Character',
    attributes: {
      speed: 10,
      gunAccuracy: 10,
      throwingAccuracy: 10,
      strength: 15,
      baseStrength: 15,
      bravery: 10,
      experience: 5
    },
    skills: {
      shooting: 50,
      riding: 50,
      brawling: 50
    },
    wounds: [],
    isUnconscious: false
  };

  describe('calculateCurrentStrength', () => {
    it('returns baseStrength when no wounds', () => {
      expect(calculateCurrentStrength(mockCharacter)).toBe(15);
    });

    it('subtracts wound reductions correctly', () => {
      const charWithWounds: Character = {
        ...mockCharacter,
        wounds: [
          { location: 'leftArm', severity: 'light', strengthReduction: 3, turnReceived: 1 },
          { location: 'chest', severity: 'serious', strengthReduction: 7, turnReceived: 2 }
        ]
      };
      expect(calculateCurrentStrength(charWithWounds)).toBe(5);
    });

    it('returns 0 when reductions exceed baseStrength', () => {
      const charWithManyWounds: Character = {
        ...mockCharacter,
        wounds: [
          { location: 'chest', severity: 'serious', strengthReduction: 7, turnReceived: 1 },
          { location: 'leftArm', severity: 'serious', strengthReduction: 7, turnReceived: 2 },
          { location: 'head', severity: 'light', strengthReduction: 3, turnReceived: 3 }
        ]
      };
      expect(calculateCurrentStrength(charWithManyWounds)).toBe(0);
    });
  });

  describe('isCharacterDefeated', () => {
    it('returns true when character is unconscious', () => {
      const unconsciousChar: Character = { ...mockCharacter, isUnconscious: true };
      expect(isCharacterDefeated(unconsciousChar)).toBe(true);
    });

    it('returns true when character has a mortal wound', () => {
      const mortallyWoundedChar: Character = {
        ...mockCharacter,
        wounds: [
          { location: 'head', severity: 'mortal', strengthReduction: WOUND_EFFECTS.MORTAL, turnReceived: 1 }
        ]
      };
      expect(isCharacterDefeated(mortallyWoundedChar)).toBe(true);
    });

    it('returns true when strength is reduced to 0', () => {
      const zeroStrengthChar: Character = {
        ...mockCharacter,
        wounds: [
          { location: 'chest', severity: 'serious', strengthReduction: 15, turnReceived: 1 }
        ]
      };
      expect(isCharacterDefeated(zeroStrengthChar)).toBe(true);
    });

    it('returns false for healthy character', () => {
      expect(isCharacterDefeated(mockCharacter)).toBe(false);
    });
  });
});
