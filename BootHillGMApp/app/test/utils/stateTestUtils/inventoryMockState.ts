/**
 * Inventory-related mock states for testing
 * Provides pre-configured inventory states for test scenarios
 */
import { BaseMockState } from './types';
import { createBasicMockState } from './baseMockState';

/**
 * Creates a mock state with inventory items
 * 
 * @returns {BaseMockState} A state with predefined inventory items for testing
 */
export function createInventoryMockState(): BaseMockState {
  const baseState: BaseMockState = createBasicMockState();
  
  return {
    ...baseState,
    inventory: {
      items: [
        { id: 'item1', name: 'Revolver', category: 'weapon', description: 'A 6-shooter', quantity: 1 },
        { id: 'item2', name: 'Bandage', category: 'medical', description: 'Heals wounds', quantity: 3 },
        { id: 'item3', name: 'Canteen', category: 'consumable', description: 'Contains water', quantity: 1 }
      ],
      equippedWeaponId: 'item1' // Added equippedWeaponId with the revolver item ID as default
    }
  };
}