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

    it('returns 0 for undefined field info', () => {
      // Mock STEP_DESCRIPTIONS to simulate missing field info
      const originalDesc = STEP_DESCRIPTIONS['speed'];
      STEP_DESCRIPTIONS['speed'] = { title: '', description: '' };
      
      const result = generateRandomValue('speed');
      expect(result).toBe(0);
      
      // Restore original description
      STEP_DESCRIPTIONS['speed'] = originalDesc;
    });
  });
});
