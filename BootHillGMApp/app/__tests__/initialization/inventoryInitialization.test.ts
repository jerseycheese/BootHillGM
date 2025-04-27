// app/__tests__/initialization/inventoryInitialization.test.ts

import { getStartingInventory } from '../../utils/startingInventory';
import { gameInitializer } from '../../utils/storage/gameInitializer';
import { Character } from '../../types/character';
import { ActionTypes } from '../../types/actionTypes';
import { InventoryItem, ItemCategory } from '../../types/item.types';

// Mock the storage module to avoid circular dependencies
jest.mock('../../utils/storage/gameStateStorage', () => ({
  GameStorage: {
    initializeNewGame: jest.fn().mockReturnValue({})
  }
}));

describe('Inventory Initialization', () => {
  // Setup mock dispatch function
  const mockDispatch = jest.fn();
  
  // Setup a sample character
  const mockCharacter: Character = {
    isNPC: false,
    isPlayer: true,
    id: 'test-character-id',
    name: 'Test Character',
    inventory: { items: [] },
    attributes: {
      speed: 1,
      gunAccuracy: 1,
      throwingAccuracy: 1,
      strength: 8,
      baseStrength: 8,
      bravery: 1,
      experience: 0
    },
    minAttributes: {
      speed: 1,
      gunAccuracy: 1,
      throwingAccuracy: 1,
      strength: 8,
      baseStrength: 8,
      bravery: 1,
      experience: 0
    },
    maxAttributes: {
      speed: 20,
      gunAccuracy: 20,
      throwingAccuracy: 20, 
      strength: 20,
      baseStrength: 20,
      bravery: 20,
      experience: 11
    },
    wounds: [],
    isUnconscious: false
  };
  
  beforeEach(() => {
    // Clear mocks before each test
    mockDispatch.mockClear();
    jest.clearAllMocks();
  });
  
  it('should initialize character with starting inventory items', async () => {
    // Get the expected starting inventory
    const startingItems = getStartingInventory();
    
    // Initialize game state
    gameInitializer.initializeGameState(mockCharacter, mockDispatch);
    
    // Verify character was initialized with inventory
    expect(mockCharacter.inventory.items).not.toEqual([]);
    expect(mockCharacter.inventory.items.length).toBeGreaterThan(0);
    expect(mockCharacter.inventory.items).toHaveLength(startingItems.length);
    
    // Wait for all promises to resolve
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Verify SET_CHARACTER dispatch includes inventory items
    const setCharacterAction = mockDispatch.mock.calls.find(
      call => call[0].type === ActionTypes.SET_CHARACTER
    );
    
    expect(setCharacterAction).toBeDefined();
    expect(setCharacterAction[0].payload.inventory.items.length).toBeGreaterThan(0);
    expect(setCharacterAction[0].payload.inventory.items).toHaveLength(startingItems.length);
    
    // Verify SET_INVENTORY dispatch occurred
    const setInventoryAction = mockDispatch.mock.calls.find(
      call => call[0].type === ActionTypes.SET_INVENTORY
    );
    
    expect(setInventoryAction).toBeDefined();
    expect(setInventoryAction[0].payload).toHaveLength(startingItems.length);
  });
  
  it('should not overwrite existing inventory if character already has items', async () => {
    // Create a character with existing inventory
    const existingItems: InventoryItem[] = [{
      id: 'existing-item',
      name: 'Existing Item',
      description: 'Existing Item',
      quantity: 1,
      category: 'general' as ItemCategory
    }];
    const characterWithInventory: Character = {
      ...mockCharacter,
      inventory: { items: existingItems }
    };
    
    // Initialize game state
    gameInitializer.initializeGameState(characterWithInventory, mockDispatch);
    
    // Verify character's inventory was not replaced
    expect(characterWithInventory.inventory.items).toEqual(existingItems);
    
    // Wait for all promises to resolve
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Verify SET_CHARACTER dispatch includes original inventory items
    const setCharacterAction = mockDispatch.mock.calls.find(
      call => call[0].type === ActionTypes.SET_CHARACTER
    );
    
    expect(setCharacterAction).toBeDefined();
    expect(setCharacterAction[0].payload.inventory.items).toEqual(existingItems);
  });
});
