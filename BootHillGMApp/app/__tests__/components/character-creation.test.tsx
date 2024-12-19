// Mock Next.js navigation at the top level, before any imports
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    query: {},
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock character service
jest.mock('../../services/ai/characterService', () => ({
  generateCompleteCharacter: jest.fn().mockResolvedValue({
    name: 'Test Character',
    attributes: {
      speed: 10,
      gunAccuracy: 10,
      throwingAccuracy: 10,
      strength: 10,
      baseStrength: 10,
      bravery: 10,
      experience: 5,
    },
    wounds: [],
    isUnconscious: false,
    inventory: [],
  }),
  generateCharacterSummary: jest.fn().mockResolvedValue('Test character summary'),
}));

// Mock CampaignStateManager
jest.mock('../../components/CampaignStateManager', () => ({
  useCampaignState: jest.fn(),
}));

import '@testing-library/jest-dom';
import { screen, act, fireEvent, waitFor } from '@testing-library/react';
import { useCampaignState } from '../../components/CampaignStateManager';
import { setupMocks, renderCharacterCreation } from '../../test/testUtils';

describe('Character Creation', () => {
  const { mockLocalStorage } = setupMocks();

  beforeEach(() => {
    jest.clearAllMocks();
    const mockSaveGame = jest.fn((state) => {
      mockLocalStorage.setItem('campaignState', JSON.stringify(state));
    });
    (useCampaignState as jest.Mock).mockImplementation(() => ({
      cleanupState: jest.fn(),
      saveGame: mockSaveGame,
      state: {}, // Add empty state to prevent undefined state errors
      dispatch: jest.fn()
    }));

    // Clear any stored character creation progress
    mockLocalStorage.removeItem('character-creation-progress');
  });

  describe('Random Character Generation', () => {
    it('generates complete character with valid values', async () => {
      // First render the component
      const { generateButton } = await renderCharacterCreation();
      
      // Click the generate button
      await act(async () => {
        fireEvent.click(generateButton);
      });

      // Wait for the character form to appear with the generated values
      await waitFor(() => {
        const nameInput = screen.getByTestId('name-input') as HTMLInputElement;
        expect(nameInput.value).toBe('Test Character');
        
        const speedInput = screen.getByTestId('speed-input') as HTMLInputElement;
        expect(speedInput.value).toBe('10');
        
        const gunAccuracyInput = screen.getByTestId('gunAccuracy-input') as HTMLInputElement;
        expect(gunAccuracyInput.value).toBe('10');
      }, { timeout: 3000 });
    }, 30000);
  });
});
