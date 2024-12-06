import { InventoryManager } from './inventoryManager';
import { Character } from '../types/character';
import { GameState } from '../types/campaign';
import { InventoryItem } from '../types/inventory';

describe('InventoryManager', () => {
  const mockCharacter: Character = {
    name: 'Test Character',
    inventory: [],
    attributes: {
      speed: 5,
      gunAccuracy: 5,
      throwingAccuracy: 5,
      strength: 10,
      baseStrength: 10,
      bravery: 5,
      experience: 0
    },
    wounds: [],
    isUnconscious: false
  };

  const mockGameState: GameState = {
    currentPlayer: 'Test Player',
    npcs: [],
    character: mockCharacter,
    location: 'Test Location',
    savedTimestamp: undefined,
    gameProgress: 0,
    journal: [],
    narrative: '',
    inventory: [],
    quests: [],
    isCombatActive: false,
    opponent: null,
    isClient: false,
    suggestedActions: []
  };

  describe('validateItemUse', () => {
    test('validates basic item without requirements', () => {
      const item: InventoryItem = {
        id: '1',
        name: 'Test Item',
        quantity: 1,
        description: 'Test Description',
        category: 'general'
      };

      const result = InventoryManager.validateItemUse(item, mockCharacter, mockGameState);
      expect(result.valid).toBe(true);
    });

    test('fails validation for zero quantity', () => {
      const item: InventoryItem = {
        id: '1',
        name: 'Test Item',
        quantity: 0,
        description: 'Test Description',
        category: 'general'
      };

      const result = InventoryManager.validateItemUse(item, mockCharacter, mockGameState);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Item not available');
    });

    test('validates strength requirement', () => {
      const item: InventoryItem = {
        id: '1',
        name: 'Heavy Item',
        quantity: 1,
        description: 'Test Description',
        requirements: {
          minStrength: 15
        },
        category: 'general'
      };

      const result = InventoryManager.validateItemUse(item, mockCharacter, mockGameState);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Requires 15 strength');
    });

    test('validates location requirement', () => {
      const item: InventoryItem = {
        id: '1',
        name: 'Location Item',
        quantity: 1,
        description: 'Test Description',
        requirements: {
          location: ['Saloon']
        },
        category: 'general'
      };

      const result = InventoryManager.validateItemUse(item, mockCharacter, mockGameState);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Cannot use this item here');
    });

    test('validates combat requirement', () => {
      const item: InventoryItem = {
        id: '1',
        name: 'Combat Item',
        quantity: 1,
        description: 'Test Description',
        requirements: {
          combatOnly: true
        },
        category: 'general'
      };

      const result = InventoryManager.validateItemUse(item, mockCharacter, mockGameState);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Can only be used during combat');
    });
  });

  describe('getItemUsePrompt', () => {
    test('returns custom use prompt if provided', () => {
      const item: InventoryItem = {
        id: '1',
        name: 'Test Item',
        quantity: 1,
        description: 'Test Description',
        usePrompt: 'Custom prompt',
        category: 'general'
      };

      const prompt = InventoryManager.getItemUsePrompt(item);
      expect(prompt).toBe('Custom prompt');
    });

    test('returns heal prompt for healing items', () => {
      const item: InventoryItem = {
        id: '1',
        name: 'Healing Potion',
        quantity: 1,
        description: 'Test Description',
        effect: {
          type: 'heal',
          value: 10
        },
        category: 'consumable'
      };

      const prompt = InventoryManager.getItemUsePrompt(item);
      expect(prompt).toBe('use Healing Potion to restore strength');
    });

    test('returns default prompt for other items', () => {
      const item: InventoryItem = {
        id: '1',
        name: 'Test Item',
        quantity: 1,
        description: 'Test Description',
        category: 'general'
      };

      const prompt = InventoryManager.getItemUsePrompt(item);
      expect(prompt).toBe('use Test Item');
    });
  });
});
