import { InventoryManager } from '../../utils/inventoryManager';
import { Character } from '../../types/character';
import { GameState } from '../../types/gameState'; // Use correct GameState type
import { initialCharacterState } from '../../types/state/characterState';
import { initialCombatState } from '../../types/state/combatState';
import { initialInventoryState } from '../../types/state/inventoryState';
import { initialJournalState } from '../../types/state/journalState';
import { initialNarrativeState } from '../../types/state/narrativeState';
import { initialUIState } from '../../types/state/uiState';
import { InventoryItem } from '../../types/item.types';
import { WEAPONS } from '../../utils/weaponDefinitions';

const localStorageMock = (() => {
  let store: { [key: string]: string } = { /* Intentionally empty */ };
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = String(value); },
    clear: () => { store = { /* Intentionally empty */ }; },
    removeItem: (key: string) => { delete store[key]; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

import { LocationType } from '../../services/locationService';

describe('InventoryManager', () => {
  const mockCharacter: Character = {
    id: 'test-character',
    name: 'Test Character',
    isNPC: false,
    isPlayer: true,
    inventory: { items: [] }, // Use correct InventoryState structure
    attributes: {
      speed: 5,
      gunAccuracy: 5,
      throwingAccuracy: 5,
      strength: 10,
      baseStrength: 10,
      bravery: 5,
      experience: 0
    },
    minAttributes: { // Add missing required property
      speed: 1,
      gunAccuracy: 1,
      throwingAccuracy: 1,
      strength: 1,
      baseStrength: 1,
      bravery: 1,
      experience: 0
    },
    maxAttributes: { // Add missing required property
      speed: 20,
      gunAccuracy: 20,
      throwingAccuracy: 20,
      strength: 20,
      baseStrength: 20,
      bravery: 20,
      experience: 100 // Example max
    },
    wounds: [],
    isUnconscious: false,
    // equippedWeapon: undefined, // This is part of CharacterState now, not top-level Character
    strengthHistory: {baseStrength: 10, changes: []}
  };

  // Rebuild mockGameState with the correct slice structure
  const mockGameState: GameState = {
    // Slices
    character: { // Use CharacterState structure
      ...initialCharacterState, // Start with initial state
      player: mockCharacter, // Assign the mock player
      opponent: null
    },
    combat: { // Use CombatState structure
      ...initialCombatState,
      isActive: false // Set the relevant property for the test
    },
    inventory: initialInventoryState,
    journal: initialJournalState,
    narrative: initialNarrativeState,
    ui: initialUIState,

    // Top-level properties
    currentPlayer: 'Test Player', // This might be redundant if character.player.id is used
    npcs: [],
    location: { type: 'town', name: 'Test Location' } as LocationType,
    quests: [],
    gameProgress: 0,
    savedTimestamp: 0, // Use number instead of undefined
    isClient: false,
    suggestedActions: [],
  };

  beforeEach(() => {
    InventoryManager.clearInventory();
    localStorage.clear();
  });

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

  describe('Weapon Addition', () => {
    test('should add Colt Peacemaker with correct weapon stats', () => {
      const coltPeacemaker: InventoryItem = {
        id: 'colt_peacemaker',
        name: 'Colt Peacemaker',
        description: 'A reliable revolver with a long barrel.',
        quantity: 1,
        category: 'weapon',
        weapon: WEAPONS['Colt Peacemaker']
      };
 
      InventoryManager.addItem(coltPeacemaker)
      const item = InventoryManager.getItem(coltPeacemaker.id);
 
      expect(item).toBeDefined();
      expect(item?.name).toBe('Colt Peacemaker');
      expect(item?.category).toBe('weapon');
      expect(item?.weapon).toEqual(WEAPONS['Colt Peacemaker']);
    });    test('should add Derringer with correct weapon stats', () => {
      const derringer: InventoryItem = {
        id: 'derringer',
        name: 'Derringer',
        description: 'A small, concealable revolver.',
        quantity: 1,
        category: 'weapon',
        weapon: WEAPONS['Derringer']
      };
 
      InventoryManager.addItem(derringer)
      const item = InventoryManager.getItem(derringer.id);
      expect(item).toBeDefined();
      expect(item?.name).toBe('Derringer');
      expect(item?.category).toBe('weapon');
      expect(item?.weapon).toEqual(WEAPONS['Derringer']);
    });

    test('should add non-weapon item without weapon stats', () => {
      const bandage: InventoryItem = {
        id: 'bandage',
        name: 'Bandage',
        description: 'A simple bandage for treating wounds.',
        quantity: 5,
        category: 'medical'
      };
 
      InventoryManager.addItem(bandage)
      const item = InventoryManager.getItem(bandage.id);
      expect(item).toBeDefined();
      expect(item?.name).toBe('Bandage');
      expect(item?.category).toBe('medical');
      expect(item?.weapon).toBeUndefined();
    });
  });

  describe('Weapon Equipping', () => {
    test('should equip Colt Peacemaker with correct weapon stats', () => {
      const coltPeacemaker: InventoryItem = {
        id: 'colt_peacemaker',
        name: 'Colt Peacemaker',
        description: 'A reliable revolver with a long barrel.',
        quantity: 1,
        category: 'weapon',
        weapon: WEAPONS['Colt Peacemaker']
      };
 
      InventoryManager.addItem(coltPeacemaker)
      InventoryManager.equipWeapon(mockCharacter, coltPeacemaker);
 
      // Ensure the mockCharacter is updated with the equipped weapon
      expect(mockCharacter.equippedWeapon).toEqual( {
        id: coltPeacemaker.id,
        name: coltPeacemaker.name,
        description: coltPeacemaker.description,
        category: coltPeacemaker.category,
        weapon: coltPeacemaker.weapon,
        isEquipped: true,
        quantity: 1
      } );
    });

    test('should equip Horseshoe Hammer with Other Melee Weapon stats', () => {
      const horseshoeHammer: InventoryItem = {
        id: 'horseshoe_hammer',
        name: 'Horseshoe Hammer',
        description: 'A makeshift melee weapon.',
        quantity: 1,
        category: 'weapon',
        weapon: WEAPONS['Other Melee Weapon'] // Ensure correct weapon stats
      };
 
      InventoryManager.addItem(horseshoeHammer);
      InventoryManager.equipWeapon(mockCharacter, horseshoeHammer);

      expect(mockCharacter.equippedWeapon?.weapon).toEqual(WEAPONS['Other Melee Weapon']);
    });
  });
});
