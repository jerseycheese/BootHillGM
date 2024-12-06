import { calculateFirstShot, calculateHitChance } from '../../utils/combatRules';
import { Character } from '../../types/character';

describe('Combat Rules', () => {
  const mockCharacter: Character = {
    name: 'Test Character',
    attributes: {
      speed: 10,
      gunAccuracy: 10,
      throwingAccuracy: 10,
      strength: 10,
      baseStrength: 10,
      bravery: 50,
      experience: 5
    },
    wounds: [],
    isUnconscious: false,
    inventory: []
  };

  describe('calculateFirstShot', () => {
    test('calculates base first shot value correctly', () => {
      const result = calculateFirstShot(mockCharacter);
      // 50 (base) + 10 (speed) + 2 (bravery >= 50) + 0 (no weapon mod)
      expect(result).toBe(62);
    });
  });

  describe('calculateHitChance', () => {
    test('calculates hit chance correctly', () => {
      const result = calculateHitChance(mockCharacter);
      // 50 (base) + 10 (accuracy) + 3 (bravery >= 50) + 2 (experience >= 5)
      expect(result).toBe(65);
    });
  });
});
