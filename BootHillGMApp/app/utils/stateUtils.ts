/**
 * State utility functions for game state management
 * 
 * This module contains functions for creating and manipulating game state objects,
 * particularly for reset operations and minimal state initialization.
 */
import { Character } from "../types/character";
import { CombatLogEntry, CombatType } from "../types/state/combatState";
import { getStartingInventory } from "./startingInventory";

/**
 * Debug logging function for state utility operations
 */
export const debug = (...args: Parameters<typeof console.log>): void => {
  console.log('[DEBUG debugActions]', ...args);
};

/**
 * Creates a minimal valid state with required properties
 * Designed to be a blank slate except for character data
 * 
 * @param existingCharacter Optional character data to preserve in the new state
 * @returns A complete minimal game state object
 */
export const createMinimalValidState = (existingCharacter?: Character | null) => {
  // Use existing character if provided
  const defaultCharacter = existingCharacter || null;
  
  // Ensure character has inventory if it exists
  if (defaultCharacter) {
    if (!defaultCharacter.inventory || !defaultCharacter.inventory.items) {
      defaultCharacter.inventory = { items: getStartingInventory() };
    } else if (!Array.isArray(defaultCharacter.inventory.items) || defaultCharacter.inventory.items.length === 0) {
      // If inventory exists but items array is empty, add default items
      defaultCharacter.inventory.items = getStartingInventory();
    }
  }
  
  const initialLogEntry: CombatLogEntry = {
    text: 'Combat initialized',
    timestamp: Date.now(),
    type: 'system'
  };
  
  // Create a timestamp for any newly generated content
  const nowTimestamp = Date.now();
  
  // Check if we have AI-generated content to preserve
  let narrativeContent = null;
  let journalEntries = [];
  let suggestedActions = [];
  
  try {
    // Check for narrative in localStorage
    const narrativeRaw = localStorage.getItem('narrative');
    if (narrativeRaw) {
      narrativeContent = JSON.parse(narrativeRaw);
      debug('Found existing narrative content to preserve');
    }
    
    // Check for journal entries
    const journalRaw = localStorage.getItem('journal');
    if (journalRaw) {
      journalEntries = JSON.parse(journalRaw);
      debug('Found existing journal entries to preserve:', journalEntries.length);
    }
    
    // Check for suggested actions
    const actionsRaw = localStorage.getItem('suggestedActions');
    if (actionsRaw) {
      suggestedActions = JSON.parse(actionsRaw);
      debug('Found existing suggested actions to preserve:', suggestedActions.length);
    }
  } catch (err) {
    debug('Error reading AI content from localStorage:', err);
  }
  
  return {
    character: {
      player: defaultCharacter,
      opponent: null
    },
    inventory: {
      items: defaultCharacter && defaultCharacter.inventory ? 
        defaultCharacter.inventory.items : getStartingInventory(),
      equippedWeaponId: null
    },
    journal: {
      entries: journalEntries.length ? journalEntries : [] // Use existing journal if available
    },
    narrative: {
      currentStoryPoint: null, 
      narrativeHistory: narrativeContent ? [narrativeContent] : [], // Use existing narrative if available
      visitedPoints: [],
      availableChoices: [],
      displayMode: 'standard',
      context: 'Reset game state',
      needsInitialGeneration: !narrativeContent // Only set to true if we don't have content
    },
    combat: {
      isActive: false,
      rounds: 0,
      combatType: 'brawling' as CombatType,
      playerTurn: true,
      playerCharacterId: defaultCharacter ? defaultCharacter.id : '',
      opponentCharacterId: '',
      combatLog: [initialLogEntry],
      roundStartTime: 0,
      modifiers: {
        player: 0,
        opponent: 0
      },
      currentTurn: null
    },
    location: {
      type: 'town',
      name: 'Boot Hill'
    },
    ui: {
      activePanel: 'game',
      showInventory: false,
      showCharacter: false,
      showJournal: false,
      // CRITICAL: Add loading indicators state to ensure it's off during reset
      loading: null,
      loadingIndicator: null
    },
    suggestedActions: suggestedActions.length ? suggestedActions : [], // Use existing actions if available
    isReset: true,
    gameProgress: 0,
    savedTimestamp: nowTimestamp,
    isClient: true,
    forceContentGeneration: !narrativeContent, // Only force if we don't have content
    // CRITICAL: Add flag to prevent loading screen during reset
    skipLoadingScreen: true
  };
};
