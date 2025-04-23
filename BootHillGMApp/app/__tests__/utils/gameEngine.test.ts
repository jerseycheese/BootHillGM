import { gameReducer } from '../../reducers/gameReducer';
import { ExtendedGameState } from '../../types/extendedState';
import { GameAction } from '../../types/actions'; // Use correct GameAction type
import { Character } from '../../types/character';
import { InventoryItem, ItemCategory } from '../../types/item.types';
import { NarrativeJournalEntry } from '../../types/journal';
import { initialNarrativeState } from '../../types/narrative.types';
import { initialCharacterState } from '../../types/state/characterState';
import { initialJournalState } from '../../types/state/journalState';
import { initialInventoryState } from '../../types/state/inventoryState';
import { initialCombatState } from '../../types/state/combatState';
import { initialUIState } from '../../types/state/uiState';
import { ActionTypes } from '../../types/actionTypes';

describe('gameReducer', () => {
  let initialState: ExtendedGameState;

  beforeEach(() => {
    // Create a base state with all required properties
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
      meta: {},

      // Properties for ExtendedGameState
      player: null,
      opponent: null,
      entries: [],
      isCombatActive: false,
    };
  });

  it('should set player name', () => {
    const action: GameAction = { type: ActionTypes.SET_PLAYER, payload: 'John Doe' };
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
      inventory: { items: [] },
      weapon: undefined,
      equippedWeapon: undefined,
      strengthHistory: {
        baseStrength: 8,
        changes: [],
      },
    };
    const action: GameAction = { type: ActionTypes.SET_CHARACTER, payload: mockCharacter };
    const newState = gameReducer(initialState, action);
    expect(newState.character?.player).toEqual(mockCharacter);
  });

  it('should set location', () => {
    const action: GameAction = { type: ActionTypes.SET_LOCATION, payload: { type: 'town', name: 'Saloon' } };
    const newState = gameReducer(initialState, action);
    expect(newState.location).toEqual({ type: 'town', name: 'Saloon' });
  });

  it('should set narrative', () => {
    // The issue was the payload format - it needs to be directly usable as a string
    const action: GameAction = { type: ActionTypes.ADD_NARRATIVE_HISTORY, payload: 'You enter the saloon.' };
    const newState = gameReducer(initialState, action);
    expect(newState.narrative.narrativeHistory).toContain('You enter the saloon.');
  });

  it('should set game progress', () => {
    const action: GameAction = { type: ActionTypes.SET_GAME_PROGRESS, payload: 10 };
    const newState = gameReducer(initialState, action);
    expect(newState.gameProgress).toBe(10);
  });

  it('should update journal', () => {
    const timestamp = Date.now();
    const newEntry: NarrativeJournalEntry = {
      id: `entry_${timestamp}`,
      title: 'Untitled Entry',
      type: 'narrative',
      timestamp: timestamp,
      content: 'Started the journey',
      narrativeSummary: 'A new adventure begins'
    };
    
    const action: GameAction = {
      type: ActionTypes.UPDATE_JOURNAL_GENERAL, 
      payload: { 
        text: 'Started the journey', 
        summary: 'A new adventure begins' 
      } 
    };
    
    const newState = gameReducer(initialState, action);
    
    // Verify entry is in the journal
    expect(newState.journal.entries.length).toBe(1);
    expect(newState.journal.entries[0].content).toBe('Started the journey');
    expect(newState.journal.entries[0].narrativeSummary).toBe('A new adventure begins');
  });

  it('should set combat status', () => {
    const action: GameAction = { type: ActionTypes.SET_COMBAT_ACTIVE, payload: true };
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
    const action: GameAction = { type: ActionTypes.SET_OPPONENT, payload: mockOpponent };
    const newState = gameReducer(initialState, action);
    
    expect(newState.character?.opponent).toBeTruthy();
    expect(newState.character?.opponent?.name).toBe('Bandit');
    expect(newState.character?.opponent?.isNPC).toBe(true);
    expect(newState.character?.opponent?.attributes).toEqual(mockOpponent.attributes);
  });

  it('should add an item to the inventory', () => {
    const newItem: InventoryItem = { id: '1', name: 'Health Potion', quantity: 1, description: 'Restores health', category: 'general' as ItemCategory };
    const action: GameAction = { type: ActionTypes.ADD_ITEM, payload: newItem };
    
    const testState: ExtendedGameState = {
      ...initialState,
      inventory: { items: [], equippedWeaponId: null }
    };
    
    const newState = gameReducer(testState, action);
    expect(newState.inventory.items).toContainEqual(newItem);
  });

  it('should remove an item from the inventory', () => {
    const item: InventoryItem = { id: '1', name: 'Health Potion', quantity: 1, description: 'Restores health', category: 'general' as ItemCategory };
    
    const stateWithItem: ExtendedGameState = {
      ...initialState,
      inventory: { items: [item], equippedWeaponId: null }
    };
    
    const action: GameAction = { type: ActionTypes.REMOVE_ITEM, payload: '1' };
    const newState = gameReducer(stateWithItem, action);
    expect(newState.inventory.items).toHaveLength(0);
  });

  it('should update item quantity when adding an existing item', () => {
    const existingItem: InventoryItem = { id: '1', name: 'Health Potion', quantity: 1, description: 'Restores health', category: 'general' as ItemCategory };
    
    const stateWithItem: ExtendedGameState = {
      ...initialState,
      inventory: { items: [existingItem], equippedWeaponId: null }
    };
    
    const action: GameAction = { type: ActionTypes.ADD_ITEM, payload: { ...existingItem, quantity: 2 } };
    const newState = gameReducer(stateWithItem, action);
    expect(newState.inventory.items[0].quantity).toBe(3);
  });

  it('should handle USE_ITEM action', () => {
    const item: InventoryItem = { id: '1', name: 'Health Potion', quantity: 2, description: 'Restores health', category: 'general' as ItemCategory };
    
    const stateWithItem: ExtendedGameState = {
      ...initialState,
      inventory: { items: [item], equippedWeaponId: null }
    };
    
    const action: GameAction = { type: ActionTypes.USE_ITEM, payload: '1' };
    const newState = gameReducer(stateWithItem, action);
    expect(newState.inventory.items[0].quantity).toBe(1);
  });

  it('should remove item when quantity reaches 0 after USE_ITEM', () => {
    const item: InventoryItem = { id: '1', name: 'Health Potion', quantity: 1, description: 'Restores health', category: 'general' as ItemCategory };
    
    const stateWithItem: ExtendedGameState = {
      ...initialState,
      inventory: { items: [item], equippedWeaponId: null }
    };
    
    const action: GameAction = { type: ActionTypes.USE_ITEM, payload: '1' };
    const newState = gameReducer(stateWithItem, action);
    expect(newState.inventory.items).toHaveLength(0);
  });

  it('should handle UPDATE_ITEM_QUANTITY action', () => {
    const item: InventoryItem = { id: '1', name: 'Health Potion', quantity: 2, description: 'Restores health', category: 'general' as ItemCategory };
    
    const stateWithItem: ExtendedGameState = {
      ...initialState,
      inventory: { items: [item], equippedWeaponId: null }
    };
    
    // Use the updated payload format to match what the reducer now expects
    const action: GameAction = {
      type: ActionTypes.UPDATE_ITEM_QUANTITY, 
      payload: { 
        itemId: '1', 
        quantity: 5 
      } 
    };
    
    const newState = gameReducer(stateWithItem, action);
    expect(newState.inventory.items[0].quantity).toBe(5);
  });

  it('should handle CLEAN_INVENTORY action', () => {
    const validItem: InventoryItem = { id: '1', name: 'Health Potion', quantity: 2, description: 'Restores health', category: 'general' as ItemCategory };
    const invalidItem: InventoryItem = { id: '2', name: 'REMOVED_ITEMS: Invalid Item', quantity: 0, description: 'Should be removed', category: 'general' as ItemCategory };
    
    const stateWithItems: ExtendedGameState = {
      ...initialState,
      inventory: { items: [validItem, invalidItem], equippedWeaponId: null }
    };
    
    const action: GameAction = { type: ActionTypes.CLEAN_INVENTORY };
    const newState = gameReducer(stateWithItems, action);
    expect(newState.inventory.items).toHaveLength(1);
    expect(newState.inventory.items[0]).toEqual(validItem);
  });

  it('should handle SET_INVENTORY action', () => {
    const newInventory: InventoryItem[] = [
      { id: '1', name: 'Health Potion', quantity: 2, description: 'Restores health', category: 'general' as ItemCategory },
      { id: '2', name: 'Sword', quantity: 1, description: 'Sharp weapon', category: 'general' as ItemCategory }
    ];
    const action: GameAction = { type: ActionTypes.SET_INVENTORY, payload: newInventory };
    const newState = gameReducer(initialState, action);
    expect(newState.inventory.items).toEqual(newInventory);
  });
});