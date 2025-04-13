/**
 * Tests for debug actions utility functions
 */
import { resetGame, initializeTestCombat, createBaseCharacter } from '../../utils/debugActions';
import { getStartingInventory } from '../../utils/startingInventory';
import { gameElementsStorage } from '../../utils/storage/gameElementsStorage';
import { GameEngineAction } from '../../types/gameActions';
import { JournalEntry } from '../../types/journal';
import { setupLocalStorageMock, resetLocalStorageMock } from '../../test/utils/mockLocalStorage';

// Define proper types for test payloads
interface GameStatePayload {
  character: {
    player: {
      id: string;
      name: string;
      inventory: {
        items: Array<{
          id: string;
          name: string;
          category: string;
          quantity: number;
          description?: string;
        }>;
      };
      attributes: Record<string, number>;
    };
    opponent: null;
  };
  inventory: {
    items: Array<{
      id: string;
      name: string;
      category: string;
      quantity: number;
      description?: string;
    }>;
    equippedWeaponId: null;
  };
  journal: {
    entries: JournalEntry[];
  };
  narrative: {
    currentStoryPoint: {
      id: string;
      type: string;
      content: string;
      choices: unknown[];
    } | null;
    narrativeHistory: string[];
    visitedPoints: string[];
    needsInitialGeneration?: boolean;
  };
  combat: {
    isActive: boolean;
    rounds: number;
    combatType: string;
    playerTurn: boolean;
    playerCharacterId: string;
    opponentCharacterId: string;
    combatLog: unknown[];
    roundStartTime: number;
    modifiers: {
      player: number;
      opponent: number;
    };
    currentTurn: null;
  };
  location: {
    type: string;
    name: string;
  };
  ui?: {
    activePanel: string;
    showInventory: boolean;
    showCharacter: boolean;
    showJournal: boolean;
  };
  suggestedActions: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
  }>;
  isReset: boolean;
  gameProgress: number;
  savedTimestamp: number;
  isClient: boolean;
  forceContentGeneration?: boolean;
}

// Mock dependencies
jest.mock('../../utils/startingInventory');
jest.mock('../../utils/storage/gameElementsStorage');

describe('debugActions', () => {
  beforeAll(() => {
    setupLocalStorageMock();
  });
  
  beforeEach(() => {
    resetLocalStorageMock();
    
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock default inventory items
    const mockStartingInventory = [
      { id: 'item-1', name: 'Leather Canteen', category: 'general', quantity: 1, description: 'A leather water container' },
      { id: 'item-2', name: 'Hemp Rope (50ft)', category: 'general', quantity: 1, description: 'Strong rope made of hemp' },
      { id: 'item-3', name: 'Tobacco Pouch', category: 'general', quantity: 1, description: 'A small pouch for tobacco' },
      { id: 'item-4', name: 'Matchbox', category: 'general', quantity: 1, description: 'A box of matches' }
    ];
    
    // Setup mock implementations
    (getStartingInventory as jest.Mock).mockReturnValue(mockStartingInventory);
    (gameElementsStorage.getDefaultInventoryItems as jest.Mock).mockReturnValue(mockStartingInventory);
  });
  
  describe('createBaseCharacter', () => {
    test('should create a character with proper values and inventory', () => {
      const mockId = 'test-id';
      const mockName = 'Test Character';
      
      const character = createBaseCharacter(mockId, mockName);
      
      expect(character).toBeDefined();
      expect(character.id).toBe(mockId);
      expect(character.name).toBe(mockName);
      
      // Check that inventory is populated
      expect(character.inventory).toBeDefined();
      expect(character.inventory.items).toEqual(gameElementsStorage.getDefaultInventoryItems());
      
      // Check attributes
      expect(character.attributes).toBeDefined();
      expect(character.attributes.strength).toBe(10);
    });
  });
  
  describe('initializeTestCombat', () => {
    test('should create a valid test combat action', () => {
      // Force cast to GameEngineAction with SET_STATE type to make TypeScript happy
      const action = initializeTestCombat() as GameEngineAction & { 
        type: 'SET_STATE', 
        payload: {
          combat: {
            isActive: boolean;
            combatType: string;
          };
          character: {
            opponent: {
              name: string;
            };
          };
        }
      };
      
      expect(action.type).toBe('SET_STATE');
      
      // Now we can safely access the payload
      const payload = action.payload;
      
      expect(payload.combat).toBeDefined();
      expect(payload.combat.isActive).toBe(true);
      expect(payload.combat.combatType).toBe('brawling');
      
      // Check opponent
      expect(payload.character).toBeDefined();
      expect(payload.character.opponent).toBeDefined();
      expect(payload.character.opponent.name).toBe('Test Opponent');
    });
  });
  
  describe('resetGame', () => {
    test('should create a complete game state reset action', () => {
      const CHARACTER_NAME = "Test Character";
      
      // Create test character in localStorage
      const testCharacter = createBaseCharacter('test-character', CHARACTER_NAME);
      localStorage.setItem('character-creation-progress', JSON.stringify({ character: testCharacter }));
      localStorage.setItem('completed-character', JSON.stringify(testCharacter));
      
      // Force cast to GameEngineAction with SET_STATE type to make TypeScript happy
      const resetAction = resetGame() as GameEngineAction & { 
        type: 'SET_STATE', 
        payload: GameStatePayload 
      };
      
      expect(resetAction.type).toBe('SET_STATE');
      
      // Now we can safely access the payload without TypeScript errors
      const payload = resetAction.payload;
      
      // Check that all required state slices are present
      expect(payload.character).toBeDefined();
      expect(payload.inventory).toBeDefined();
      expect(payload.journal).toBeDefined();
      expect(payload.narrative).toBeDefined();
      expect(payload.combat).toBeDefined();
      
      // Character checks - we should get Test Character since we populated localStorage
      expect(payload.character.player).toBeDefined();
      expect(payload.character.player.name).toBe(CHARACTER_NAME);
      
      // Check that character has inventory items
      expect(payload.character.player.inventory).toBeDefined();
      expect(Array.isArray(payload.character.player.inventory.items)).toBe(true);
      expect(payload.character.player.inventory.items.length).toBeGreaterThan(0);
      
      // Journal checks
      expect(payload.journal.entries).toBeDefined();
      expect(Array.isArray(payload.journal.entries)).toBe(true);
      
      // Narrative checks
      expect(payload.narrative).toBeDefined();
      expect(payload.narrative.narrativeHistory).toBeDefined();
      expect(Array.isArray(payload.narrative.narrativeHistory)).toBe(true);
      expect(payload.narrative.needsInitialGeneration).toBe(true);
      
      // Location check
      expect(payload.location).toBeDefined();
      expect(payload.location.type).toBe('town');
      expect(payload.location.name).toBe('Boot Hill');
      
      // Check flags
      expect(payload.isReset).toBe(true);
      expect(payload.forceContentGeneration).toBe(true);
      
      // Verify special localStorage keys
      expect(localStorage.getItem('_boothillgm_reset_flag')).not.toBeNull();
      expect(localStorage.getItem('_boothillgm_force_generation')).toBe('true');
      
      // Check character data was preserved in localStorage
      const characterData = localStorage.getItem('characterData');
      expect(characterData).not.toBeNull();
      if (characterData) {
        const parsedChar = JSON.parse(characterData);
        expect(parsedChar.name).toBe(CHARACTER_NAME);
      }
    });
    
    test('should create default character if none exists', () => {
      // Make sure no character data exists in localStorage
      localStorage.clear();
      
      // Force cast to GameEngineAction with SET_STATE type
      const resetAction = resetGame() as GameEngineAction & { 
        type: 'SET_STATE', 
        payload: GameStatePayload 
      };
      
      expect(resetAction.type).toBe('SET_STATE');
      
      // Now we can safely access the payload without TypeScript errors
      const payload = resetAction.payload;
      
      // Character checks - should get a default character with Test Character name
      expect(payload.character.player).toBeDefined();
      expect(payload.character.player.name).toBe('Test Character');
      
      // Check that character has default inventory items
      expect(payload.character.player.inventory).toBeDefined();
      expect(Array.isArray(payload.character.player.inventory.items)).toBe(true);
      expect(payload.character.player.inventory.items.length).toBeGreaterThan(0);
    });
  });
});