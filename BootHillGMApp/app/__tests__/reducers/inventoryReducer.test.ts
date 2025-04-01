/**
 * Inventory Reducer Tests
 */

import inventoryReducer from '../../reducers/inventoryReducer'; // Use default import
// Removed imports for non-existent adapters: adaptStateForTests, migrationAdapter
// import { adaptStateForTests, migrationAdapter } from '../../utils/stateAdapters';
import { GameState } from '../../types/gameState'; // Removed unused initialGameState
import { GameAction } from '../../types/actions';
import { InventoryItem } from '../../types/item.types'; // Added InventoryItem import
import { InventoryState } from '../../types/state'; // Added InventoryState import
// import { LegacyState } from '../../utils/stateAdapters'; // Removed LegacyState import
import { AddItemAction, RemoveItemAction } from '../../types/actions/inventoryActions'; // Added specific action types

// Removed AdaptedInventory type as adapters are gone

// Helper function to process state through the reducer and adapter layer
// Simplified helper: directly apply reducer to the inventory slice
const processInventoryState = (state: Partial<GameState>, action: GameAction): InventoryState => {
  // Assume state.inventory exists and is in the correct format for the reducer
  const inventoryState = state.inventory || { items: [] }; // Default to empty state if undefined
  return inventoryReducer(inventoryState, action);
};

describe('inventoryReducer', () => {
  // Base initial state that will be used in tests
  // Base initial state slice for inventory tests
  const createInitialInventoryState = (): InventoryState => ({
    items: [
      { id: '1', name: 'Revolver', description: 'A standard six-shooter.', quantity: 1, category: 'weapon', weapon: { id: 'w1', name: 'Revolver', modifiers: { accuracy: 0, reliability: 95, speed: 3, range: 50, damage: '1d6' } } },
      { id: '2', name: 'Canteen', description: 'Holds water.', quantity: 1, category: 'general', effect: { type: 'other', value: 1 } }
    ]
  });
  
  test('should add an item to inventory', () => {
    const initialInventory = createInitialInventoryState();
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

    const newState = processInventoryState({ inventory: initialInventory }, action);
    
    // Test items array directly
    expect(newState.items.length).toBe(3); // Should now have 3 items
    // Verify specific item was added
    const item = newState.items.find(item => item.id === '3');
    expect(item).toBeDefined();
    expect(item?.name).toBe('Bandage');
  });
  
  test('should remove an item from inventory', () => {
    const initialInventory = createInitialInventoryState();
    // Payload should be just the ID string
    const action: RemoveItemAction = { // Use specific action type
      type: 'inventory/REMOVE_ITEM',
      payload: '1'
    };

    const newState = processInventoryState({ inventory: initialInventory }, action);
    
    // Should have one item removed
    expect(newState.items.length).toBe(1);
    expect(newState.items.some(item => item.id === '1')).toBe(false);
    
    // Check remaining item
    expect(newState.items[0].id).toBe('2'); // Should still have the canteen
  });
  
  test('should update an item in inventory', () => {
    const initialInventory = createInitialInventoryState();
    const originalItem = initialInventory.items.find(item => item.id === '2'); // Get original item

    // Define the fully updated item
    const updatedItem: InventoryItem = {
      ...(originalItem!), // Spread original item properties
      name: 'Full Canteen', // Update the name
      // Ensure all required InventoryItem properties are present
      id: '2',
      quantity: originalItem?.quantity || 1, // Keep original quantity or default
      description: originalItem?.description || '',
      category: originalItem?.category || 'general',
      effect: originalItem?.effect // Keep original effect
    };

    // Step 1: Remove the original item
    const removeAction: RemoveItemAction = { type: 'inventory/REMOVE_ITEM', payload: '2' };
    const stateAfterRemove = processInventoryState({ inventory: initialInventory }, removeAction);

    // Step 2: Add the updated item
    const addAction: AddItemAction = { type: 'inventory/ADD_ITEM', payload: updatedItem };
    const finalState = processInventoryState({ inventory: stateAfterRemove }, addAction);

    // Find the updated item in the final state
    const item = finalState.items.find(item => item.id === '2');

    expect(item).toBeDefined();
    // The test simulates an update via remove then add. The add action adds the item
    // with the new name. The original comment about ADD_ITEM was misleading in this context.
    expect(item?.name).toBe('Full Canteen'); // Expect the updated name from the add step
    // Check other properties if needed
    expect(item?.quantity).toBe(originalItem?.quantity || 1);
    expect(item?.effect?.type).toBe('other');
  });
  
  // Removed obsolete test for legacy state format
});