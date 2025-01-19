import { calculateCurrentStrength, isCharacterDefeated, WOUND_EFFECTS } from '../../utils/strengthSystem';
import { Character } from '../../types/character';

describe('Strength System', () => {
  const mockCharacter: Character = {
    id: 'test-character-1',
    name: 'Test Character',
    isNPC: false,
    isPlayer: true,
    attributes: {
      speed: 10,
      gunAccuracy: 10,
      throwingAccuracy: 10,
      strength: 15,
      baseStrength: 15,
      bravery: 10,
      experience: 5
    },
    wounds: [],
    isUnconscious: false,
    inventory: []
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

    it('returns 1 when reductions exceed baseStrength', () => {
      const charWithManyWounds: Character = {
        ...mockCharacter,
        wounds: [
          { location: 'chest', severity: 'serious', strengthReduction: 7, turnReceived: 1 },
          { location: 'leftArm', severity: 'serious', strengthReduction: 7, turnReceived: 2 },
          { location: 'head', severity: 'light', strengthReduction: 3, turnReceived: 3 }
        ]
      };
      expect(calculateCurrentStrength(charWithManyWounds)).toBe(1);
    });

    it('processes wounds in correct order based on turnReceived', () => {
      const charWithWounds: Character = {
        ...mockCharacter,
        wounds: [
          { location: 'head', severity: 'light', strengthReduction: 3, turnReceived: 3 },
          { location: 'chest', severity: 'serious', strengthReduction: 7, turnReceived: 1 },
          { location: 'leftArm', severity: 'serious', strengthReduction: 7, turnReceived: 2 }
        ]
      };
      expect(calculateCurrentStrength(charWithWounds)).toBe(1);
    });

    it('handles multiple wounds in same turn correctly', () => {
      const charWithWounds: Character = {
        ...mockCharacter,
        wounds: [
          { location: 'head', severity: 'light', strengthReduction: 3, turnReceived: 1 },
          { location: 'chest', severity: 'serious', strengthReduction: 7, turnReceived: 1 },
          { location: 'leftArm', severity: 'serious', strengthReduction: 7, turnReceived: 1 }
        ]
      };
      expect(calculateCurrentStrength(charWithWounds)).toBe(1);
    });

    it('handles wound stacking correctly', () => {
      const charWithWounds: Character = {
        ...mockCharacter,
        wounds: [
          { location: 'head', severity: 'light', strengthReduction: 3, turnReceived: 1 },
          { location: 'chest', severity: 'serious', strengthReduction: 7, turnReceived: 2 },
          { location: 'leftArm', severity: 'serious', strengthReduction: 7, turnReceived: 3 }
        ]
      };
      expect(calculateCurrentStrength(charWithWounds)).toBe(1);
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
