import { act, renderHook } from '@testing-library/react';
import { useCharacterCreation, STEP_DESCRIPTIONS, generateRandomValue } from '../../hooks/useCharacterCreation';
import { generateName } from '../../services/ai/nameGenerator';

jest.mock('../../services/ai/nameGenerator');

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

  describe('name generation', () => {
    it('successfully generates a name', async () => {
      (generateName as jest.Mock).mockResolvedValue('Test Name');
      const { result } = renderHook(() => useCharacterCreation());

      await act(() => result.current.generateFieldValue('name'));

      expect(generateName).toHaveBeenCalled();
      expect(result.current.character.name).toBe('Test Name');
      expect(result.current.error).toBe('');
      expect(result.current.isGeneratingField).toBe(false);
    });

    it('handles errors during name generation', async () => {
      (generateName as jest.Mock).mockRejectedValue(new Error('Generation failed'));
      const { result } = renderHook(() => useCharacterCreation());

      await act(() => result.current.generateFieldValue('name'));

      expect(generateName).toHaveBeenCalled();
      expect(result.current.character.name).toBe(''); // Should not update name on error
      expect(result.current.error).toBe('Failed to generate value for name');
      expect(result.current.isGeneratingField).toBe(false);
    });

    it('sets loading state correctly during generation', async () => {
      (generateName as jest.Mock).mockResolvedValue('Test Name');
      const { result } = renderHook(() => useCharacterCreation());

      const generationPromise = act(() => result.current.generateFieldValue('name'));

      expect(result.current.isGeneratingField).toBe(true);

      await generationPromise;

      expect(result.current.isGeneratingField).toBe(false);
    });
  });
});
