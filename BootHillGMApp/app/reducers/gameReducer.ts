/**
 * Game Reducer
 * 
 * Root reducer that combines all domain-specific reducers
 * to create a unified game state system.
 */

import { GameState, initialGameState } from '../types/gameState';
import { GameAction, CharacterAction } from '../types/actions';
import { Character } from '../types/character';
import { UpdateCharacterPayload } from '../types/actions/characterActions';
import { ActionTypes } from '../types/actionTypes';
import { persistState, loadPersistedState } from '../utils/stateProtection';
import { InventoryItem } from '../types/item.types';
import { CharacterState } from '../types/state/characterState';
import { SuggestedAction } from '../types/campaign';
import { CombatLogEntry } from '../types/state/combatState';
import { NarrativeState } from '../types/state';
import { LocationType } from '../services/locationService';
import { JournalEntry, NarrativeJournalEntry } from '../types/journal';
import { NarrativeContext } from '../types/narrative/context.types';

// --- Helper Function Definitions ---

/**
 * Map legacy string action types to ActionTypes constants
 * Maintains backward compatibility
 */
function mapLegacyActionType(type: string): string {
  // Map legacy action types to new constants
  switch (type) {
    // Game actions
    case 'SET_PLAYER': return ActionTypes.SET_PLAYER;
    case 'SET_CHARACTER': return ActionTypes.SET_CHARACTER;
    case 'SET_LOCATION': return ActionTypes.SET_LOCATION;
    case 'SET_NARRATIVE': return ActionTypes.ADD_NARRATIVE_HISTORY;
    case 'SET_GAME_PROGRESS': return ActionTypes.SET_GAME_PROGRESS;
    case 'UPDATE_JOURNAL': return ActionTypes.UPDATE_JOURNAL_GENERAL;
    case 'SET_COMBAT_ACTIVE': return ActionTypes.SET_COMBAT_ACTIVE;
    case 'SET_OPPONENT': return ActionTypes.SET_OPPONENT;
    case 'ADD_ITEM': return ActionTypes.ADD_ITEM;
    case 'REMOVE_ITEM': return ActionTypes.REMOVE_ITEM;
    case 'USE_ITEM': return ActionTypes.USE_ITEM;
    case 'UPDATE_ITEM_QUANTITY': return ActionTypes.UPDATE_ITEM_QUANTITY;
    case 'CLEAN_INVENTORY': return ActionTypes.CLEAN_INVENTORY;
    case 'SET_INVENTORY': return ActionTypes.SET_INVENTORY;
    case 'END_COMBAT': return ActionTypes.END_COMBAT;
    
    default:
      return type; // If not a legacy type, return as is
  }
}

// Process character-related actions
const processCharacterAction = (state: GameState, action: CharacterAction): GameState => {
  // Handle null character state
  if (state.character === null) {
    // Initialize character state if null
    const defaultCharacterState: CharacterState = {
      player: null,
      opponent: null
    };
    state = { ...state, character: defaultCharacterState };
  }

  switch (action.type) {
    case ActionTypes.SET_CHARACTER: {
      // Create an exact CharacterState object with no optional properties
      return {
        ...state,
        character: {
          player: action.payload as Character | null,
          opponent: state.character ? state.character.opponent : null
        }
      };
    }
      
    case ActionTypes.SET_OPPONENT: {
      // Create an exact CharacterState object with no optional properties
      return {
        ...state,
        character: {
          player: state.character ? state.character.player : null,
          opponent: action.payload as Character | null
        }
      };
    }
      
    case ActionTypes.UPDATE_CHARACTER:
      if (!state.character || !state.character.player) return state;
      return {
        ...state,
        character: {
          ...state.character,
          player: {
            ...state.character.player,
            ...(action.payload as Partial<Character>)
          }
        }
      };
      
    case ActionTypes.UPDATE_OPPONENT: {
      if (!state.character || !state.character.opponent) return state;
      
      const payload = action.payload as UpdateCharacterPayload;
      const currentOpponent = state.character.opponent;

      // Safely merge attributes, only updating those present in the payload
      const updatedAttributes = {
        ...currentOpponent.attributes,
        ...(payload.attributes || {}) // Spread payload attributes only if they exist
      };

      // Ensure all required attributes have values after merge (though TS might still complain if payload is truly partial)
      // This assumes the base opponent state is valid. A more robust check might be needed
      // if the initial opponent state could also be invalid.

      return {
        ...state,
        character: {
          ...state.character,
          opponent: {
            ...currentOpponent, // Spread the existing opponent
            ...payload, // Spread other payload properties (id, wounds, etc.)
            attributes: updatedAttributes // Apply the safely merged attributes
          } as Character // Assert as Character, assuming merge logic is sound
        }
      };
    }
      
    default:
      return state;
  }
};

// Process combat-related actions
const processCombatAction = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case ActionTypes.SET_COMBAT_ACTIVE:
      return {
        ...state,
        combat: {
          ...state.combat,
          isActive: action.payload !== undefined ? action.payload : false
        }
      };
      
    case ActionTypes.END_COMBAT:
      return {
        ...state,
        combat: {
          ...state.combat,
          isActive: false,
          rounds: 0,
          playerTurn: true,
          combatLog: [...(state.combat.combatLog || []), { text: 'Combat ended', timestamp: Date.now(), type: 'info' }]
        },
        character: state.character === null ? {
          player: null,
          opponent: null
        } : {
          ...state.character,
          opponent: null // Remove opponent when combat ends
        }
      };
      
    case ActionTypes.ADD_LOG_ENTRY:
      // Assert payload type based on the action interface
      return {
        ...state,
        combat: {
          ...state.combat,
          combatLog: [...(state.combat.combatLog || []), action.payload as CombatLogEntry]
        }
      };
      
    case ActionTypes.NEXT_ROUND:
      return {
        ...state,
        combat: {
          ...state.combat,
          rounds: state.combat.rounds + 1,
          roundStartTime: Date.now()
        }
      };
      
    case ActionTypes.TOGGLE_TURN:
      return {
        ...state,
        combat: {
          ...state.combat,
          playerTurn: !state.combat.playerTurn
        }
      };
      
    default:
      return state;
  }
};

// Process inventory-related actions
const processInventoryAction = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case ActionTypes.ADD_ITEM: {
      // Assert payload type based on the action interface
      const newItem = action.payload as InventoryItem;
      // Check if item already exists to update quantity
      const existingItemIndex = state.inventory.items.findIndex(item => item.id === newItem.id);

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const updatedItems = [...state.inventory.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + newItem.quantity
        };

        return {
          ...state,
          inventory: {
            ...state.inventory,
            items: updatedItems
          }
        };
      } else {
        // Add new item
        return {
          ...state,
          inventory: {
            ...state.inventory,
            items: [...state.inventory.items, newItem]
          }
        };
      }
    }
      
    case ActionTypes.REMOVE_ITEM:
      return {
        ...state,
        inventory: {
          ...state.inventory,
          items: state.inventory.items.filter(item => item.id !== action.payload)
        }
      };
      
    case ActionTypes.USE_ITEM: {
      const useItemId = action.payload;
      const useItemIndex = state.inventory.items.findIndex(item => item.id === useItemId);
      
      if (useItemIndex >= 0) {
        const updatedItems = [...state.inventory.items];
        const currentQuantity = updatedItems[useItemIndex].quantity;
        
        if (currentQuantity <= 1) {
          // Remove item if quantity will be 0
          updatedItems.splice(useItemIndex, 1);
        } else {
          // Decrease quantity
          updatedItems[useItemIndex] = {
            ...updatedItems[useItemIndex],
            quantity: currentQuantity - 1
          };
        }
        
        return {
          ...state,
          inventory: {
            ...state.inventory,
            items: updatedItems
          }
        };
      }
      return state;
    }
      
    case ActionTypes.UPDATE_ITEM_QUANTITY: {
      // Handle both payload formats for backward compatibility
      let itemId: string;
      let quantity: number;
      
      if (typeof action.payload === 'object' && action.payload !== null) {
        if ('itemId' in action.payload && 'quantity' in action.payload) {
          // New format: { itemId: string, quantity: number }
          itemId = action.payload.itemId as string;
          quantity = action.payload.quantity as number;
        } else if ('id' in action.payload && 'quantity' in action.payload) {
          // Alternate format: { id: string, quantity: number }
          itemId = action.payload.id as string;
          quantity = action.payload.quantity as number;
        } else {
          // Invalid payload format
          return state;
        }
      } else {
        // Invalid payload type
        return state;
      }
      
      // Find the item to update
      const itemToUpdateIndex = state.inventory.items.findIndex(item => item.id === itemId);
      
      if (itemToUpdateIndex >= 0) {
        const updatedItems = [...state.inventory.items];
        
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          updatedItems.splice(itemToUpdateIndex, 1);
        } else {
          // Set to specified quantity
          updatedItems[itemToUpdateIndex] = {
            ...updatedItems[itemToUpdateIndex],
            quantity
          };
        }
        
        return {
          ...state,
          inventory: {
            ...state.inventory,
            items: updatedItems
          }
        };
      }
      return state;
    }
      
    case ActionTypes.CLEAN_INVENTORY:
      return {
        ...state,
        inventory: {
          ...state.inventory,
          items: state.inventory.items.filter(item => item.quantity > 0)
        }
      };
      
    case ActionTypes.SET_INVENTORY: {
      // Assert payload type based on the action interface
      const items = action.payload as InventoryItem[];

      return {
        ...state,
        inventory: {
          ...state.inventory,
          items: Array.isArray(items) ? items : [] // Ensure it's an array after casting
        }
      };
    }
      
    default:
      return state;
  }
};

// Process journal-related actions
const processJournalAction = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case ActionTypes.ADD_ENTRY: {
      const entry = action.payload as JournalEntry;
      return {
        ...state,
        journal: {
          ...state.journal,
          entries: [...state.journal.entries, entry]
        }
      };
    }
      
    case ActionTypes.REMOVE_ENTRY:
      return {
        ...state,
        journal: {
          ...state.journal,
          entries: state.journal.entries.filter(entry => entry.id !== action.payload)
        }
      };
      
    case ActionTypes.UPDATE_JOURNAL_GENERAL: {
      // Handle different payload formats
      let text = '';
      let summary = 'A new adventure begins';
      
      if (typeof action.payload === 'string') {
        text = action.payload;
      } else if (action.payload && typeof action.payload === 'object') {
        const p = action.payload as Record<string, unknown>;
        text = typeof p.text === 'string' ? p.text : 
               typeof p.content === 'string' ? p.content : '';
        summary = typeof p.summary === 'string' ? p.summary : summary;
      }
      
      // Add a new entry with the provided content
      const timestamp = Date.now();
      const newEntry: NarrativeJournalEntry = {
        id: `entry_${timestamp}`,
        title: 'Untitled Entry',
        content: text,
        timestamp,
        type: 'narrative',
        narrativeSummary: summary
      };
      
      return {
        ...state,
        journal: {
          ...state.journal,
          entries: [...state.journal.entries, newEntry]
        }
      };
    }
      
    case ActionTypes.CLEAR_ENTRIES:
      return {
        ...state,
        journal: {
          ...state.journal,
          entries: []
        }
      };
      
    default:
      return state;
  }
};

// Process narrative-related actions
const processNarrativeAction = (state: GameState, action: GameAction): GameState => {
  // Ensure narrative state exists
  const narrativeState = state.narrative || initialGameState.narrative;
  
  // Ensure narrativeContext exists within narrative state
  const narrativeContext = narrativeState.narrativeContext || initialGameState.narrative.narrativeContext;
  
  switch (action.type) {
    case ActionTypes.ADD_NARRATIVE_HISTORY: {
      // Ensure payload is a string
      const content = typeof action.payload === 'string' ? action.payload : '';
      // const timestamp = Date.now(); // Timestamp not stored in history anymore
      // const newHistoryEntry = { content, timestamp }; // History is just string[]
      
      return {
        ...state,
        narrative: {
          ...narrativeState,
          // Fix: Add content string, not the object
          narrativeHistory: [...narrativeState.narrativeHistory, content] 
        }
      };
    }
      
    case ActionTypes.SET_NARRATIVE_CONTEXT: {
      // Ensure payload is a valid NarrativeContext object
      const newContext = typeof action.payload === 'object' && action.payload !== null 
                         ? action.payload as NarrativeContext 
                         : narrativeContext; // Fallback to existing or initial context
      return {
        ...state,
        narrative: {
          ...narrativeState,
          narrativeContext: newContext
        }
      };
    }
      
    case ActionTypes.UPDATE_NARRATIVE: {
      // Ensure payload is an object, cast action type if necessary
      // Assert payload type based on the action interface (assuming it's Partial<NarrativeState>)
      const updatePayload = typeof (action as GameAction).payload === 'object' && (action as GameAction).payload !== null
                            ? (action as GameAction).payload as Partial<NarrativeState>
                            : {};
      return {
        ...state,
        narrative: {
          ...narrativeState,
          ...updatePayload // Merge updates into narrative state
        }
      };
    }
      
    default:
      return state;
  }
};

// Process game-specific actions
const processGameAction = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case ActionTypes.SET_PLAYER: {
      // Fix: Set currentPlayer directly to the payload string
      const playerName = typeof action.payload === 'string' ? action.payload : '';
      return { 
        ...state, 
        currentPlayer: playerName
      };
    }
      
    case ActionTypes.SET_LOCATION:
      // Assert payload type
      return { ...state, location: action.payload as LocationType | null };

    case ActionTypes.SET_GAME_PROGRESS:
      // Assert payload type
      return { ...state, gameProgress: action.payload as number };
      
    case ActionTypes.SET_SAVED_TIMESTAMP: {
      const timestamp = typeof action.payload === 'number' ? action.payload : Date.now();
      return {
        ...state,
        meta: { ...(state.meta || {}), savedAt: timestamp }
      };
    }
      
    case ActionTypes.SET_SUGGESTED_ACTIONS: {
      // Ensure payload is an array of SuggestedAction
      const suggestedActions = Array.isArray(action.payload) 
                               ? action.payload as SuggestedAction[] 
                               : [];
      return { ...state, suggestedActions };
    }
      
    default:
      return state;
  }
};

// Placeholder implementations for other domain reducers - Fixed to remove unused action parameter
const processLoreAction = (state: GameState): GameState => {
  // This would handle all lore-related actions
  return state;
};

const processUIAction = (state: GameState): GameState => {
  // This would handle all UI-related actions
  return state;
};

const processErrorAction = (state: GameState): GameState => {
  // This would handle all error-related actions
  return state;
};

const processDecisionAction = (state: GameState): GameState => {
  // This would handle all decision-related actions
  return state;
};

const processStoryAction = (state: GameState): GameState => {
  // This would handle all story progression actions
  return state;
};

/**
 * Process action through domain-specific reducers
 * 
 * @param state Current game state
 * @param action Action to process
 * @returns Updated game state
 */
function processDomainReducers(state: GameState, action: GameAction): GameState {
  // Create new state object to avoid mutation
  let newState = { ...state };
  
  // Character state updates
  if (action.type.startsWith('character/')) {
    newState = processCharacterAction(newState, action as CharacterAction);
  }
  
  // Combat state updates
  if (action.type.startsWith('combat/')) {
    newState = processCombatAction(newState, action);
  }
  
  // Inventory state updates
  if (action.type.startsWith('inventory/')) {
    newState = processInventoryAction(newState, action);
  }
  
  // Journal state updates
  if (action.type.startsWith('journal/')) {
    newState = processJournalAction(newState, action);
  }
  
  // Narrative state updates
  if (action.type.startsWith('narrative/')) {
    newState = processNarrativeAction(newState, action);
  }
  
  // Game-specific state updates
  if (action.type.startsWith('game/')) {
    newState = processGameAction(newState, action);
  }
  
  // Lore state updates
  if (action.type.startsWith('lore/')) {
    newState = processLoreAction(newState);
  }
  
  // UI state updates
  if (action.type.startsWith('ui/')) {
    newState = processUIAction(newState);
  }
  
  // Error state updates
  if (action.type.startsWith('error/')) {
    newState = processErrorAction(newState);
  }
  
  // Decision state updates
  if (action.type.startsWith('decision/')) {
    newState = processDecisionAction(newState);
  }
  
  // Story progression updates
  if (action.type.startsWith('story/')) {
    newState = processStoryAction(newState);
  }
  
  return newState;
}

// --- Main Reducer ---

/**
 * Root reducer that handles all game state changes
 * 
 * @param state Current game state
 * @param action Action to process
 * @returns Updated game state
 */
export function gameReducer(state: GameState = initialGameState, action: GameAction): GameState {
  // Handle legacy string action types by mapping them to ActionTypes constants
  const actionType = mapLegacyActionType(action.type);
  const updatedAction = { ...action, type: actionType } as GameAction;
  
  // Special global actions that operate on the entire state tree
  switch (updatedAction.type) {
    case ActionTypes.SET_STATE:
      // Assert payload type
      return updatedAction.payload as GameState;
      
    case ActionTypes.RESET_STATE:
      return initialGameState;
      
    case ActionTypes.SAVE_GAME:
      // Persist the current state (handled as a side effect)
      persistState(state);
      return {
        ...state,
        meta: {
          ...(state.meta || {}),
          savedAt: Date.now()
        }
      };
      
    case ActionTypes.LOAD_GAME: { // Add braces
      // Load persisted state (handled as a side effect)
      const loadedState = loadPersistedState();
      return loadedState;
    }
      
    default:
      // For all other actions, process through domain-specific reducers
      return processDomainReducers(state, updatedAction);
  }
}