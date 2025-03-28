/**
 * Inventory Reducer Tests
 */

import { inventoryReducer } from '../../reducers/inventory/inventoryReducer';
import { adaptStateForTests, migrationAdapter } from '../../utils/stateAdapters';
import { GameState, initialGameState } from '../../types/gameState'; // Changed initialState to initialGameState
import { GameAction } from '../../types/actions';
import { InventoryItem } from '../../types/item.types'; // Added InventoryItem import
import { InventoryState } from '../../types/state'; // Added InventoryState import
import { LegacyState } from '../../utils/stateAdapters'; // Added LegacyState
import { AddItemAction, RemoveItemAction } from '../../types/actions/inventoryActions'; // Added specific action types

// Define an adapted inventory type that behaves like an array
type AdaptedInventory = InventoryState & InventoryItem[];

// Helper function to process state through the reducer and adapter layer
const processState = (state: Partial<GameState>, action: GameAction): GameState & { inventory: AdaptedInventory } => {
  // Normalize state format using the migration adapter
  let normalizedState = migrationAdapter.oldToNew(state as LegacyState);

  // Explicitly ensure inventory is in the correct { items: [...] } format after migration
  // This handles cases where migration might leave inventory as a legacy array
  if (Array.isArray(normalizedState.inventory)) {
      normalizedState = {
          ...normalizedState,
          inventory: { items: normalizedState.inventory as InventoryItem[] } // Wrap legacy array
      };
  } else if (!normalizedState.inventory || typeof normalizedState.inventory !== 'object' || !('items' in normalizedState.inventory)) {
       normalizedState = {
          ...normalizedState,
          inventory: { items: [] } // Ensure inventory object with items array exists
      };
  }
// Ensure normalizedState conforms to GameState before passing to reducer/adapter
// Merge with initialGameState to guarantee all slices exist
// Assert normalizedState as Partial<GameState> to help TS with the spread
const fullNormalizedState: GameState = {
    ...initialGameState, // Corrected usage
    ...(normalizedState as Partial<GameState>) // Assert type here
};

// Apply the inventory reducer to its specific slice
  // Apply the inventory reducer to its specific slice
  // The reducer expects InventoryState | undefined
  const inventorySlice = inventoryReducer(fullNormalizedState.inventory, action);

  // Create a full GameState object with the updated inventory slice
  const stateWithNewInventory: GameState = {
    ...fullNormalizedState,
    inventory: inventorySlice
  };

  // Apply all adapters (including inventory) for test compatibility
  const adaptedState = adaptStateForTests(stateWithNewInventory);

  // Return the adapted state, casting inventory to our AdaptedInventory type
  // This tells TypeScript to expect array-like properties on inventory
  return {
      ...adaptedState,
      inventory: adaptedState.inventory as AdaptedInventory
  };
};

describe('inventoryReducer', () => {
  // Base initial state that will be used in tests
  const createInitialState = (): Partial<GameState> => ({ // Added return type
    inventory: {
      items: [
        // Moved 'damage' into nested 'weapon.modifiers' object
        { id: '1', name: 'Revolver', description: 'A standard six-shooter.', quantity: 1, category: 'weapon', weapon: { id: 'w1', name: 'Revolver', modifiers: { accuracy: 0, reliability: 95, speed: 3, range: 50, damage: '1d6' } } }, // Added placeholder weapon details
        // Updated 'effect' to be an object
        { id: '2', name: 'Canteen', description: 'Holds water.', quantity: 1, category: 'general', effect: { type: 'other', value: 1 } } // Assuming 'other' type and value 1 for effect
      ]
    }
    // Ensure other necessary state slices are present for GameState conformance if needed
    // character: initialCharacterState, // Example
    // combat: initialCombatState,       // Example
    // ...etc
  });
  
  test('should add an item to inventory', () => {
    const state = createInitialState();
    // Create a full InventoryItem for the payload
    const newItem: InventoryItem = {
      id: '3',
      name: 'Bandage',
      description: 'A simple bandage.',
      quantity: 1,
      category: 'medical', // Changed category
      effect: { type: 'heal', value: 5 } // Assuming heal effect
    };
    const action: AddItemAction = { // Use specific action type
      type: 'inventory/ADD_ITEM',
      payload: newItem
    };

    const newState = processState(state, action);
    
    // Test array methods on inventory
    expect(newState.inventory.length).toBe(3); // Should now have 3 items
    // Verify specific item was added
    const item = newState.inventory.find(item => item.id === '3');
    expect(item).toBeDefined();
    // Add check before accessing properties
    if (item) {
      expect(item.name).toBe('Bandage');
    }
  });
  
  test('should remove an item from inventory', () => {
    const state = createInitialState();
    // Payload should be just the ID string
    const action: RemoveItemAction = { // Use specific action type
      type: 'inventory/REMOVE_ITEM',
      payload: '1'
    };

    const newState = processState(state, action);
    
    // Should have one item removed
    expect(newState.inventory.length).toBe(1);
    expect(newState.inventory.some(item => item.id === '1')).toBe(false);
    
    // Check remaining item
    const items = newState.inventory.items || [];
    expect(items[0].id).toBe('2'); // Should still have the canteen
  });
  
  test('should update an item in inventory', () => {
    const state = createInitialState();
    // 'inventory/UPDATE_ITEM' doesn't exist. Using ADD_ITEM to update properties.
    // Create payload with updated properties
    const updatedItemPayload: Partial<InventoryItem> = { // Use Partial<InventoryItem> for update
      id: '2',
      name: 'Full Canteen'
      // No need to include 'type' as it's not a valid property
      // The reducer's ADD_ITEM logic will merge this with the existing item
    };
    const action: AddItemAction = { // Use AddItemAction type
      type: 'inventory/ADD_ITEM', // Use ADD_ITEM type
      payload: updatedItemPayload as InventoryItem // Cast as InventoryItem for the action type
    };

    const newState = processState(state, action);
    // Find the updated item
    const item = newState.inventory.find(item => item.id === '2');

    expect(item).toBeDefined();
    // Add check before accessing properties
    if (item) {
      expect(item.name).toBe('Full Canteen');
      // Check the effect object's type property
      expect(item.effect?.type).toBe('other'); // Check effect type
    }
  });
  
  test('should handle legacy state format', () => {
    // Create state in the old format (flat array of items)
    // Ensure it conforms to Partial<GameState> and items have required props
    const state: Partial<GameState> = {
      inventory: [
        // Added missing properties and corrected weapon structure
        { id: '1', name: 'Revolver', description: 'Old revolver.', quantity: 1, category: 'weapon', weapon: { id: 'w1_legacy', name: 'Revolver', modifiers: { accuracy: -1, reliability: 90, speed: 4, range: 40, damage: '1d6-1' } } }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any // Use 'as any' here because legacy format is intentionally different
    };

    // Create a full InventoryItem for the payload
    const newItem: InventoryItem = {
      id: '2',
      name: 'Bandage',
      description: 'A simple bandage.',
      quantity: 1,
      category: 'medical',
      effect: { type: 'heal', value: 5 }
    };
    const action: AddItemAction = {
      type: 'inventory/ADD_ITEM',
      payload: newItem
    };

    const newState = processState(state, action);
    
    // Should now have two items
    expect(newState.inventory.length).toBe(2);
    
    // Check items
    const items = newState.inventory.items || [];
    
    // First item should be the original
    expect(items[0].id).toBe('1');
    expect(items[0].name).toBe('Revolver');
    
    // Second item should be the new one
    expect(items[1].id).toBe('2');
    expect(items[1].name).toBe('Bandage');
  });
});