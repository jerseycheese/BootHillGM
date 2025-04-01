import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { useCharacterCreation, generateRandomValue } from '../../hooks/useCharacterCreation';
import { generateName } from '../../services/ai/nameGenerator';
import { TestCampaignStateProvider } from '../utils/testWrappers';

// Mock the name generator
jest.mock('../../services/ai/nameGenerator');

// Mock the character service
jest.mock('../../services/ai/characterService', () => ({
  generateCharacterSummary: jest.fn().mockResolvedValue('Mock character summary'),
  generateCompleteCharacter: jest.fn().mockResolvedValue({
    name: 'Mock Character',
    attributes: {
      speed: 5,
      gunAccuracy: 5,
      throwingAccuracy: 5,
      strength: 10,
      baseStrength: 10,
      bravery: 5,
      experience: 0
    }
  })
}));

// Mock the CampaignStateManager
jest.mock('../../components/CampaignStateManager', () => ({
  useCampaignState: () => ({
    saveGame: jest.fn(),
    cleanupState: jest.fn(),
    state: {},
    dispatch: jest.fn()
  })
}));

describe('useCharacterCreation', () => {
  beforeEach(() => {
    localStorage.clear();
    (generateName as jest.Mock).mockResolvedValue('Test Name');
  });

  describe('generateRandomValue', () => {
    it('returns default values for attributes', () => {
      expect(generateRandomValue('strength')).toBe(8);
      expect(generateRandomValue('speed')).toBe(1);
      expect(generateRandomValue('gunAccuracy')).toBe(1);
    });
  });

  describe('name generation', () => {
    it('successfully generates a name', async () => {
      (generateName as jest.Mock).mockResolvedValue('Test Name');
      
      const { result } = renderHook(() => useCharacterCreation(), {
        wrapper: ({ children }) => (
          <TestCampaignStateProvider initialState={{}}>
            {children}
          </TestCampaignStateProvider>
        )
      });

      await act(async () => {
        await result.current.generateFieldValue('name');
      });

      expect(generateName).toHaveBeenCalled();
      expect(result.current.character.name).toBe('Test Name');
      expect(result.current.error).toBe('');
      expect(result.current.isGeneratingField).toBe(false);
    });

    it('handles errors during name generation', async () => {
      (generateName as jest.Mock).mockRejectedValue(new Error('Generation failed'));
      
      const { result } = renderHook(() => useCharacterCreation(), {
        wrapper: ({ children }) => (
          <TestCampaignStateProvider initialState={{}}>
            {children}
          </TestCampaignStateProvider>
        )
      });

      await act(async () => {
        await result.current.generateFieldValue('name');
      });

      expect(generateName).toHaveBeenCalled();
      expect(result.current.character.name).toBe(''); // Should not update name on error
      expect(result.current.error).toBe('Failed to generate value for name');
      expect(result.current.isGeneratingField).toBe(false);
    });

    it('sets loading state correctly during generation', async () => {
      (generateName as jest.Mock).mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve('Test Name'), 10);
        });
      });
      
      const { result } = renderHook(() => useCharacterCreation(), {
        wrapper: ({ children }) => (
          <TestCampaignStateProvider initialState={{}}>
            {children}
          </TestCampaignStateProvider>
        )
      });

      let generationPromise: Promise<void>;
      
      await act(async () => {
        generationPromise = result.current.generateFieldValue('name');
        // Check loading state during the operation
        expect(result.current.isGeneratingField).toBe(true);
        await generationPromise;
      });

      // Check state after operation completes
      expect(result.current.isGeneratingField).toBe(false);
      expect(result.current.character.name).toBe('Test Name');
    });
  });
});
