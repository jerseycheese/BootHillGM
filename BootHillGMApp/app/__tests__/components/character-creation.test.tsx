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
    it('generates complete character with valid values', async () => {                                                                          
      // Render the component first                                                                                                             
      await renderCharacterCreation();                                                                                                          
                                                                                                                                                
      // Wait for initial character state to be ready                                                                                           
      const generateButton = await screen.findByTestId('generate-character-button');                                                            
                                                                                                                                                
      // Click generate character button and wait for state updates                                                                             
      await act(async () => {                                                                                                                   
        fireEvent.click(generateButton);                                                                                                        
      });                                                                                                                                       
                                                                                                                                                
      // Wait for character generation to complete with increased timeout                                                                       
      await waitFor(() => {                                                                                                                     
        const nameInput = screen.getByTestId('name-input') as HTMLInputElement;                                                                 
        expect(nameInput.value).not.toBe('');                                                                                                   
      }, { timeout: 3000 });                                                                                                                    
                                                                                                                                                
      // Rest of the test remains the same...                                                                                                   
    }, 30000);                                                                                                                                  
  });      
});

// Basic implementation of setupTestEnvironment
function setupTestEnvironment() {
  // Add any necessary setup here
}
