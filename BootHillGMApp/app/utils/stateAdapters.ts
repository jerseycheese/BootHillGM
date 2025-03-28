import { GameState } from '../types/gameState';
import { InventoryItem } from '../types/item.types';
import { initialState as initialGameState } from '../types/initialState';
import { JournalEntry } from '../types/journal';
import { NarrativeState } from '../types/state/narrativeState';
import { CombatType } from '../types/combat';
import { NarrativeContext } from '../types/narrative/context.types';
import { Notification } from '../types/state/uiState';
import { ensureNPCsArray } from './gameReducerHelpers';

/**
 * State types index file
 * Exports all state adapter types and utility functions
 */

// Define a type for the legacy state format
export interface LegacyState {
  [key: string]: unknown;
  player?: unknown;
  opponent?: unknown;
  inventory?: unknown[] | { items?: unknown[] };
  journal?: unknown[] | { entries?: unknown[] };
  entries?: unknown[];
  isCombatActive?: boolean;
  narrativeContext?: unknown;
  currentScene?: unknown;
  dialogues?: unknown[];
  activeTab?: string;
  isMenuOpen?: boolean;
  notifications?: unknown[];
  combatRounds?: number;
  currentTurn?: unknown;
  npcs?: unknown[];
  [key: number]: unknown;
}

// Extended NarrativeState for compatibility with legacy code
interface ExtendedNarrativeState extends NarrativeState {
  context?: NarrativeContext;
  currentScene?: string;
  dialogues?: unknown[];
}

// Extended UIState for compatibility with legacy code
interface ExtendedUIState {
  isLoading: boolean;
  modalOpen: string | null;
  notifications: Notification[];
  activeTab?: string;
  isMenuOpen?: boolean;
}

// Type guard to check if an object has fields that suggest it's in new format
const isNewFormatState = (state: unknown): boolean => {
  if (!state || typeof state !== 'object') return false;
  
  const stateObj = state as Record<string, unknown>;
  
  // Check for mandatory slice properties
  return Boolean(
    stateObj.character && 
    stateObj.inventory && 
    stateObj.journal && 
    stateObj.combat
  );
};

/**
 * Character State Adapter
 * 
 * Maps the new character slice structure back to the original format
 * expected by legacy components and tests.
 */
export const characterAdapter = {
  // Getter to adapt new state to old state shape
  getPlayer: (state: GameState) => {
    return state?.character?.player || null;
  },
  
  // Getter to adapt new state to old state shape
  getOpponent: (state: GameState) => {
    return state?.character?.opponent || null;
  },
  
  // Adapter method to handle the state structure difference in tests
  adaptForTests: (state: GameState) => {
    if (!state) return state;
    
    // Cast to a type that includes legacy properties
    const legacyState = state as unknown as LegacyState;
    
    // Only create a new state if we need to add legacy properties
    if (legacyState.player !== undefined && legacyState.opponent !== undefined) {
      // Legacy properties already exist, no need to add them
      return state;
    }
    
    // Use property descriptors for dynamic computed properties
    return Object.defineProperties(
      // Shallow copy of the state
      { ...state },
      {
        // Define getters for legacy properties that compute values on demand
        player: {
          get: () => state.character?.player || null,
          enumerable: true,
          configurable: true
        },
        opponent: {
          get: () => state.character?.opponent || null,
          enumerable: true,
          configurable: true
        }
      }
    );
  }
};

/**
 * Inventory State Adapter
 *
 * Makes the inventory slice behave like an array by proxying array methods to the items array.
 */
export const inventoryAdapter = {
  // Getter to adapt new state to old state shape
  getItems: (state: GameState) => {
    // Handle both new InventoryState and legacy array formats
    if (state?.inventory) {
      if ('items' in state.inventory && Array.isArray(state.inventory.items)) {
        return state.inventory.items || [];
      } else if (Array.isArray(state.inventory)) {
        return state.inventory;
      }
    }
    return [];
  },
  
  // Add array methods to the inventory state for backward compatibility
  adaptForTests: (state: GameState) => {
    if (!state) return state;

    // Get items from either format
    const inventoryItems = state.inventory?.items ||
                          (Array.isArray(state.inventory) ? state.inventory : []);
    
    // Create an array-like object that can be used in tests
    const adaptedInventory = {
      ...state.inventory,
      items: inventoryItems,
      
      // Add lazy-bound array methods
      get find() {
        return <T>(fn: (item: InventoryItem) => boolean): T | undefined =>
          inventoryItems.find((item) => fn(item as InventoryItem)) as T | undefined;
      },
      
      get filter() {
        return (fn: (item: InventoryItem) => boolean): unknown[] =>
          inventoryItems.filter((item) => fn(item as InventoryItem));
      },
      
      get some() {
        return (fn: (item: InventoryItem) => boolean): boolean =>
          inventoryItems.some((item) => fn(item as InventoryItem));
      },
      
      get map() {
        return <T>(fn: (item: InventoryItem) => T): T[] =>
          inventoryItems.map((item) => fn(item as InventoryItem));
      },
      
      get forEach() {
        return (fn: (item: InventoryItem) => void): void =>
          inventoryItems.forEach((item) => fn(item as InventoryItem));
      },
      
      get reduce() {
        return <T>(fn: (acc: T, item: InventoryItem) => T, initial: T): T =>
          inventoryItems.reduce((acc, item) => fn(acc, item as InventoryItem), initial);
      },
      
      // For length property access
      get length() {
        return inventoryItems.length;
      },
      
      // Include array iterator for spread operators
      get [Symbol.iterator]() {
        return function* () {
          for (let i = 0; i < inventoryItems.length; i++) {
            yield inventoryItems[i];
          }
        };
      }
    };
    
    // Create a proxy for numeric index access
    const inventoryProxy = new Proxy(adaptedInventory, {
      get(target, prop) {
        // Handle numeric indices
        if (typeof prop === 'string' && !isNaN(Number(prop))) {
          return inventoryItems[Number(prop)];
        }
        
        // Forward other properties to the adapted inventory
        return target[prop as keyof typeof target];
      }
    });
    
    return {
      ...state,
      inventory: inventoryProxy
    };
  }
};

/**
 * Journal State Adapter
 *
 * Makes the journal entries accessible in the old format.
 */
export const journalAdapter = {
  // Getter to adapt new state to old state shape
  getEntries: (state: GameState): JournalEntry[] => {
    // For safety, type guard all our checks
    if (!state) return [];
    
    // Check for journal entries in the new structure
    if (state.journal && 'entries' in state.journal && Array.isArray(state.journal.entries)) {
      return state.journal.entries as JournalEntry[];
    }
    
    // Check for entries at the root level
    const legacyState = state as unknown as LegacyState;
    if ('entries' in legacyState && Array.isArray(legacyState.entries)) {
      return legacyState.entries as JournalEntry[];
    }
    
    // Check for legacy array format
    if (Array.isArray(state.journal)) {
      return state.journal as JournalEntry[];
    }
    
    // Default to empty array
    return [];
  },
  
  // Adapter method to create a state object with proper entries
  adaptForTests: (state: GameState) => {
    if (!state) return state;
    
    // Directly get the entries without proxying
    const entries = journalAdapter.getEntries(state);
    
    // Create a new state with entries at both levels for compatibility
    return {
      ...state,
      // Add entries at root level for legacy access
      entries: entries,
      // Add entries in journal object for new structure
      journal: {
        ...state.journal,
        entries: entries
      }
    };
  }
};

/**
 * NPCs Adapter
 * 
 * Ensures NPCs array is properly formatted for tests
 */
export const npcsAdapter = {
  // Getter to adapt new state to old state shape
  getNPCs: (state: GameState): string[] => {
    if (!state || !state.npcs) return [];
    
    // Convert to string array - the state might have complex objects 
    // that were created during JSON serialization/deserialization
    return ensureNPCsArray(state.npcs);
  },
  
  // Adapter method to handle the state structure difference in tests
  adaptForTests: (state: GameState) => {
    if (!state) return state;
    
    // Convert NPCs to string array for test compatibility
    const npcsArray = npcsAdapter.getNPCs(state);
    
    return {
      ...state,
      npcs: npcsArray
    };
  }
};

/**
 * Narrative State Adapter
 *
 * Maps the narrative context to the root level for backward compatibility.
 */
export const narrativeAdapter = {
  // Getter to adapt new state to old state shape
  getNarrativeContext: (state: GameState) => {
    if (!state || !state.narrative) return null;
    
    // Cast to the extended narrative state with both old and new properties
    const narrative = state.narrative as ExtendedNarrativeState;
    
    // First check if the narrative has a "context" property (used in the tests)
    if (narrative.context) {
      return narrative.context;
    }
    
    // Then check for narrativeContext (used in the actual code)
    if (narrative.narrativeContext) {
      return narrative.narrativeContext;
    }
    
    return null;
  },
  
  // Adapter method to handle the state structure difference in tests
  adaptForTests: (state: GameState) => {
    if (!state) return state;
    
    // Cast to a type that includes legacy properties
    const legacyState = state as unknown as LegacyState;
    
    // Only create a new state if we need to add legacy properties
    if (legacyState.narrativeContext !== undefined &&
        legacyState.currentScene !== undefined &&
        legacyState.dialogues !== undefined) {
      // Legacy properties already exist, no need to add them
      return state;
    }
    
    // Create a sanitized narrative state that only includes expected properties
    // This helps with tests that compare against initialNarrativeState
    const narrativeState = state.narrative || {};
    
    // Cast to extended narrative state to access both old and new properties
    const extendedNarrative = narrativeState as ExtendedNarrativeState;

    // Create a shallow copy of the state
    const stateWithSanitizedNarrative = { ...state };
    
    // For test compatibility - add properties that are expected by tests
    // This allows us to normalize between tests that use "context" and code that uses "narrativeContext"
    return Object.defineProperties(
      stateWithSanitizedNarrative,
      {
        // Define getters for legacy properties that compute values on demand
        narrativeContext: {
          get: () => {
            // For test compatibility - try "context" first (used in tests)
            if (extendedNarrative.context) {
              return extendedNarrative.context;
            }
            // Then try narrativeContext (used in actual code)
            return extendedNarrative.narrativeContext || null;
          },
          enumerable: true,
          configurable: true
        },
        currentScene: {
          get: () => {
            if (extendedNarrative.currentScene) {
              return extendedNarrative.currentScene;
            }
            return extendedNarrative.selectedChoice || null;
          },
          enumerable: true,
          configurable: true
        },
        dialogues: {
          get: () => {
            if (extendedNarrative.dialogues) {
              return extendedNarrative.dialogues;
            }
            return [];
          },
          enumerable: true,
          configurable: true
        }
      }
    );
  }
};

/**
 * Combat State Adapter
 *
 * Adds isCombatActive flag at the root level for backward compatibility.
 */
export const combatAdapter = {
  // Getter to check if combat is active
  isCombatActive: (state: GameState) => {
    return state?.combat?.isActive || false;
  },
  
  // Adapter method to handle the state structure difference in tests
  adaptForTests: (state: GameState) => {
    if (!state) return state;
    
    // Cast to a type that includes legacy properties
    const legacyState = state as unknown as LegacyState;
    
    // Only create a new state if we need to add legacy properties
    if (legacyState.isCombatActive !== undefined &&
        legacyState.combatRounds !== undefined &&
        legacyState.currentTurn !== undefined) {
      // Legacy properties already exist, no need to add them
      return state;
    }
    
    // Use property descriptors for dynamic computed properties
    return Object.defineProperties(
      // Shallow copy of the state
      { ...state },
      {
        // Define getters for legacy properties that compute values on demand
        isCombatActive: {
          get: () => state.combat?.isActive || false,
          enumerable: true,
          configurable: true
        },
        combatRounds: {
          get: () => state.combat?.rounds || 0,
          enumerable: true,
          configurable: true
        },
        currentTurn: { // ADD LEGACY PROPERTY GETTER
          get: () => state.combat?.currentTurn || null,
          enumerable: true,
          configurable: true
        }
      }
    );
  }
};

/**
 * UI State Adapter
 *
 * Provides UI state properties at the root level for backward compatibility.
 */
export const uiAdapter = {
  adaptForTests: (state: GameState) => {
    if (!state) return state;
    
    // Cast to extended UI state to access both old and new properties
    const extendedUI = state.ui as ExtendedUIState;
    
    // Cast to a type that includes legacy properties
    const legacyState = state as unknown as LegacyState;
    
    // Only create a new state if we need to add legacy properties
    if (legacyState.activeTab !== undefined &&
        legacyState.isMenuOpen !== undefined &&
        legacyState.notifications !== undefined) {
      // Legacy properties already exist, no need to add them
      return state;
    }
    
    // Use property descriptors for dynamic computed properties
    return Object.defineProperties(
      // Shallow copy of the state
      { ...state },
      {
        // Define getters for legacy properties that compute values on demand
        activeTab: {
          get: () => extendedUI?.activeTab || 'character',
          enumerable: true,
          configurable: true
        },
        isMenuOpen: {
          get: () => extendedUI?.isMenuOpen || false,
          enumerable: true,
          configurable: true
        },
        notifications: {
          get: () => extendedUI?.notifications || [],
          enumerable: true,
          configurable: true
        }
      }
    );
  }
};

/**
 * Migration Adapter
 *
 * Handles state migration between old and new formats.
 * This is similar to how a React migration system works, transforming one data structure to another.
 */
export const migrationAdapter = {
  // Convert old state shape to new state shape
  oldToNew: (oldState: LegacyState | GameState) => {
    if (!oldState) return oldState;
    
    // If already in new format, return as is without modifications
    // This is crucial for the tests that expect no changes
    if (isNewFormatState(oldState)) {
      return oldState;
    }
    
    // Convert to LegacyState to access legacy properties
    const legacyState = oldState as LegacyState;
    
    // Create new narrative state structure with proper typing
    const narrativeState: Partial<ExtendedNarrativeState> = {};
    
    // Access narrative from oldState safely
    const oldNarrative = (oldState as {narrative?: Partial<ExtendedNarrativeState>}).narrative || {};
    
    if (oldState.narrative) {
      // If narrative exists, use it but ensure it has the correct structure
      Object.assign(narrativeState, {
        // Ensure essential properties exist
        currentStoryPoint: oldNarrative.currentStoryPoint || null,
        visitedPoints: oldNarrative.visitedPoints || [],
        availableChoices: oldNarrative.availableChoices || [],
        narrativeHistory: oldNarrative.narrativeHistory || [],
        displayMode: oldNarrative.displayMode || 'standard',
        error: oldNarrative.error || null,
      });
      
      // Support both formats used in tests vs. real code
      if ('context' in oldNarrative) {
        // For the tests that use "context"
        narrativeState.context = oldNarrative.context;
      } else if (legacyState.narrativeContext) {
        // For real code that uses "narrativeContext"
        narrativeState.narrativeContext = legacyState.narrativeContext as NarrativeContext;
      }
      
      // Handle legacy currentScene property by mapping it to selectedChoice
      if ('currentScene' in oldNarrative) {
        narrativeState.currentScene = oldNarrative.currentScene;
      } else if (legacyState.currentScene) {
        narrativeState.selectedChoice = String(legacyState.currentScene);
      }
      
      // Handle dialogues if present in either format
      if ('dialogues' in oldNarrative) {
        narrativeState.dialogues = oldNarrative.dialogues;
      } else if (legacyState.dialogues) {
        narrativeState.dialogues = legacyState.dialogues as unknown[];
      }
    } else {
      // If no narrative exists, use initialGameState.narrative 
      // but add any legacy properties if they exist
      Object.assign(narrativeState, initialGameState.narrative);
      
      // Support both formats used in tests vs. real code
      if (legacyState.narrativeContext) {
        // For tests that expect "context"
        narrativeState.context = legacyState.narrativeContext as NarrativeContext;
        // For code that uses "narrativeContext"
        narrativeState.narrativeContext = legacyState.narrativeContext as NarrativeContext;
      }
      
      if (legacyState.currentScene) {
        // For tests that expect "currentScene"
        narrativeState.currentScene = legacyState.currentScene as string;
        // For code that uses "selectedChoice"
        narrativeState.selectedChoice = String(legacyState.currentScene);
      }
      
      if (legacyState.dialogues) {
        narrativeState.dialogues = legacyState.dialogues as unknown[];
      }
    }
    
    // Ensure NPCs are properly converted to string array
    const npcsArray = ensureNPCsArray(legacyState.npcs);
    
    // Create a new state with the slice-based structure
    return {
      ...oldState, // Keep other properties
      character: {
        player: legacyState.player || null,
        opponent: legacyState.opponent || null
      },
      inventory: {
        items: Array.isArray(legacyState.inventory) ? legacyState.inventory :
               (legacyState.inventory as {items?: unknown[]})?.items || []
      },
      journal: {
        entries: Array.isArray(legacyState.journal) ? legacyState.journal :
                Array.isArray(legacyState.entries) ? legacyState.entries :
                (legacyState.journal as {entries?: unknown[]})?.entries || []
      },
      combat: {
        isActive: legacyState.isCombatActive || false,
        combatType: 'brawling' as CombatType,
        rounds: legacyState.combatRounds || 0,
        playerTurn: true,
        playerCharacterId: '',
        opponentCharacterId: '',
        combatLog: [],
        roundStartTime: 0,
        modifiers: { player: 0, opponent: 0 },
        currentTurn: legacyState.currentTurn || null
      },
      narrative: narrativeState as NarrativeState,
      ui: {
        isLoading: false,
        modalOpen: null,
        notifications: legacyState.notifications || []
      },
      npcs: npcsArray,
    };
  },
  
  // Convert new state shape to old state shape
  newToOld: (newState: GameState) => {
    if (!newState) return newState;
    
    // Cast to extended narrative state to access both old and new properties
    const extendedNarrative = newState.narrative as ExtendedNarrativeState;
    
    // For test compatibility - look at the correct property names
    // Some tests use "context" while the actual code uses "narrativeContext"
    const narrativeContext = 
      extendedNarrative?.context || 
      extendedNarrative?.narrativeContext;
    
    const currentScene = 
      extendedNarrative?.currentScene || 
      extendedNarrative?.selectedChoice;
    
    const dialogues = 
      extendedNarrative?.dialogues || 
      [];
    
    // Convert NPCs to string array for backward compatibility
    const npcsArray = ensureNPCsArray(newState.npcs);
    
    return {
      // Root level properties expected by legacy code
      player: newState.character?.player || null,
      opponent: newState.character?.opponent || null,
      inventory: newState.inventory?.items || [],
      journal: newState.journal?.entries || [],
      entries: newState.journal?.entries || [],
      isCombatActive: newState.combat?.isActive || false,
      narrativeContext: narrativeContext || null,
      combatRounds: newState.combat?.rounds || 0,
      currentTurn: newState.combat?.currentTurn || null,
      currentScene: currentScene || null,
      dialogues: dialogues || [],
      activeTab: (newState.ui as ExtendedUIState)?.activeTab || 'character',
      isMenuOpen: (newState.ui as ExtendedUIState)?.isMenuOpen || false,
      notifications: newState.ui?.notifications || [],
      npcs: npcsArray,
      
      // Keep references to new state structure for transitional components
      character: newState.character,
      combat: newState.combat,
      narrative: newState.narrative,
      ui: newState.ui
    };
  }
};

/**
 * Master Adapter
 *
 * Combines all adapters to provide a single function that adapts
 * the entire state for backward compatibility with tests and legacy components.
 * This is similar to how React uses Higher-Order Components to transform props or state.
 */
export const adaptStateForTests = (state: GameState): GameState => {
  if (!state) return state;
  
  // Apply all adapters in sequence
  let adaptedState = state;
  adaptedState = characterAdapter.adaptForTests(adaptedState);
  adaptedState = inventoryAdapter.adaptForTests(adaptedState); 
  adaptedState = journalAdapter.adaptForTests(adaptedState);
  adaptedState = narrativeAdapter.adaptForTests(adaptedState);
  adaptedState = combatAdapter.adaptForTests(adaptedState);
  adaptedState = uiAdapter.adaptForTests(adaptedState);
  adaptedState = npcsAdapter.adaptForTests(adaptedState);

  return adaptedState;
};

/**
 * Legacy Getters Object
 * 
 * A collection of getters that can be used by legacy components
 * to access the new state structure without modifying component code.
 */
export const legacyGetters = {
  getPlayer: characterAdapter.getPlayer,
  getOpponent: characterAdapter.getOpponent,
  getItems: inventoryAdapter.getItems,
  getEntries: journalAdapter.getEntries,
  getNarrativeContext: narrativeAdapter.getNarrativeContext,
  isCombatActive: combatAdapter.isCombatActive,
  getNPCs: npcsAdapter.getNPCs
};