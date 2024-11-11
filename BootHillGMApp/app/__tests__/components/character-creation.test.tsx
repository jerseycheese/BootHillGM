import '@testing-library/jest-dom';
import { screen, act, fireEvent } from '@testing-library/react';
import { useCampaignState } from '../../components/CampaignStateManager';
import {
  setupMocks,
  setupTestEnvironment,
  cleanupTestEnvironment,
  renderCharacterCreation,
  getMockInitialState
} from '../../test/testUtils';

// Mock CampaignStateManager
jest.mock('../../components/CampaignStateManager', () => ({
  useCampaignState: jest.fn(),
}));

/**
 * Character Creation Component Tests
 * Tests the character creation flow including:
 * - Basic character creation process
 * - Progress saving
 * - Error handling
 * - Random character generation
 */
describe('Character Creation', () => {
  const { mockPush, mockLocalStorage } = setupMocks();

  beforeEach(() => {
    jest.clearAllMocks();
    setupTestEnvironment();
    (useCampaignState as jest.Mock).mockImplementation(() => ({
      cleanupState: jest.fn(),
    }));
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe('Basic Creation Flow', () => {
    it('handles character creation process', async () => {
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(getMockInitialState()));

      const { input } = await renderCharacterCreation();
      
      // Enter character name
      await act(async () => {
        fireEvent.change(input, { target: { value: 'Test Character' } });
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Submit the form
      const form = screen.getByTestId('character-creation-form');
      await act(async () => {
        fireEvent.submit(form);
      });

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(savedData).toHaveProperty('character');
      expect(savedData).toHaveProperty('currentStep');
      expect(savedData).toHaveProperty('lastUpdated');
    });

    it('cleans up state on completion', async () => {
      const mockCleanup = jest.fn();
      useCampaignState.mockImplementation(() => ({
        cleanupState: mockCleanup,
      }));

      const { input } = await renderCharacterCreation();
      
      // Enter character name
      await act(async () => {
        fireEvent.change(input, { target: { value: 'Test Character' } });
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Submit the form
      const form = screen.getByTestId('character-creation-form');
      await act(async () => {
        fireEvent.submit(form);
      });

      expect(mockCleanup).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/game-session');
    });
  });
});
