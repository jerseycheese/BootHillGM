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

// Define types for partial state objects used in tests
interface PartialGameStateWithCharacter {
  character?: {
    player?: {
      id: string;
      name: string;
    } | null;
    opponent?: {
      id: string;
      name: string;
    } | null;
  };
}

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
    }>;
  };
}

interface PartialGameStateWithCombat {
  combat?: {
    isActive: boolean;
    rounds?: number;
    currentTurn?: string;
  };
}

interface PartialGameStateWithNarrative {
  narrative?: {
    context?: {
      location: string;
      time?: string;
    };
    currentScene?: string;
    dialogues?: Array<{
      id: string;
      text: string;
    }>;
  };
}

// Legacy state format type
interface LegacyState {
  player?: { id: string; name: string } | null;
  opponent?: { id: string; name: string } | null;
  inventory?: InventoryItem[];
  entries?: Array<{ id: string; title: string }>;
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

describe('State Adapters', () => {
  describe('migrationAdapter', () => {
    test('should convert old state to new state', () => {
      // Create a state in the old format
      const oldState: LegacyState = {
        player: { id: 'player1', name: 'Test Player' },
        opponent: { id: 'opponent1', name: 'Test Opponent' },
        inventory: [
          { id: 'item1', name: 'Test Item' }
        ],
        entries: [
          { id: 'entry1', title: 'Test Entry' }
        ],
        isCombatActive: true
      };
      
      // Migrate to new format
      const newState = migrationAdapter.oldToNew(oldState);
      
      // Verify it has the new structure
      expect(newState.character).toBeDefined();
      expect(newState.character.player).toEqual(oldState.player);
      expect(newState.character.opponent).toEqual(oldState.opponent);
      
      expect(newState.inventory).toBeDefined();
      expect(newState.inventory.items).toEqual(oldState.inventory);
      
      expect(newState.journal).toBeDefined();
      expect(newState.journal.entries).toEqual(oldState.entries);
      
      expect(newState.combat).toBeDefined();
      expect(newState.combat.isActive).toEqual(oldState.isCombatActive);
    });
    
    test('should handle state already in new format', () => {
      // Create a state already in the new format
      const newFormatState: PartialGameStateWithCharacter & PartialGameStateWithInventory & PartialGameStateWithJournal & PartialGameStateWithCombat = {
        character: {
          player: { id: 'player1', name: 'Test Player' },
          opponent: null
        },
        inventory: {
          items: [{ id: 'item1', name: 'Test Item' }]
        },
        journal: {
          entries: [{ id: 'entry1', title: 'Test Entry' }]
        },
        combat: {
          isActive: false
        }
      };
      
      // Call migration adapter
      const result = migrationAdapter.oldToNew(newFormatState);
      
      // Should not modify the state
      expect(result).toEqual(newFormatState);
    });
    
    test('should convert new state to old state', () => {
      // Create a state in the new format
      const newState: Partial<GameState> = {
        character: {
          player: { id: 'player1', name: 'Test Player' },
          opponent: { id: 'opponent1', name: 'Test Opponent' }
        },
        inventory: {
          items: [{ id: 'item1', name: 'Test Item' }]
        },
        journal: {
          entries: [{ id: 'entry1', title: 'Test Entry' }]
        },
        combat: {
          isActive: true,
          rounds: 2
        },
        narrative: {
          context: { location: 'Saloon' },
          currentScene: 'standoff',
          dialogues: []
        }
      };
      
      // Convert to old format
      const oldState = migrationAdapter.newToOld(newState as GameState);
      
      // Verify it has the old structure
      expect(oldState.player).toEqual(newState.character!.player);
      expect(oldState.opponent).toEqual(newState.character!.opponent);
      expect(oldState.inventory).toEqual(newState.inventory!.items);
      expect(oldState.entries).toEqual(newState.journal!.entries);
      expect(oldState.isCombatActive).toEqual(newState.combat!.isActive);
      expect(oldState.combatRounds).toEqual(newState.combat!.rounds);
      expect(oldState.narrativeContext).toEqual(newState.narrative!.context);
      
      // Should also keep references to new structure
      expect(oldState.character).toEqual(newState.character);
    });
  });
  
  describe('inventoryAdapter', () => {
    test('should add array methods to inventory', () => {
      const state: PartialGameStateWithInventory = {
        inventory: {
          items: [
            { id: 'item1', name: 'Revolver' },
            { id: 'item2', name: 'Canteen' }
          ]
        }
      };
      
      const adapted = inventoryAdapter.adaptForTests(state as GameState);
      
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
    });
    
    test('should handle empty inventory', () => {
      const state: PartialGameStateWithInventory = {
        inventory: {
          items: []
        }
      };
      
      const adapted = inventoryAdapter.adaptForTests(state as GameState);
      
      expect(adapted.inventory.length).toBe(0);
      expect([...adapted.inventory]).toEqual([]);
      expect(adapted.inventory.find(() => true)).toBeUndefined();
    });
  });
  
  describe('journalAdapter', () => {
    test('should add array methods to entries', () => {
      const state: PartialGameStateWithJournal = {
        journal: {
          entries: [
            { id: 'entry1', title: 'First Entry' },
            { id: 'entry2', title: 'Second Entry' }
          ]
        }
      };
      
      const adapted = journalAdapter.adaptForTests(state as GameState);
      
      // Check that entries are accessible as an array
      expect(adapted.entries.length).toBe(2);
      expect(adapted.entries[0].id).toBe('entry1');
      expect(adapted.entries[1].title).toBe('Second Entry');
      
      // Check array methods
      expect(adapted.entries.find(entry => entry.id === 'entry1')).toBeDefined();
      expect(adapted.entries.filter(entry => entry.title.includes('First')).length).toBe(1);
      
      // Should allow spread and iteration
      const entriesCopy = [...adapted.entries];
      expect(entriesCopy.length).toBe(2);
      expect(entriesCopy[0].title).toBe('First Entry');
    });
    
    test('should handle empty entries', () => {
      const state: PartialGameStateWithJournal = {
        journal: {
          entries: []
        }
      };
      
      const adapted = journalAdapter.adaptForTests(state as GameState);
      
      expect(adapted.entries.length).toBe(0);
      expect([...adapted.entries]).toEqual([]);
    });
  });
  
  describe('combatAdapter', () => {
    test('should add combat flags to root level', () => {
      const state: PartialGameStateWithCombat = {
        combat: {
          isActive: true,
          rounds: 3,
          currentTurn: 'player'
        }
      };
      
      const adapted = combatAdapter.adaptForTests(state as GameState);
      
      // Check that combat properties are accessible at the root level
      expect(adapted.isCombatActive).toBe(true);
      expect(adapted.combatRounds).toBe(3);
      expect(adapted.currentTurn).toBe('player');
      
      // Original combat slice should still be accessible
      expect(adapted.combat).toEqual(state.combat);
    });
  });
  
  describe('narrativeAdapter', () => {
    test('should add narrative context to root level', () => {
      const state: PartialGameStateWithNarrative = {
        narrative: {
          context: { location: 'Saloon', time: 'Night' },
          currentScene: 'standoff',
          dialogues: [{ id: 'dialogue1', text: 'Test dialogue' }]
        }
      };
      
      const adapted = narrativeAdapter.adaptForTests(state as GameState);
      
      // Check that narrative properties are accessible at the root level
      expect(adapted.narrativeContext).toEqual(state.narrative!.context);
      expect(adapted.currentScene).toBe('standoff');
      expect(adapted.dialogues).toEqual(state.narrative!.dialogues);
    });
  });
  
  describe('adaptStateForTests', () => {
    test('should apply all adapters to the state', () => {
      const state: Partial<GameState> = {
        character: {
          player: { id: 'player1', name: 'Test Player' },
          opponent: null
        },
        inventory: {
          items: [{ id: 'item1', name: 'Test Item' }]
        },
        journal: {
          entries: [{ id: 'entry1', title: 'Test Entry' }]
        },
        combat: {
          isActive: true,
          rounds: 2
        },
        narrative: {
          context: { location: 'Saloon' },
          currentScene: 'standoff'
          // Note: no dialogues property here
        },
        ui: {
          activeTab: 'inventory',
          isMenuOpen: true,
          notifications: []
        }
      };
      
      const adapted = adaptStateForTests(state as GameState);
      
      // Check character adapter
      expect(adapted.player).toEqual(state.character!.player);
      
      // Check inventory adapter
      expect(adapted.inventory.length).toBe(1);
      expect(adapted.inventory[0].name).toBe('Test Item');
      
      // Check journal adapter
      expect(adapted.entries.length).toBe(1);
      expect(adapted.entries[0].title).toBe('Test Entry');
      
      // Check combat adapter
      expect(adapted.isCombatActive).toBe(true);
      expect(adapted.combatRounds).toBe(2);
      
      // Check narrative adapter
      expect(adapted.narrativeContext).toEqual(state.narrative!.context);
      expect(adapted.currentScene).toBe('standoff');
      
      // Check UI adapter
      expect(adapted.activeTab).toBe('inventory');
      expect(adapted.isMenuOpen).toBe(true);
      
      // All slices should still be accessible
      expect(adapted.character).toEqual(state.character);
      expect(adapted.inventory.items).toEqual(state.inventory!.items);
      expect(adapted.journal.entries).toEqual(state.journal!.entries);
      expect(adapted.combat).toEqual(state.combat);
      
      // For narrative, we need to extract only the core properties for comparison
      // because the adapter adds additional fields from initialNarrativeState
      const narrativeCoreParts = {
        context: adapted.narrative.context,
        currentScene: adapted.narrative.currentScene,
        // Either use the same condition on both sides or normalize both to empty arrays
        dialogues: adapted.narrative.dialogues || [],
      };
      const originalNarrativeCoreParts = {
        context: state.narrative!.context,
        currentScene: state.narrative!.currentScene,
        // Either use the same condition on both sides or normalize both to empty arrays
        dialogues: state.narrative!.dialogues || [],
      };
      expect(narrativeCoreParts).toEqual(originalNarrativeCoreParts);
      
      expect(adapted.ui).toEqual(state.ui);
    });
    
    test('should handle null state', () => {
      expect(adaptStateForTests(null as unknown as GameState)).toBeNull();
    });
  });
});
