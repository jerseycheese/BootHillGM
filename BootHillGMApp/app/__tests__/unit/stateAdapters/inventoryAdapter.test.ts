/**
 * Inventory Adapter Tests
 * 
 * Tests for the inventory adapter that makes the inventory slice
 * behave like an array for backward compatibility.
 * 
 * @file Unit tests for inventory adapter
 * @module stateAdapters/inventoryAdapter.test
 */

import { inventoryAdapter } from '../../../utils/stateAdapters';
import { GameState } from '../../../types/gameState';
import { PartialGameStateWithInventory } from './testTypes';
import { hasArrayMethods } from './testHelpers';

describe('inventoryAdapter', () => {
  test('should add array methods to inventory', () => {
    const state: PartialGameStateWithInventory = {
      inventory: {
        items: [
          { 
            id: 'item1', 
            name: 'Revolver',
            description: 'A six-shooter',
            quantity: 1,
            category: 'weapon'
          },
          { 
            id: 'item2', 
            name: 'Canteen',
            description: 'Holds water',
            quantity: 1,
            category: 'general'
          }
        ]
      }
    };
    
    const adapted = inventoryAdapter.adaptForTests(state as unknown as GameState);
    
    // Check that inventory is properly adapted
    expect(hasArrayMethods(adapted)).toBe(true);
    
    if (hasArrayMethods(adapted)) {
      // Should be able to use array methods
      expect(adapted.inventory.find(item => item.id === 'item1')).toBeDefined();
      expect(adapted.inventory.filter(item => item.name.includes('an')).length).toBe(1);
      expect(adapted.inventory.some(item => item.id === 'item2')).toBe(true);
      expect(adapted.inventory.length).toBe(2);
      
      // Should be able to access by index
      expect(adapted.inventory[0].id).toBe('item1');
      expect(adapted.inventory[1].name).toBe('Canteen');
      
      // Should allow spread and iteration
      const itemsCopy = [...adapted.inventory];
      expect(itemsCopy.length).toBe(2);
      
      // Original items should still be accessible
      expect(adapted.inventory.items).toEqual(state.inventory!.items);
    }
  });
  
  test('should handle empty inventory', () => {
    const state: PartialGameStateWithInventory = {
      inventory: {
        items: []
      }
    };
    
    const adapted = inventoryAdapter.adaptForTests(state as unknown as GameState);
    
    // Check inventory properly adapted
    expect(hasArrayMethods(adapted)).toBe(true);
    
    if (hasArrayMethods(adapted)) {
      expect(adapted.inventory.length).toBe(0);
      expect([...adapted.inventory]).toEqual([]);
      expect(adapted.inventory.find(() => true)).toBeUndefined();
    }
  });
});