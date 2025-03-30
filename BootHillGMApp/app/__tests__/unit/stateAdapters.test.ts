/**
 * State Adapters Tests
 * 
 * Tests the adapter functions that provide backward compatibility
 * between the new slice-based architecture and the legacy state shape.
 */

import { 
  adaptStateForTests, 
  migrationAdapter,
  inventoryAdapter,
  journalAdapter,
  combatAdapter,
  narrativeAdapter
} from '../../utils/stateAdapters';
import { GameState } from '../../types/gameState';
import { InventoryItem } from '../../types/item.types';
import { CombatType } from '../../types/combat';
import { JournalEntry } from '../../types/journal';

// Import specific state types from their actual source files
import { CharacterState } from '../../types/state/characterState';
import { CombatState } from '../../types/state/combatState';
import { JournalState } from '../../types/state/journalState';
import { NarrativeState } from '../../types/state/narrativeState';
import { UIState } from '../../types/state/uiState';

interface PartialGameStateWithInventory {
  inventory?: {
    items: InventoryItem[];
  };
}

interface PartialGameStateWithJournal {
  journal?: {
    entries: Array<{
      id: string;
      title: string;
      content?: string;
      timestamp?: number;
    }>;
  };
}

interface PartialGameStateWithCombat {
  combat?: {
    isActive: boolean;
    rounds?: number;
    currentTurn?: string;
    combatType?: CombatType;
    playerTurn?: boolean;
    playerCharacterId?: string;
    opponentCharacterId?: string;
    combatLog?: unknown[];
    roundStartTime?: number;
    modifiers?: {
      player: number;
      opponent: number;
    };
  };
}

interface PartialGameStateWithNarrative {
  narrative?: {
    narrativeContext?: {
      location: string;
      time?: string;
    };
    currentStoryPoint?: unknown;
    visitedPoints?: string[];
    availableChoices?: unknown[];
    narrativeHistory?: string[];
    displayMode?: string;
  };
}

// Legacy state format type
interface LegacyState {
  player?: { id: string; name: string } | null;
  opponent?: { id: string; name: string } | null;
  inventory?: InventoryItem[];
  entries?: Array<{ id: string; title: string; content?: string; timestamp?: number }>;
  isCombatActive?: boolean;
  combatRounds?: number;
  currentTurn?: string;
  narrativeContext?: { location: string; time?: string } | null;
  currentScene?: string;
  dialogues?: Array<{ id: string; text: string }>;
  activeTab?: string;
  isMenuOpen?: boolean;
  notifications?: unknown[];
  [key: string]: unknown;
}

interface InventoryArrayLike {
  items: InventoryItem[];
  length: number;
  find: <T>(fn: (item: InventoryItem) => boolean) => T | undefined;
  filter: (fn: (item: InventoryItem) => boolean) => InventoryItem[];
  some: (fn: (item: InventoryItem) => boolean) => boolean;
  map: <T>(fn: (item: InventoryItem) => T) => T[];
  forEach: (fn: (item: InventoryItem) => void) => void;
  reduce: <T>(fn: (acc: T, item: InventoryItem) => T, initial: T) => T;
  [index: number]: InventoryItem;
  [Symbol.iterator]: () => Iterator<InventoryItem>;
}

interface JournalEntriesArrayLike {
  length: number;
  find: (fn: (entry: JournalEntry) => boolean) => JournalEntry | undefined;
  filter: (fn: (entry: JournalEntry) => boolean) => JournalEntry[];
  [index: number]: JournalEntry;
  [Symbol.iterator]: () => Iterator<JournalEntry>;
}

describe('State Adapters', () => {
  describe('migrationAdapter', () => {
    test('should convert old state to new state', () => {
      // Create a state in the old format
      const oldState: LegacyState = {
        player: { id: 'player1', name: 'Test Player' },
        opponent: { id: 'opponent1', name: 'Test Opponent' },
        inventory: [
          // Create a properly typed InventoryItem
          { 
            id: 'item1', 
            name: 'Test Item',
            description: 'A test item',
            quantity: 1,
            category: 'general'
          }
        ],
        entries: [
          { 
            id: 'entry1', 
            title: 'Test Entry', 
            content: 'Test content', 
            timestamp: Date.now() 
          }
        ],
        isCombatActive: true
      };
      
      // Migrate to new format
      const newState = migrationAdapter.oldToNew(oldState);
      
      // Verify it has the new structure
      expect(newState.character).toBeDefined();
      expect(newState.character && typeof newState.character === 'object' && 'player' in newState.character).toBe(true);
      
      const character = newState.character as { player?: unknown, opponent?: unknown };
      expect(character.player).toEqual(oldState.player);
      expect(character.opponent).toEqual(oldState.opponent);
      
      expect(newState.inventory).toBeDefined();
      const inventory = newState.inventory as { items?: unknown[] };
      expect(inventory.items).toEqual(oldState.inventory);
      
      expect(newState.journal).toBeDefined();
      const journal = newState.journal as { entries?: unknown[] };
      expect(journal.entries).toEqual(oldState.entries);
      
      expect(newState.combat).toBeDefined();
      const combat = newState.combat as { isActive?: boolean };
      expect(combat.isActive).toEqual(oldState.isCombatActive);
    });
    
    test('should handle state already in new format', () => {
      // Create a state already in the new format
      const newFormatState: Partial<GameState> = {
        character: {
          player: { id: 'player1', name: 'Test Player' },
          opponent: null
        } as unknown as CharacterState,
        inventory: {
          items: [{ 
            id: 'item1', 
            name: 'Test Item',
            description: 'A test item',
            quantity: 1,
            category: 'general' 
          }]
        },
        journal: {
          entries: [{ 
            id: 'entry1', 
            title: 'Test Entry',
            content: 'Test content',
            timestamp: Date.now()
          }]
        } as unknown as JournalState,
        combat: {
          isActive: false,
          // Add other required properties for CombatState
          combatType: 'brawling' as CombatType,
          playerTurn: false,
          playerCharacterId: '',
          opponentCharacterId: '',
          combatLog: [],
          roundStartTime: 0,
          modifiers: { player: 0, opponent: 0 },
          winner: null,
          participants: [],
          rounds: 0
        } as unknown as CombatState
      };
      
      // Call migration adapter with type assertion to handle conversion
      const result = migrationAdapter.oldToNew(newFormatState as unknown as LegacyState);
      
      // Should not modify the state (except adding any missing properties)
      expect(result.character).toBeDefined();
      expect(result.inventory).toBeDefined();
      expect(result.journal).toBeDefined();
      expect(result.combat).toBeDefined();
      
      const character = result.character as { player?: unknown, opponent?: unknown };
      const characterSource = newFormatState.character as { player?: unknown, opponent?: unknown };
      expect(character.player).toEqual(characterSource.player);
      expect(character.opponent).toEqual(characterSource.opponent);
      
      const inventory = result.inventory as { items?: unknown[] };
      const inventorySource = newFormatState.inventory as { items?: unknown[] };
      expect(inventory.items).toEqual(inventorySource.items);
      
      const journal = result.journal as { entries?: unknown[] };
      const journalSource = newFormatState.journal as { entries?: unknown[] };
      expect(journal.entries).toEqual(journalSource.entries);
      
      const combat = result.combat as { isActive?: boolean };
      const combatSource = newFormatState.combat as { isActive?: boolean };
      expect(combat.isActive).toEqual(combatSource.isActive);
    });
    
    test('should convert new state to old state', () => {
      // Create a state in the new format with proper types
      const newState: Partial<GameState> = {
        character: {
          player: { id: 'player1', name: 'Test Player' },
          opponent: { id: 'opponent1', name: 'Test Opponent' }
        } as unknown as CharacterState,
        inventory: {
          items: [{ 
            id: 'item1', 
            name: 'Test Item',
            description: 'A test item',
            quantity: 1,
            category: 'general' 
          }]
        },
        journal: {
          entries: [{ 
            id: 'entry1', 
            title: 'Test Entry',
            type: 'quest', // Required for QuestJournalEntry
            questTitle: 'Main Quest',
            status: 'started',
            content: 'Test content',
            timestamp: Date.now()
          }]
        } as unknown as JournalState,
        combat: {
          isActive: true,
          rounds: 2,
          combatType: 'brawling', // Use a valid CombatType
          playerTurn: true,
          playerCharacterId: 'player1',
          opponentCharacterId: 'opponent1',
          combatLog: [],
          roundStartTime: Date.now(),
          modifiers: {
            player: 0,
            opponent: 0
          },
          winner: null,
          participants: []
        } as unknown as CombatState,
        narrative: {
          currentStoryPoint: null,
          visitedPoints: [],
          availableChoices: [],
          narrativeHistory: [],
          displayMode: 'default',
          narrativeContext: { location: 'Saloon' }
        } as unknown as NarrativeState
      };
      
      // Convert to old format - use a type assertion to avoid conversion issues
      const oldState = migrationAdapter.newToOld(newState as GameState);
      
      // Verify it has the old structure
      const character = newState.character as { player?: unknown, opponent?: unknown };
      expect(oldState.player).toEqual(character.player);
      expect(oldState.opponent).toEqual(character.opponent);
      
      const inventory = newState.inventory as { items?: unknown[] };
      expect(oldState.inventory).toEqual(inventory.items);
      
      const journal = newState.journal as { entries?: unknown[] };
      expect(oldState.entries).toEqual(journal.entries);
      
      const combat = newState.combat as { isActive?: boolean, rounds?: number };
      expect(oldState.isCombatActive).toEqual(combat.isActive);
      expect(oldState.combatRounds).toEqual(combat.rounds);
      
      const narrative = newState.narrative as { narrativeContext?: unknown };
      expect(oldState.narrativeContext).toEqual(narrative.narrativeContext);
      
      // Should also keep references to new structure
      expect(oldState.character).toEqual(newState.character);
    });
  });
  
  describe('inventoryAdapter', () => {
    test('should add array methods to inventory', () => {
      const state: PartialGameStateWithInventory = {
        inventory: {
          items: [
            { 
              id: 'item1', 
              name: 'Revolver',
              description: 'A six-shooter',
              quantity: 1,
              category: 'weapon'
            },
            { 
              id: 'item2', 
              name: 'Canteen',
              description: 'Holds water',
              quantity: 1,
              category: 'general'
            }
          ]
        }
      };
      
      const adapted = inventoryAdapter.adaptForTests(state as unknown as GameState);
      
      // Type guard to check if inventory has array methods
      function hasArrayMethods(obj: unknown): obj is { inventory: InventoryArrayLike } {
        return obj !== null && 
               typeof obj === 'object' && 
               'inventory' in obj && 
               obj.inventory !== null &&
               typeof obj.inventory === 'object' && 
               'find' in obj.inventory &&
               'filter' in obj.inventory;
      }
      
      // Check that inventory is properly adapted
      expect(hasArrayMethods(adapted)).toBe(true);
      
      // Should be able to use array methods if properly adapted
      if (hasArrayMethods(adapted)) {
        // Should be able to use array methods
        expect(adapted.inventory.find(item => item.id === 'item1')).toBeDefined();
        expect(adapted.inventory.filter(item => item.name.includes('an')).length).toBe(1);
        expect(adapted.inventory.some(item => item.id === 'item2')).toBe(true);
        expect(adapted.inventory.length).toBe(2);
        
        // Should be able to access by index
        expect(adapted.inventory[0].id).toBe('item1');
        expect(adapted.inventory[1].name).toBe('Canteen');
        
        // Should allow spread and iteration
        const itemsCopy = [...adapted.inventory];
        expect(itemsCopy.length).toBe(2);
        
        // Original items should still be accessible
        expect(adapted.inventory.items).toEqual(state.inventory!.items);
      }
    });
    
    test('should handle empty inventory', () => {
      const state: PartialGameStateWithInventory = {
        inventory: {
          items: []
        }
      };
      
      const adapted = inventoryAdapter.adaptForTests(state as unknown as GameState);
      
      // Type guard to check if inventory has array methods
      function hasArrayMethods(obj: unknown): obj is { inventory: InventoryArrayLike } {
        return obj !== null && 
               typeof obj === 'object' && 
               'inventory' in obj && 
               obj.inventory !== null &&
               typeof obj.inventory === 'object' && 
               'find' in obj.inventory;
      }
      
      // Check inventory properly adapted
      expect(hasArrayMethods(adapted)).toBe(true);
      
      if (hasArrayMethods(adapted)) {
        expect(adapted.inventory.length).toBe(0);
        expect([...adapted.inventory]).toEqual([]);
        expect(adapted.inventory.find(() => true)).toBeUndefined();
      }
    });
  });
  
  describe('journalAdapter', () => {
    test('should add array methods to entries', () => {
      const state: PartialGameStateWithJournal = {
        journal: {
          entries: [
            { 
              id: 'entry1', 
              title: 'First Entry',
              content: 'First entry content',
              timestamp: Date.now()
            },
            { 
              id: 'entry2', 
              title: 'Second Entry',
              content: 'Second entry content',
              timestamp: Date.now()
            }
          ]
        }
      };
      
      const adapted = journalAdapter.adaptForTests(state as unknown as GameState);
      
      // Type guard for entries with array methods
      function hasEntriesArray(obj: unknown): obj is { entries: JournalEntriesArrayLike } {
        return obj !== null && 
               typeof obj === 'object' && 
               'entries' in obj && 
               obj.entries !== null &&
               typeof obj.entries === 'object' && 
               'find' in obj.entries;
      }
      
      // Check that entries are properly adapted
      expect(hasEntriesArray(adapted)).toBe(true);
      
      if (hasEntriesArray(adapted)) {
        // Check that entries are accessible as an array
        expect(adapted.entries.length).toBe(2);
        expect(adapted.entries[0].id).toBe('entry1');
        expect(adapted.entries[1].title).toBe('Second Entry');
        
        // Check array methods
        expect(adapted.entries.find(entry => entry.id === 'entry1')).toBeDefined();
        expect(adapted.entries.filter(entry => typeof entry.title === 'string' && entry.title.includes('First')).length).toBe(1);
        
        // Should allow spread and iteration
        const entriesCopy = [...adapted.entries];
        expect(entriesCopy.length).toBe(2);
        expect(entriesCopy[0].title).toBe('First Entry');
      }
    });
    
    test('should handle empty entries', () => {
      const state: PartialGameStateWithJournal = {
        journal: {
          entries: []
        }
      };
      
      const adapted = journalAdapter.adaptForTests(state as unknown as GameState);
      
      // Type guard for entries with array methods
      function hasEntriesArray(obj: unknown): obj is { entries: JournalEntriesArrayLike } {
        return obj !== null && 
               typeof obj === 'object' && 
               'entries' in obj && 
               obj.entries !== null &&
               typeof obj.entries === 'object' && 
               'length' in obj.entries;
      }
      
      // Check that entries are properly adapted
      expect(hasEntriesArray(adapted)).toBe(true);
      
      if (hasEntriesArray(adapted)) {
        expect(adapted.entries.length).toBe(0);
        expect([...adapted.entries]).toEqual([]);
      }
    });
  });
  
  describe('combatAdapter', () => {
    test('should add combat flags to root level', () => {
      const state: PartialGameStateWithCombat = {
        combat: {
          isActive: true,
          rounds: 3,
          currentTurn: 'player',
          combatType: 'brawling',
          playerTurn: true,
          playerCharacterId: 'player1',
          opponentCharacterId: 'opponent1',
          combatLog: [],
          roundStartTime: Date.now(),
          modifiers: {
            player: 0,
            opponent: 0
          }
        }
      };
      
      // Use a type assertion to handle the conversion
      const adapted = combatAdapter.adaptForTests(state as unknown as GameState);
      
      // Type guard for adapted combat state
      function hasCombatFlags(obj: unknown): obj is { 
        isCombatActive: boolean; 
        combatRounds: number; 
        currentTurn: string;
        combat: unknown;
      } {
        return obj !== null && 
               typeof obj === 'object' && 
               'isCombatActive' in obj && 
               'combatRounds' in obj &&
               'currentTurn' in obj;
      }
      
      // Check that combat properties are adapted
      expect(hasCombatFlags(adapted)).toBe(true);
      
      if (hasCombatFlags(adapted)) {
        // Check that combat properties are accessible at the root level
        expect(adapted.isCombatActive).toBe(true);
        expect(adapted.combatRounds).toBe(3);
        expect(adapted.currentTurn).toBe('player');
        
        // Original combat slice should still be accessible
        expect(adapted.combat).toEqual(state.combat);
      }
    });
  });
  
  describe('narrativeAdapter', () => {
    test('should add narrative context to root level', () => {
      const state: PartialGameStateWithNarrative = {
        narrative: {
          narrativeContext: { location: 'Saloon', time: 'Night' },
          currentStoryPoint: null,
          visitedPoints: [],
          availableChoices: [],
          narrativeHistory: [],
          displayMode: 'default'
        }
      };
      
      const adapted = narrativeAdapter.adaptForTests(state as unknown as GameState);
      
      // Type guard for narrative context
      function hasNarrativeContext(obj: unknown): obj is {
        narrativeContext: { location: string; time?: string };
        currentScene: unknown;
        dialogues: unknown[];
      } {
        return obj !== null && 
               typeof obj === 'object' && 
               'narrativeContext' in obj && 
               'currentScene' in obj &&
               'dialogues' in obj;
      }
      
      // Check narrative adaptation
      expect(hasNarrativeContext(adapted)).toBe(true);
      
      if (hasNarrativeContext(adapted)) {
        // Check that narrative properties are accessible at the root level
        expect(adapted.narrativeContext).toEqual(state.narrative!.narrativeContext);
        expect(adapted.currentScene).toBeDefined(); // Check that it exists
        expect(adapted.dialogues).toBeDefined(); // Check that it exists
      }
    });
  });
  
  describe('adaptStateForTests', () => {
    test('should apply all adapters to the state', () => {
      // Create full game state with proper types
      const state: Partial<GameState> = {
        character: {
          player: { 
            id: 'player1', 
            name: 'Test Player', 
            health: 100, 
            maxHealth: 100 
          },
          opponent: null
        } as unknown as CharacterState,
        inventory: {
          items: [{ 
            id: 'item1', 
            name: 'Test Item',
            description: 'A test item',
            quantity: 1,
            category: 'general' 
          }]
        },
        journal: {
          entries: [{ 
            id: 'entry1', 
            title: 'Test Entry',
            type: 'quest',
            questTitle: 'Main Quest',
            status: 'started',
            content: 'Test content',
            timestamp: Date.now()
          } as JournalEntry]
        } as unknown as JournalState,
        combat: {
          isActive: true,
          rounds: 2,
          combatType: 'brawling',
          playerTurn: true,
          playerCharacterId: 'player1',
          opponentCharacterId: 'opponent1',
          combatLog: [],
          roundStartTime: Date.now(),
          modifiers: {
            player: 0,
            opponent: 0
          },
          winner: null,
          participants: []
        } as unknown as CombatState,
        narrative: {
          currentStoryPoint: null,
          visitedPoints: [],
          availableChoices: [],
          narrativeHistory: [],
          displayMode: 'default',
          narrativeContext: { location: 'Saloon' }
        } as unknown as NarrativeState,
        ui: {
          activeTab: 'inventory',
          isMenuOpen: true,
          notifications: [],
          isLoading: false,
          modalOpen: null
        } as unknown as UIState
      };
      
      // Use type assertion to handle the conversion and expected properties
      const adapted = adaptStateForTests(state as unknown as GameState);
      
      // Define a complex type guard to check all adapter properties
      function isFullyAdapted(obj: unknown): obj is {
        player: unknown;
        inventory: InventoryArrayLike;
        entries: JournalEntriesArrayLike;
        isCombatActive: boolean;
        combatRounds: number;
        narrativeContext: unknown;
        currentScene: unknown;
        activeTab: string;
        isMenuOpen: boolean;
        journal: unknown;
      } {
        return obj !== null && 
               typeof obj === 'object' && 
               'player' in obj &&
               'inventory' in obj &&
               'entries' in obj &&
               'isCombatActive' in obj &&
               'combatRounds' in obj &&
               'narrativeContext' in obj &&
               'currentScene' in obj &&
               'activeTab' in obj &&
               'isMenuOpen' in obj &&
               'journal' in obj;
      }
      
      // Check full state is properly adapted
      expect(isFullyAdapted(adapted)).toBe(true);
      
      if (isFullyAdapted(adapted)) {
        // Check character adapter
        expect(adapted.player).toEqual((state.character as { player: unknown }).player);
        
        // Check inventory adapter
        expect(adapted.inventory.length).toBe(1);
        expect(adapted.inventory.items[0].name).toBe('Test Item');
        
        // Check journal adapter
        expect(adapted.entries.length).toBe(1);
        expect(adapted.entries[0].title).toBe('Test Entry');
        
        // Check combat adapter
        expect(adapted.isCombatActive).toBe(true);
        expect(adapted.combatRounds).toBe(2);
        
        // Check narrative adapter - use safer property access
        expect(adapted.narrativeContext).toBeDefined();
        expect(adapted.currentScene).toBeDefined();
        
        // Check UI adapter
        expect(adapted.activeTab).toBe('inventory');
        expect(adapted.isMenuOpen).toBe(true);
        
        // All slices should still be accessible
        expect(adapted.journal).toBeDefined();
      }
    });
    
    test('should handle null state', () => {
      expect(adaptStateForTests(null as unknown as GameState)).toBeNull();
    });
  });
});
