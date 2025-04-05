/**
 * GameStorage Utility Tests
 * 
 * Tests for the GameStorage utility's ability to handle
 * various localStorage operations and provide default values.
 */

import { gameStateUtils } from '../../test/utils'; // Corrected relative path
import GameStorage from '../../utils/gameStorage';

// Create real import but mock methods
jest.mock('../../utils/gameStorage', () => ({
  getCharacter: jest.fn(),
  getNarrativeText: jest.fn(),
  getSuggestedActions: jest.fn(),
  getJournalEntries: jest.fn(),
  initializeNewGame: jest.fn(),
  saveGameState: jest.fn(),
  getDefaultInventoryItems: jest.fn()
}));

describe('GameStorage Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    gameStateUtils.mockLocalStorage.clear(); // Use namespaced import
  });
  
  test('getCharacter returns character from localStorage with proper structure', () => {
    // Create a mock implementation to test the real function
    const originalGetCharacter = jest.requireActual('../../utils/gameStorage').default.getCharacter;
    
    // Set up localStorage with test data
    gameStateUtils.mockLocalStorage.setItem('character-creation-progress', JSON.stringify({ // Use namespaced import
      character: {
        id: 'local-player',
        name: 'Local Character'
      }
    }));
    
    // Override the mock to call the real function
    (GameStorage.getCharacter as jest.Mock).mockImplementation(originalGetCharacter);
    
    const result = GameStorage.getCharacter();
    
    expect(result).toBeDefined();
    expect(result.player).toBeDefined();
  });
  
  test('initializeNewGame creates a complete game state structure', () => {
    const originalInitializeNewGame = jest.requireActual('../../utils/gameStorage').default.initializeNewGame;
    
    // Override the mock to call the real function
    (GameStorage.initializeNewGame as jest.Mock).mockImplementation(originalInitializeNewGame);
    
    const result = GameStorage.initializeNewGame();
    
    expect(result).toBeDefined();
    expect(result.character).toBeDefined();
    expect(result.narrative).toBeDefined();
    expect(result.suggestedActions).toBeDefined();
  });
});
