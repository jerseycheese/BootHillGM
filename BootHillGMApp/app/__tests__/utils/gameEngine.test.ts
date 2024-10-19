import { gameReducer, GameState, GameEngineAction } from '../../utils/gameEngine';
import { Character } from '../../types/character';
import { InventoryItem } from '../../types/inventory';
import { JournalEntry } from '../../types/journal';

describe('gameReducer', () => {
  let initialState: GameState;

  beforeEach(() => {
    initialState = {
      currentPlayer: '',
      npcs: [],
      location: '',
      inventory: [],
      quests: [],
      character: null,
      narrative: '',
      gameProgress: 0,
      journal: [],
      isCombatActive: false,
      opponent: null,
    };
  });

  it('should set player name', () => {
    const action: GameEngineAction = { type: 'SET_PLAYER', payload: 'John Doe' };
    const newState = gameReducer(initialState, action);
    expect(newState.currentPlayer).toBe('John Doe');
  });

  it('should set character', () => {
    const mockCharacter: Character = {
      name: 'John',
      health: 100,
      attributes: {
        speed: 5,
        gunAccuracy: 7,
        throwingAccuracy: 6,
        strength: 8,
        bravery: 7,
        experience: 3
      },
      skills: {
        shooting: 6,
        riding: 5,
        brawling: 7
      }
    };
    const action: GameEngineAction = { type: 'SET_CHARACTER', payload: mockCharacter };
    const newState = gameReducer(initialState, action);
    expect(newState.character).toEqual(mockCharacter);
  });

  it('should set location', () => {
    const action: GameEngineAction = { type: 'SET_LOCATION', payload: 'Saloon' };
    const newState = gameReducer(initialState, action);
    expect(newState.location).toBe('Saloon');
  });

  it('should set narrative', () => {
    const action: GameEngineAction = { type: 'SET_NARRATIVE', payload: 'You enter the saloon.' };
    const newState = gameReducer(initialState, action);
    expect(newState.narrative).toBe('You enter the saloon.');
  });

  it('should set game progress', () => {
    const action: GameEngineAction = { type: 'SET_GAME_PROGRESS', payload: 10 };
    const newState = gameReducer(initialState, action);
    expect(newState.gameProgress).toBe(10);
  });

  it('should update journal', () => {
    const newEntry: JournalEntry = { timestamp: Date.now(), content: 'Started the journey' };
    const action: GameEngineAction = { type: 'UPDATE_JOURNAL', payload: newEntry };
    const newState = gameReducer(initialState, action);
    expect(newState.journal).toContainEqual(newEntry);
  });

  it('should set combat status', () => {
    const action: GameEngineAction = { type: 'SET_COMBAT_ACTIVE', payload: true };
    const newState = gameReducer(initialState, action);
    expect(newState.isCombatActive).toBe(true);
  });

  it('should set opponent', () => {
    const mockOpponent: Character = {
      name: 'Bandit',
      health: 80,
      attributes: {
        speed: 6,
        gunAccuracy: 6,
        throwingAccuracy: 5,
        strength: 7,
        bravery: 6,
        experience: 4
      },
      skills: {
        shooting: 5,
        riding: 6,
        brawling: 6
      }
    };
    const action: GameEngineAction = { type: 'SET_OPPONENT', payload: mockOpponent };
    const newState = gameReducer(initialState, action);
    expect(newState.opponent).toEqual(mockOpponent);
  });

  it('should add an item to the inventory', () => {
    const newItem: InventoryItem = { id: '1', name: 'Health Potion', quantity: 1, description: 'Restores health' };
    const action: GameEngineAction = { type: 'ADD_ITEM', payload: newItem };
    const newState = gameReducer(initialState, action);
    expect(newState.inventory).toContainEqual(newItem);
  });

  it('should remove an item from the inventory', () => {
    const item: InventoryItem = { id: '1', name: 'Health Potion', quantity: 1, description: 'Restores health' };
    const stateWithItem: GameState = { ...initialState, inventory: [item] };
    const action: GameEngineAction = { type: 'REMOVE_ITEM', payload: '1' };
    const newState = gameReducer(stateWithItem, action);
    expect(newState.inventory).toHaveLength(0);
  });

  it('should update item quantity when adding an existing item', () => {
    const existingItem: InventoryItem = { id: '1', name: 'Health Potion', quantity: 1, description: 'Restores health' };
    const stateWithItem: GameState = { ...initialState, inventory: [existingItem] };
    const action: GameEngineAction = { type: 'ADD_ITEM', payload: { ...existingItem, quantity: 2 } };
    const newState = gameReducer(stateWithItem, action);
    expect(newState.inventory[0].quantity).toBe(3);
  });

  it('should handle USE_ITEM action', () => {
    const item: InventoryItem = { id: '1', name: 'Health Potion', quantity: 2, description: 'Restores health' };
    const stateWithItem: GameState = { ...initialState, inventory: [item] };
    const action: GameEngineAction = { type: 'USE_ITEM', payload: '1' };
    const newState = gameReducer(stateWithItem, action);
    expect(newState.inventory[0].quantity).toBe(1);
  });

  it('should remove item when quantity reaches 0 after USE_ITEM', () => {
    const item: InventoryItem = { id: '1', name: 'Health Potion', quantity: 1, description: 'Restores health' };
    const stateWithItem: GameState = { ...initialState, inventory: [item] };
    const action: GameEngineAction = { type: 'USE_ITEM', payload: '1' };
    const newState = gameReducer(stateWithItem, action);
    expect(newState.inventory).toHaveLength(0);
  });

  it('should handle UPDATE_ITEM_QUANTITY action', () => {
    const item: InventoryItem = { id: '1', name: 'Health Potion', quantity: 2, description: 'Restores health' };
    const stateWithItem: GameState = { ...initialState, inventory: [item] };
    const action: GameEngineAction = { type: 'UPDATE_ITEM_QUANTITY', payload: { id: '1', quantity: 5 } };
    const newState = gameReducer(stateWithItem, action);
    expect(newState.inventory[0].quantity).toBe(5);
  });

  it('should handle CLEAN_INVENTORY action', () => {
    const validItem: InventoryItem = { id: '1', name: 'Health Potion', quantity: 2, description: 'Restores health' };
    const invalidItem: InventoryItem = { id: '2', name: 'REMOVED_ITEMS: Invalid Item', quantity: 0, description: 'Should be removed' };
    const stateWithItems: GameState = { ...initialState, inventory: [validItem, invalidItem] };
    const action: GameEngineAction = { type: 'CLEAN_INVENTORY' };
    const newState = gameReducer(stateWithItems, action);
    expect(newState.inventory).toHaveLength(1);
    expect(newState.inventory[0]).toEqual(validItem);
  });

  it('should handle SET_INVENTORY action', () => {
    const newInventory: InventoryItem[] = [
      { id: '1', name: 'Health Potion', quantity: 2, description: 'Restores health' },
      { id: '2', name: 'Sword', quantity: 1, description: 'Sharp weapon' }
    ];
    const action: GameEngineAction = { type: 'SET_INVENTORY', payload: newInventory };
    const newState = gameReducer(initialState, action);
    expect(newState.inventory).toEqual(newInventory);
  });
});
