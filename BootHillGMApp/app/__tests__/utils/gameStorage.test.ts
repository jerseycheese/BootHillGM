/**
 * GameStorage Utility Tests
 * 
 * Tests for the GameStorage utility's ability to handle
 * various localStorage operations and provide default values.
 */

import { gameStateUtils } from '../../test/utils';
import GameStorage from '../../utils/gameStorage';
import ServiceStorage from '../../services/storage/gameStorage';

// Mock the service storage
jest.mock('../../services/storage/gameStorage', () => ({
  __esModule: true,
  default: {
    getCharacter: jest.fn(),
    initializeNewGame: jest.fn(),
    getDefaultCharacter: jest.fn(),
    getDefaultInventoryItems: jest.fn().mockReturnValue([
      { id: 'revolver', name: 'Revolver', category: 'weapon', quantity: 1, isEquipped: true },
      { id: 'ammo', name: 'Bullets', category: 'consumable', quantity: 24 },
      { id: 'bandages', name: 'Bandages', category: 'consumable', quantity: 3 }
    ])
  }
}));

describe('GameStorage Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    gameStateUtils.mockLocalStorage.clear();
  });
  
  test('getCharacter returns character from localStorage with proper structure', () => {
    // Create a mock implementation to test the real function
    const originalGetCharacter = jest.requireActual('../../services/storage/gameStorage').default.getCharacter;
    
    // Set up localStorage with test data
    gameStateUtils.mockLocalStorage.setItem('character-creation-progress', JSON.stringify({
      character: {
        id: 'local-player',
        name: 'Local Character'
      }
    }));
    
    // Override the mock to call the real function
    (ServiceStorage.getCharacter as jest.Mock).mockImplementation(originalGetCharacter);
    
    const result = GameStorage.getCharacter();
    
    expect(result).toBeDefined();
    expect(result.player).toBeDefined();
    expect(result.player?.id).toBe('local-player');
    expect(result.player?.name).toBe('Local Character');
  });
  
  test('initializeNewGame creates a complete game state structure', () => {
    const originalInitializeNewGame = jest.requireActual('../../services/storage/gameStorage').default.initializeNewGame;
    
    // Override the mock to call the real function
    (ServiceStorage.initializeNewGame as jest.Mock).mockImplementation(originalInitializeNewGame);
    
    const result = GameStorage.initializeNewGame();
    
    expect(result).toBeDefined();
    expect(result.character).toBeDefined();
    expect(result.narrative).toBeDefined();
    expect(result.suggestedActions).toBeDefined();
    expect(result.inventory.equippedWeaponId).toBe('revolver');
  });
});
