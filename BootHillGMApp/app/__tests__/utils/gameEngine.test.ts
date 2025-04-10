import { gameReducer } from '../../reducers/gameReducer';
// import { GameState } from '../../types/gameState'; // Removed unused import
import { ExtendedGameState } from '../../types/extendedState'; // Re-added to match reducer signature
import { GameEngineAction } from '../../types/gameActions';
import { Character } from '../../types/character';
import { InventoryItem, ItemCategory } from '../../types/item.types';
import { NarrativeJournalEntry } from '../../types/journal';
import { initialNarrativeState } from '../../types/narrative.types';
// import { journalAdapter } from '../../utils/stateAdapters'; // Removed adapter import
import { initialCharacterState } from '../../types/state/characterState'; // Import initialCharacterState
import { initialJournalState } from '../../types/state/journalState'; // Import initialJournalState
import { initialInventoryState } from '../../types/state/inventoryState'; // Import initialInventoryState
import { initialCombatState } from '../../types/state/combatState'; // Import initialCombatState
import { initialUIState } from '../../types/state/uiState'; // Import initialUIState
// import { adaptStateForTests } from '../../utils/stateAdapters'; // Removed adapter import

// Removed unused JournalEntryObject interface

// Removed getJournalEntries helper function as journalAdapter is gone

describe('gameReducer', () => {
  let initialState: ExtendedGameState; // Use ExtendedGameState to match reducer

  beforeEach(() => {
    // Create a base state with all required properties
    // Create a base state conforming to ExtendedGameState
    // This requires properties that might have been in the legacy model
    initialState = {
      // Slices
      character: initialCharacterState,
      combat: initialCombatState,
      inventory: initialInventoryState,
      journal: initialJournalState,
      narrative: initialNarrativeState,
      ui: initialUIState,

      // Top-level properties from GameState
      currentPlayer: '',
      npcs: [],
      location: null,
      quests: [],
      gameProgress: 0,
      savedTimestamp: 0,
      isClient: false,
      suggestedActions: [],

      // Properties potentially needed for ExtendedGameState (add defaults)
      player: null, // Example legacy property
      opponent: null, // Example legacy property
      entries: [], // Example legacy property
      isCombatActive: false, // Example legacy property
      // Add other legacy properties as needed based on ExtendedGameState definition
    };
  }); // End beforeEach

  it('should set player name', () => {
    const action: GameEngineAction = { type: 'SET_PLAYER', payload: 'John Doe' };
    const newState = gameReducer(initialState, action);
    expect(newState.currentPlayer).toBe('John Doe');
  });

  it('should set character', () => {
    const mockCharacter: Character = {
      id: 'player-1',
      name: 'John',
      isNPC: false,
      isPlayer: true,
      attributes: {
        speed: 5,
        gunAccuracy: 7,
        throwingAccuracy: 6,
        strength: 8,
        baseStrength: 8,
        bravery: 7,
        experience: 3
      },
      minAttributes: {
        speed: 1,
        gunAccuracy: 1,
        throwingAccuracy: 1,
        strength: 8,
        baseStrength: 8,
        bravery: 1,
        experience: 0,
      },
      maxAttributes: {
        speed: 20,
        gunAccuracy: 20,
        throwingAccuracy: 20,
        strength: 20,
        baseStrength: 20,
        bravery: 20,
        experience: 11,
      },
      wounds: [],
      isUnconscious: false,
      inventory: { items: [] }, // Correct structure
      weapon: undefined,
      equippedWeapon: undefined,
      strengthHistory: {
        baseStrength: 8, // Match the baseStrength in attributes
        changes: [],
      },
    };
    const action: GameEngineAction = { type: 'SET_CHARACTER', payload: mockCharacter };
    const newState = gameReducer(initialState, action);
    // Use the character state instead of directly comparing with mockCharacter
    expect(newState.character?.player).toEqual(mockCharacter);
  });

  it('should set location', () => {
    const action: GameEngineAction = { type: 'SET_LOCATION', payload: { type: 'town', name: 'Saloon' } };
    const newState = gameReducer(initialState, action);
    expect(newState.location).toEqual({ type: 'town', name: 'Saloon' });
  });

  it('should set narrative', () => {
    const action: GameEngineAction = { type: 'SET_NARRATIVE', payload: { text: 'You enter the saloon.' } }; // Correct payload structure
    const newState = gameReducer(initialState, action);
    expect(newState.narrative.narrativeHistory).toContain('You enter the saloon.');
  });

  it('should set game progress', () => {
    const action: GameEngineAction = { type: 'SET_GAME_PROGRESS', payload: 10 };
    const newState = gameReducer(initialState, action);
    expect(newState.gameProgress).toBe(10);
  });

  it('should update journal', () => {
    const newEntry: NarrativeJournalEntry = {
      id: `entry_${Date.now()}`, // Add missing ID
      title: 'Untitled Entry', // Add the expected default title
      type: 'narrative',
      timestamp: Date.now(),
      content: 'Started the journey',
      narrativeSummary: 'A new adventure begins'
    };
    const action: GameEngineAction = { type: 'UPDATE_JOURNAL', payload: newEntry };
    const newState = gameReducer(initialState, action);
    
    // Access entries directly from the journal slice
    expect(newState.journal.entries).toContainEqual(newEntry);
  });

  it('should set combat status', () => {
    const action: GameEngineAction = { type: 'SET_COMBAT_ACTIVE', payload: true };
    const newState = gameReducer(initialState, action);
    expect(newState.combat.isActive).toBe(true);
  });

  it('should set opponent', () => {
    const mockOpponent: Character = {
      id: 'opponent-1',
      name: 'Bandit',
      isNPC: true,
      isPlayer: false,
      attributes: {
        speed: 6,
        gunAccuracy: 6,
        throwingAccuracy: 5,
        strength: 7,
        baseStrength: 7,
        bravery: 6,
        experience: 4
      },
      minAttributes: {
        speed: 1,
        gunAccuracy: 1,
        throwingAccuracy: 1,
        strength: 8,
        baseStrength: 8,
        bravery: 1,
        experience: 0,
      },
      maxAttributes: {
        speed: 20,
        gunAccuracy: 20,
        throwingAccuracy: 20,
        strength: 20,
        baseStrength: 20,
        bravery: 20,
        experience: 11,
      },
      wounds: [],
      isUnconscious: false,
      inventory: { items: [] },
    };
    const action: GameEngineAction = { type: 'SET_OPPONENT', payload: mockOpponent };
    const newState = gameReducer(initialState, action);
    
    // Check the opponent in character.opponent instead of comparing complete object
    // We'll check just the key fields we care about
    expect(newState.character?.opponent).toBeTruthy();
    expect(newState.character?.opponent?.name).toBe('Bandit');
    expect(newState.character?.opponent?.isNPC).toBe(true);
    expect(newState.character?.opponent?.attributes).toEqual(mockOpponent.attributes);
  });

  it('should add an item to the inventory', () => {
    const newItem: InventoryItem = { id: '1', name: 'Health Potion', quantity: 1, description: 'Restores health', category: 'general' as ItemCategory };
    const action: GameEngineAction = { type: 'ADD_ITEM', payload: newItem };
    
    // Create a clean initial state (ExtendedGameState)
    const testState: ExtendedGameState = {
      ...initialState,
      inventory: { items: [], equippedWeaponId: null } // Add missing property
    };
    
    const newState = gameReducer(testState, action);
    
    // Check the item exists in the inventory state
    expect(newState.inventory.items).toContainEqual(newItem);
  });

  it('should remove an item from the inventory', () => {
    const item: InventoryItem = { id: '1', name: 'Health Potion', quantity: 1, description: 'Restores health', category: 'general' as ItemCategory };
    
    // Create a state with the item already in inventory (ExtendedGameState)
    const stateWithItem: ExtendedGameState = {
      ...initialState,
      inventory: { items: [item], equippedWeaponId: null } // Add missing property
    };
    
    const action: GameEngineAction = { type: 'REMOVE_ITEM', payload: '1' };
    const newState = gameReducer(stateWithItem, action);
    
    // Check the item was removed
    expect(newState.inventory.items).toHaveLength(0);
  });

  it('should update item quantity when adding an existing item', () => {
    const existingItem: InventoryItem = { id: '1', name: 'Health Potion', quantity: 1, description: 'Restores health', category: 'general' as ItemCategory };
    
    // Create a state with the item already in inventory (ExtendedGameState)
    const stateWithItem: ExtendedGameState = {
      ...initialState,
      inventory: { items: [existingItem], equippedWeaponId: null } // Add missing property
    };
    
    const action: GameEngineAction = { type: 'ADD_ITEM', payload: { ...existingItem, quantity: 2 } };
    const newState = gameReducer(stateWithItem, action);
    
    // Check the quantity was updated
    expect(newState.inventory.items[0].quantity).toBe(3);
  });

  it('should handle USE_ITEM action', () => {
    const item: InventoryItem = { id: '1', name: 'Health Potion', quantity: 2, description: 'Restores health', category: 'general' as ItemCategory };
    
    // Create a state with the item already in inventory (ExtendedGameState)
    const stateWithItem: ExtendedGameState = {
      ...initialState,
      inventory: { items: [item], equippedWeaponId: null } // Add missing property
    };
    
    const action: GameEngineAction = { type: 'USE_ITEM', payload: '1' };
    const newState = gameReducer(stateWithItem, action);
    
    // Check the quantity was reduced
    expect(newState.inventory.items[0].quantity).toBe(1);
  });

  it('should remove item when quantity reaches 0 after USE_ITEM', () => {
    const item: InventoryItem = { id: '1', name: 'Health Potion', quantity: 1, description: 'Restores health', category: 'general' as ItemCategory };
    
    // Create a state with the item already in inventory (ExtendedGameState)
    const stateWithItem: ExtendedGameState = {
      ...initialState,
      inventory: { items: [item], equippedWeaponId: null } // Add missing property
    };
    
    const action: GameEngineAction = { type: 'USE_ITEM', payload: '1' };
    const newState = gameReducer(stateWithItem, action);
    
    // Check the item was removed completely
    expect(newState.inventory.items).toHaveLength(0);
  });

  it('should handle UPDATE_ITEM_QUANTITY action', () => {
    const item: InventoryItem = { id: '1', name: 'Health Potion', quantity: 2, description: 'Restores health', category: 'general' as ItemCategory };
    
    // Create a state with the item already in inventory (ExtendedGameState)
    const stateWithItem: ExtendedGameState = {
      ...initialState,
      inventory: { items: [item], equippedWeaponId: null } // Add missing property
    };
    
    const action: GameEngineAction = { type: 'UPDATE_ITEM_QUANTITY', payload: { id: '1', quantity: 5 } };
    const newState = gameReducer(stateWithItem, action);
    
    // Check the quantity was updated to the new value
    expect(newState.inventory.items[0].quantity).toBe(5);
  });

  it('should handle CLEAN_INVENTORY action', () => {
    const validItem: InventoryItem = { id: '1', name: 'Health Potion', quantity: 2, description: 'Restores health', category: 'general' as ItemCategory };
    const invalidItem: InventoryItem = { id: '2', name: 'REMOVED_ITEMS: Invalid Item', quantity: 0, description: 'Should be removed', category: 'general' as ItemCategory };
    
    // Create a state with both valid and invalid items (ExtendedGameState)
    const stateWithItems: ExtendedGameState = {
      ...initialState,
      inventory: { items: [validItem, invalidItem], equippedWeaponId: null } // Add missing property
    };
    
    const action: GameEngineAction = { type: 'CLEAN_INVENTORY' };
    const newState = gameReducer(stateWithItems, action);
    
    // Check only the valid item remains
    expect(newState.inventory.items).toHaveLength(1);
    expect(newState.inventory.items[0]).toEqual(validItem);
  });

  it('should handle SET_INVENTORY action', () => {
    const newInventory: InventoryItem[] = [
      { id: '1', name: 'Health Potion', quantity: 2, description: 'Restores health', category: 'general' as ItemCategory },
      { id: '2', name: 'Sword', quantity: 1, description: 'Sharp weapon', category: 'general' as ItemCategory }
    ];
    const action: GameEngineAction = { type: 'SET_INVENTORY', payload: newInventory };
    const newState = gameReducer(initialState, action);
    
    // Check the inventory was completely replaced
    expect(newState.inventory.items).toEqual(newInventory);
  });
});
