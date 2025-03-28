/**
 * State Testing Utilities
 * 
 * Helper functions for testing with the new state architecture and adapters.
 */

import { GameState } from '../../types/gameState';
import { GameEngineAction } from '../../types/gameActions';
import { adaptStateForTests, migrationAdapter, LegacyState } from '../../utils/stateAdapters';
import { InventoryItem } from '../../types/item.types';
import { InventoryState } from '../../types/state/inventoryState';
import { JournalEntry as AppJournalEntry } from '../../types/journal';
import { JournalState } from '../../types/state/journalState';
import { StoryPointType } from '../../types/narrative/story-point.types';
import { Character } from '../../types/character';
import { NarrativeContext } from '../../types/narrative.types';
import { UIState } from '../../types/state/uiState';

// Type definitions for test journal entries - kept separate from app JournalEntry
interface TestJournalEntry {
  id?: string;
  title?: string;
  content: string;
  type: 'narrative' | 'combat' | 'inventory' | 'quest';
  timestamp: number;
  questTitle?: string;
  status?: 'started' | 'updated' | 'completed' | 'failed';
  [key: string]: unknown;
}

// Type definition for reducer functions
type StateReducer<T = Partial<GameState>> = (
  state: T, 
  action: GameEngineAction
) => T;

// Define a better base mock state type with required properties
interface BaseMockState {
  character: {
    player: Character | null;
    opponent: Character | null;
  };
  combat: {
    isActive: boolean;
    rounds: number;
    [key: string]: unknown;
  };
  inventory: InventoryState;
  journal: JournalState;
  narrative: {
    currentStoryPoint: unknown;
    visitedPoints: unknown[];
    availableChoices: unknown[];
    narrativeHistory: unknown[];
    displayMode: string;
    error: unknown;
    narrativeContext?: NarrativeContext;
  };
  ui: UIState;
  currentPlayer: string;
  npcs: string[];
  location: unknown;
  quests: string[];
  gameProgress: number;
  suggestedActions: unknown[];
}

/**
 * Prepares an initial state for testing with adapters applied
 * 
 * This utility is particularly useful in test setups where you want to
 * start with a specific state shape, but need backward compatibility.
 * 
 * @param state The initial state to prepare
 * @returns The adapted state ready for testing
 */
export const prepareStateForTesting = (state: Partial<GameState>): GameState => {
  // Ensure it's in the new format first
  const normalizedState = migrationAdapter.oldToNew(state as GameState);
  
  // Then apply adapters for test compatibility
  const adaptedState = adaptStateForTests(normalizedState as GameState);
  
  // Ensure inventory and journal have proper array indexing
  if (adaptedState.inventory?.items) {
    const items = adaptedState.inventory.items;
    for (let i = 0; i < items.length; i++) {
      (adaptedState.inventory as unknown as Record<number, InventoryItem>)[i] = items[i];
    }
  }
  
  if (adaptedState.journal?.entries) {
    const entries = adaptedState.journal.entries;
    // Legacy entries property
    const legacyState = adaptedState as unknown as { entries?: AppJournalEntry[] };
    if (legacyState.entries) {
      for (let i = 0; i < entries.length; i++) {
        legacyState.entries[i] = entries[i];
      }
    }
  }
  
  return adaptedState;
};

/**
 * Applies a reducer and adapts the resulting state for testing
 * 
 * This is useful when testing reducers directly, ensuring that
 * the state they receive and return is correctly adapted.
 * 
 * @param reducer The reducer to test
 * @param state The current state
 * @param action The action to dispatch
 * @returns The adapted resulting state
 */
export const applyReducerForTesting = (
  reducer: StateReducer,
  state: Partial<GameState>,
  action: GameEngineAction
): Partial<GameState> => {
  // Special handling for specific reducer tests
  let inputState = state;
  
  // If we're testing inventory reducer specifically
  if (action.type.includes('inventory/') || action.type.includes('INVENTORY')) {
    // If the state already has an inventory object with items, use that
    if (state.inventory && !Array.isArray(state.inventory) && state.inventory.items) {
      inputState = {
        ...state,
        inventory: {
          ...state.inventory
        }
      };
    }
    // If legacy array format, convert it
    else if (Array.isArray(state.inventory)) {
      inputState = {
        ...state,
        inventory: {
          items: [...state.inventory] as InventoryItem[]
        }
      };
    }
  }
  
  // If we're testing journal reducer specifically
  if (action.type.includes('journal/') || action.type.includes('JOURNAL')) {
    // If journal is an array (very old format)
    if (Array.isArray(state.journal)) {
      inputState = {
        ...state,
        journal: {
          entries: convertToAppJournalEntries([...state.journal])
        }
      };
      
      // Also store in legacy format
      (inputState as unknown as { entries: AppJournalEntry[] }).entries = 
        convertToAppJournalEntries([...state.journal]);
    }
    // If the state has journal object with entries array, use that
    else if (state.journal && state.journal.entries) {
      inputState = {
        ...state,
        journal: {
          ...state.journal,
          entries: [...state.journal.entries]
        }
      };
      
      // Ensure entries at root level for backward compatibility
      (inputState as unknown as { entries: AppJournalEntry[] }).entries = 
        [...state.journal.entries];
    }
    // If legacy format with entries at root
    else if ((state as unknown as { entries?: AppJournalEntry[] }).entries && 
             Array.isArray((state as unknown as { entries?: AppJournalEntry[] }).entries)) {
      const legacyEntries = (state as unknown as { entries: AppJournalEntry[] }).entries;
      
      inputState = {
        ...state,
        journal: {
          entries: [...legacyEntries]
        }
      };
      
      // Maintain entries at root for backward compatibility
      (inputState as unknown as { entries: AppJournalEntry[] }).entries = [...legacyEntries];
    }
  }

  // Apply the reducer
  const reducerResult = reducer(inputState, action);
  
  // Special post-processing for journal actions
  if (action.type.includes('journal/') || action.type.includes('JOURNAL')) {
    // Ensure journal entries are properly reflected at both levels
    if (reducerResult.journal && reducerResult.journal.entries) {
      (reducerResult as unknown as { entries: AppJournalEntry[] }).entries = 
        [...reducerResult.journal.entries];
    } 
    else if ((reducerResult as unknown as { entries?: AppJournalEntry[] }).entries && 
             Array.isArray((reducerResult as unknown as { entries: AppJournalEntry[] }).entries)) {
      const legacyEntries = (reducerResult as unknown as { entries: AppJournalEntry[] }).entries;
      
      if (!reducerResult.journal) {
        reducerResult.journal = { entries: [] } as JournalState;
      }
      
      reducerResult.journal = {
        ...reducerResult.journal,
        entries: [...legacyEntries]
      };
    }
  }
  
  // Apply adapters for tests
  const adaptedState = adaptStateForTests(reducerResult as GameState);
  
  // Final adjustment for array access patterns
  if (adaptedState.inventory?.items) {
    const items = adaptedState.inventory.items;
    for (let i = 0; i < items.length; i++) {
      (adaptedState.inventory as unknown as Record<number, InventoryItem>)[i] = items[i];
    }
  }
  
  if (adaptedState.journal?.entries) {
    const entries = adaptedState.journal.entries;
    const legacyState = adaptedState as unknown as { entries?: AppJournalEntry[] };
    
    if (legacyState.entries) {
      for (let i = 0; i < entries.length; i++) {
        legacyState.entries[i] = entries[i];
      }
    }
  }
  
  return adaptedState;
};

/**
 * Helper function to convert test journal entries to app journal entries
 */
function convertToAppJournalEntries(entries: (TestJournalEntry | Record<string, unknown>)[]): AppJournalEntry[] {
  return entries.map(entry => {
    // Create a base journal entry
    const baseEntry: Partial<AppJournalEntry> = {
      timestamp: 'timestamp' in entry ? Number(entry.timestamp) : Date.now(),
      content: 'content' in entry ? String(entry.content) : 
               ('title' in entry ? String(entry.title) : 'No content'),
      type: 'type' in entry ? entry.type as AppJournalEntry['type'] : 'narrative'
    };
    
    // For quest entries
    if (baseEntry.type === 'quest') {
      return {
        ...baseEntry,
        type: 'quest',
        questTitle: 'questTitle' in entry ? String(entry.questTitle) : 'Unknown Quest',
        status: 'status' in entry ? entry.status as 'started' | 'updated' | 'completed' | 'failed' : 'started'
      } as AppJournalEntry;
    }
    
    // For other entry types (simplified)
    return {
      ...baseEntry
    } as AppJournalEntry;
  });
}

/**
 * Creates a wrapped reducer function that handles state adapters automatically
 * 
 * @param reducer The original reducer function
 * @returns A wrapped reducer that applies adapters
 */
export const createTestReducer = <T extends Partial<GameState>>(
  reducer: (state: T, action: GameEngineAction) => T
) => {
  return (state: T, action: GameEngineAction): T => {
    // Ensure state is in the new format
    const normalizedState = migrationAdapter.oldToNew(state as unknown as GameState | LegacyState);
    
    // Apply the original reducer
    const newState = reducer(normalizedState as unknown as T, action);
    
    // Apply adapters for backward compatibility
    const adaptedState = adaptStateForTests(newState as unknown as GameState);
    
    // Return as the expected type
    return adaptedState as unknown as T;
  };
};

// Augment existing Jest types with ES2015 module syntax
declare global {
  export interface JestMatchers<R> {
    toHaveItems(count: number): R;
    toHaveJournalEntries(count: number): R;
    toHaveCombatActive(): R;
  }
}

/**
 * Helper function to create a mock state with properly typed getters
 * Similar to React's component factory pattern
 */
function createMockState(state: BaseMockState): GameState {
  // Define a function to create getters properly
  const createGetters = (baseState: BaseMockState) => {
    // Since we can't add this parameters to getters, we'll use a reference variable
    // to maintain type safety while still benefiting from TypeScript's checking
    const self = baseState;
    
    return {
      get player() { 
        return self.character.player; 
      },
      get isCombatActive() { 
        return self.combat.isActive; 
      }
    };
  };
  
  // Create the complete state with getters
  const completeState = {
    ...state,
    ...createGetters(state)
  };
  
  // Finally, adapt the state for testing
  return prepareStateForTesting(completeState as unknown as GameState);
}

/**
 * Creates mock state objects for various test scenarios
 */
export const mockStates = {
  /**
   * Basic initial state with adapters applied
   */
  basic: () => createMockState({
    character: {
      player: null,
      opponent: null
    },
    inventory: {
      items: []
    },
    journal: {
      entries: []
    },
    combat: {
      isActive: false,
      rounds: 0,
      playerTurn: true,
      playerCharacterId: '',
      opponentCharacterId: '',
      combatLog: [],
      roundStartTime: 0,
      modifiers: { player: 0, opponent: 0 },
      currentTurn: null,
      combatType: 'brawling',
      winner: null,
      participants: []
    },
    narrative: {
      currentStoryPoint: null,
      visitedPoints: [],
      availableChoices: [],
      narrativeHistory: [],
      displayMode: 'standard',
      error: null,
      narrativeContext: {
        worldContext: '',
        characterFocus: [],
        themes: [],
        importantEvents: [],
        storyPoints: {},
        narrativeArcs: {},
        impactState: {
          reputationImpacts: {},
          relationshipImpacts: {},
          worldStateImpacts: {},
          storyArcImpacts: {},
          lastUpdated: 0
        },
        narrativeBranches: {},
        pendingDecisions: [],
        decisionHistory: []
      }
    },
    ui: {
      isLoading: false,
      modalOpen: null,
      notifications: []
    },
    currentPlayer: '',
    npcs: [],
    location: null,
    quests: [],
    gameProgress: 0,
    suggestedActions: []
  }),
  
  /**
   * Mock state with player character
   */
  withCharacter: () => createMockState({
    character: {
      player: {
        id: 'player1',
        name: 'Test Character',
        attributes: {
          speed: 5,
          gunAccuracy: 6,
          throwingAccuracy: 4,
          strength: 7,
          baseStrength: 7,
          bravery: 5,
          experience: 3
        },
        minAttributes: {
          speed: 1,
          gunAccuracy: 1,
          throwingAccuracy: 1,
          strength: 1,
          baseStrength: 1,
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
          experience: 10
        },
        wounds: [],
        isUnconscious: false,
        inventory: { items: [] },
        isNPC: false,
        isPlayer: true
      },
      opponent: null
    },
    currentPlayer: 'player1',
    npcs: [],
    location: null,
    quests: [],
    gameProgress: 0,
    suggestedActions: [],
    inventory: { items: [] },
    journal: { entries: [] },
    combat: {
      isActive: false,
      rounds: 0,
      playerTurn: true,
      playerCharacterId: '',
      opponentCharacterId: '',
      combatLog: [],
      roundStartTime: 0,
      modifiers: { player: 0, opponent: 0 },
      currentTurn: null,
      combatType: 'brawling',
      winner: null,
      participants: []
    },
    narrative: {
      currentStoryPoint: null,
      visitedPoints: [],
      availableChoices: [],
      narrativeHistory: [],
      displayMode: 'standard',
      error: null
    },
    ui: {
      isLoading: false,
      modalOpen: null,
      notifications: []
    }
  }),
  
  /**
   * Mock state with active combat
   */
  withCombat: () => createMockState({
    character: {
      player: {
        id: 'player1',
        name: 'Test Character',
        attributes: { 
          speed: 10,
          gunAccuracy: 10,
          throwingAccuracy: 10,
          strength: 7,
          baseStrength: 7,
          bravery: 10,
          experience: 5
        },
        minAttributes: {
          speed: 1,
          gunAccuracy: 1,
          throwingAccuracy: 1,
          strength: 1,
          baseStrength: 1,
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
          experience: 10
        },
        wounds: [],
        isUnconscious: false,
        inventory: { items: [] },
        isNPC: false,
        isPlayer: true
      },
      opponent: {
        id: 'opponent1',
        name: 'Test Opponent',
        attributes: {
          speed: 10,
          gunAccuracy: 10,
          throwingAccuracy: 10,
          strength: 6,
          baseStrength: 6,
          bravery: 10,
          experience: 5
        },
        minAttributes: {
          speed: 1,
          gunAccuracy: 1,
          throwingAccuracy: 1,
          strength: 1,
          baseStrength: 1,
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
          experience: 10
        },
        wounds: [],
        isUnconscious: false,
        inventory: { items: [] },
        isNPC: true,
        isPlayer: false
      }
    },
    combat: {
      isActive: true,
      rounds: 1,
      playerTurn: true,
      combatType: 'brawling',
      playerCharacterId: 'player1',
      opponentCharacterId: 'opponent1',
      combatLog: [],
      roundStartTime: Date.now(),
      modifiers: {
        player: 0,
        opponent: 0
      },
      currentTurn: 'player',
      winner: null,
      participants: []
    },
    currentPlayer: 'player1',
    npcs: ['opponent1'],
    location: null,
    quests: [],
    gameProgress: 0,
    suggestedActions: [],
    inventory: { items: [] },
    journal: { entries: [] },
    narrative: {
      currentStoryPoint: null,
      visitedPoints: [],
      availableChoices: [],
      narrativeHistory: [],
      displayMode: 'standard',
      error: null
    },
    ui: {
      isLoading: false,
      modalOpen: null,
      notifications: []
    }
  }),
  
  /**
   * Mock state with inventory items
   */
  withInventory: () => createMockState({
    inventory: {
      items: [
        { id: 'item1', name: 'Revolver', category: 'weapon', description: 'A 6-shooter', quantity: 1 },
        { id: 'item2', name: 'Bandage', category: 'medical', description: 'Heals wounds', quantity: 3 },
        { id: 'item3', name: 'Canteen', category: 'consumable', description: 'Contains water', quantity: 1 }
      ]
    },
    character: {
      player: null,
      opponent: null
    },
    combat: {
      isActive: false,
      rounds: 0,
      playerTurn: true,
      playerCharacterId: '',
      opponentCharacterId: '',
      combatLog: [],
      roundStartTime: 0,
      modifiers: { player: 0, opponent: 0 },
      currentTurn: null,
      combatType: 'brawling',
      winner: null,
      participants: []
    },
    journal: { entries: [] },
    narrative: {
      currentStoryPoint: null,
      visitedPoints: [],
      availableChoices: [],
      narrativeHistory: [],
      displayMode: 'standard',
      error: null
    },
    ui: {
      isLoading: false,
      modalOpen: null,
      notifications: []
    },
    currentPlayer: '',
    npcs: [],
    location: null,
    quests: [],
    gameProgress: 0,
    suggestedActions: []
  }),
  
  /**
   * Mock state with journal entries
   */
  withJournal: () => createMockState({
    journal: {
      entries: [
        { 
          content: 'Test content 1', 
          timestamp: 1615000000000, 
          type: 'narrative'
        },
        { 
          content: 'Test content 2', 
          timestamp: 1615100000000, 
          type: 'quest',
          questTitle: 'Test Quest',
          status: 'started'
        }
      ] as AppJournalEntry[]
    },
    character: {
      player: null,
      opponent: null
    },
    combat: {
      isActive: false,
      rounds: 0,
      playerTurn: true,
      playerCharacterId: '',
      opponentCharacterId: '',
      combatLog: [],
      roundStartTime: 0,
      modifiers: { player: 0, opponent: 0 },
      currentTurn: null,
      combatType: 'brawling',
      winner: null,
      participants: []
    },
    inventory: { items: [] },
    narrative: {
      currentStoryPoint: null,
      visitedPoints: [],
      availableChoices: [],
      narrativeHistory: [],
      displayMode: 'standard',
      error: null
    },
    ui: {
      isLoading: false,
      modalOpen: null,
      notifications: []
    },
    currentPlayer: '',
    npcs: [],
    location: null,
    quests: [],
    gameProgress: 0,
    suggestedActions: []
  }),
  
  /**
   * Mock state with narrative context
   */
  withNarrative: () => createMockState({
    narrative: {
      narrativeContext: {
        worldContext: 'Saloon, Evening, Tense',
        characterFocus: ['player', 'sheriff'],
        themes: ['revenge', 'justice'],
        importantEvents: ['Bank robbery'],
        storyPoints: {},
        narrativeArcs: {},
        impactState: {
          reputationImpacts: {},
          relationshipImpacts: {},
          worldStateImpacts: {},
          storyArcImpacts: {},
          lastUpdated: Date.now()
        },
        narrativeBranches: {},
        pendingDecisions: [],
        decisionHistory: []
      },
      currentStoryPoint: {
        id: 'confrontation',
        title: 'Confrontation',
        content: 'A tense standoff',
        choices: [],
        type: 'action' as StoryPointType
      },
      visitedPoints: [],
      availableChoices: [],
      narrativeHistory: [
        { id: 'dialogue1', speaker: 'NPC', text: 'Hello stranger', timestamp: 1615000000000 }
      ],
      displayMode: 'standard',
      error: null
    },
    character: {
      player: null,
      opponent: null
    },
    combat: {
      isActive: false,
      rounds: 0,
      playerTurn: true,
      playerCharacterId: '',
      opponentCharacterId: '',
      combatLog: [],
      roundStartTime: 0,
      modifiers: { player: 0, opponent: 0 },
      currentTurn: null, 
      combatType: 'brawling',
      winner: null,
      participants: []
    },
    inventory: { items: [] },
    journal: { entries: [] },
    ui: {
      isLoading: false,
      modalOpen: null,
      notifications: []
    },
    currentPlayer: '',
    npcs: [],
    location: null,
    quests: [],
    gameProgress: 0,
    suggestedActions: []
  })
};

/**
 * Add to Jest's expect matchers for more readable tests
 */
expect.extend({
  toHaveItems(state: Partial<GameState>, count: number) {
    const inventory = state.inventory as InventoryState;
    const itemCount = inventory?.items?.length || 0;
    
    return {
      message: () => `expected state to have ${count} items, but it has ${itemCount}`,
      pass: itemCount === count
    };
  },
  
  toHaveJournalEntries(state: Partial<GameState>, count: number) {
    const legacyState = state as unknown as { entries?: AppJournalEntry[] };
    const entryCount = legacyState.entries?.length || state.journal?.entries?.length || 0;
    
    return {
      message: () => `expected state to have ${count} journal entries, but it has ${entryCount}`,
      pass: entryCount === count
    };
  },
  
  toHaveCombatActive(state: Partial<GameState>) {
    const isCombatActive = state.combat?.isActive || (state as unknown as { isCombatActive?: boolean }).isCombatActive;
    
    return {
      message: () => `expected state to have combat active, but it was ${isCombatActive ? 'active' : 'inactive'}`,
      pass: Boolean(isCombatActive)
    };
  }
});
