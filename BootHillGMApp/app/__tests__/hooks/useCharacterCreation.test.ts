import { generateRandomValue, STEP_DESCRIPTIONS } from '../../hooks/useCharacterCreation';

describe('useCharacterCreation', () => {
  describe('generateRandomValue', () => {
    it('generates values within specified ranges', () => {
      const mockField = 'strength';
      const fieldInfo = STEP_DESCRIPTIONS[mockField];
      if (!fieldInfo?.min || !fieldInfo?.max) {
        throw new Error(`Min or max not defined for field: ${mockField}`);
      }
      const result = generateRandomValue(mockField);
      
      expect(result).toBeGreaterThanOrEqual(fieldInfo.min);
      expect(result).toBeLessThanOrEqual(fieldInfo.max);
    });

    it('returns 0 for invalid fields', () => {
      const result = generateRandomValue('invalidField' as keyof typeof STEP_DESCRIPTIONS);
      expect(result).toBe(0);
    });
  });
});
