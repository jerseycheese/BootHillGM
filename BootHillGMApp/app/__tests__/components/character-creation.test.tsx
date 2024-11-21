import '@testing-library/jest-dom';
import { screen, act, fireEvent, waitFor } from '@testing-library/react';
import { useCampaignState } from '../../components/CampaignStateManager';
import { setupMocks, renderCharacterCreation } from '../../test/testUtils';
import { STEP_DESCRIPTIONS } from '../../hooks/useCharacterCreation';

jest.mock('../../components/CampaignStateManager', () => ({
  useCampaignState: jest.fn(),
}));

describe('Character Creation', () => {
  const { mockLocalStorage } = setupMocks();

  beforeEach(() => {
    jest.clearAllMocks();
    setupTestEnvironment();
    const mockSaveGame = jest.fn((state) => {
      mockLocalStorage.setItem('campaignState', JSON.stringify(state));
    });
    (useCampaignState as jest.Mock).mockImplementation(() => ({
      cleanupState: jest.fn(),
      saveGame: mockSaveGame
    }));
  });

  describe('Random Character Generation', () => {
    // Increase timeout to 10 seconds
    it('generates complete character with valid values', async () => {
      // Render the component first
      await renderCharacterCreation();
      
      // Wait for initial character state to be ready with better error handling
      await waitFor(() => {
        const button = screen.queryByTestId('generate-character-button');
        if (!button) {
          throw new Error('Generate character button not found');
        }
        expect(button).toBeInTheDocument();
      }, { timeout: 10000 });

      // Click generate character button
      const generateButton = screen.getByTestId('generate-character-button');
      await act(async () => {
        fireEvent.click(generateButton);
      });

      // Wait for generation to complete and verify all fields with better error handling
      await waitFor(() => {
        const nameInput = screen.queryByTestId('name-input');
        if (!nameInput) {
          throw new Error('Name input not found');
        }
        const validNames = ['Billy the Kid', 'Wyatt Earp', 'Annie Oakley', 'Doc Holliday', 'Jesse James'];
        const value = nameInput.getAttribute('value');
        expect(validNames).toContain(value);
      }, { timeout: 10000 });

      // Check other key fields
      const fields = [
        'speed-input', 
        'gunAccuracy-input', 
        'throwingAccuracy-input', 
        'strength-input', 
        'baseStrength-input', 
        'bravery-input', 
        'experience-input'
      ];

      fields.forEach(fieldId => {
        const input = screen.queryByTestId(fieldId);
        if (!input) {
          throw new Error(`Field ${fieldId} not found`);
        }
        const value = input.getAttribute('value');
        if (!value) {
          throw new Error(`Field ${fieldId} has no value`);
        }
        const numValue = Number(value);
        expect(numValue).toEqual(expect.any(Number));
        
        // Validate value ranges based on STEP_DESCRIPTIONS
        const fieldName = fieldId.replace('-input', '').replace(/-/g, '');
        const description = STEP_DESCRIPTIONS[fieldName];
        
        if (description && description.min !== undefined && description.max !== undefined) {
          expect(numValue).toBeGreaterThanOrEqual(description.min);
          expect(numValue).toBeLessThanOrEqual(description.max);
        }
      });
    }, 30000); // Set overall test timeout to 30 seconds
  });
});

// Basic implementation of setupTestEnvironment
function setupTestEnvironment() {
  // Add any necessary setup here
}
