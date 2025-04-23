/**
 * ActionTypes Compatibility Tests
 * 
 * This file tests compatibility between legacy string literals
 * and standardized ActionTypes constants.
 */

import { Reducer } from 'react';
import { Action } from '../../types/actions';
import { InventoryState, initialInventoryState } from '../../types/state/inventoryState';
import { JournalState, initialJournalState } from '../../types/state/journalState';
import { testReducerCompatibility } from '../../test/utils/actionTypeTestUtils';
import { inventoryReducer } from '../../reducers/inventory/inventoryReducer';
import { journalReducer } from '../../reducers/journal/journalReducer';
import { ActionTypes } from '../../types/actionTypes';

describe('ActionTypes Compatibility', () => {
  describe('Inventory Reducer', () => {
    test('ADD_ITEM handles both legacy and standard action types', () => {
      const testItem = {
        id: 'test-item',
        name: 'Test Item',
        quantity: 1,
        category: 'general' as const,
        description: 'A test item'
      };

      const result = testReducerCompatibility(
        inventoryReducer as Reducer<InventoryState, Action<string, any>>, // Cast reducer type
        initialInventoryState,
        'inventory/ADD_ITEM',
        ActionTypes.ADD_ITEM,
        testItem
      );

      expect(result).toBe(true);
    });

    test('USE_ITEM handles both legacy and standard action types', () => {
      // First add an item to use
      const withItemState = inventoryReducer(
        initialInventoryState,
        {
          type: ActionTypes.ADD_ITEM,
          payload: {
            id: 'test-item',
            name: 'Test Item',
            quantity: 2,
            category: 'consumable' as const,
            description: 'A test consumable'
          }
        }
      );

      const result = testReducerCompatibility(
        inventoryReducer as Reducer<InventoryState, Action<string, any>>, // Cast reducer type
        withItemState,
        'inventory/USE_ITEM',
        ActionTypes.USE_ITEM,
        'test-item'
      );

      expect(result).toBe(true);
    });
  });

  describe('Journal Reducer', () => {
    test('ADD_ENTRY handles both legacy and standard action types', () => {
      const testEntry = {
        id: 'test-entry',
        title: 'Test Entry',
        content: 'Test content',
        timestamp: Date.now(),
        type: 'narrative' as const
      };

      const result = testReducerCompatibility(
        journalReducer as Reducer<JournalState, Action<string, any>>, // Apply cast
        initialJournalState,
        'journal/ADD_ENTRY',
        ActionTypes.ADD_ENTRY,
        testEntry
      );

      expect(result).toBe(true);
    });
  });
});
