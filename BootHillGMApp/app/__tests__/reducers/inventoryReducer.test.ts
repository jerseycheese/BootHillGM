import inventoryReducer, { initialInventoryState } from '../../reducers/inventoryReducer';
import { InventoryState } from '../../types/state/inventoryState';
import { InventoryItem, ItemCategory } from '../../types/item.types';
import { GameAction } from '../../types/actions';
import { UseItemAction, AddItemAction, SetInventoryAction, UpdateItemQuantityAction } from '../../types/actions/inventoryActions';

describe('inventoryReducer', () => {
  let initialState: InventoryState;

  beforeEach(() => {
    initialState = {
      ...initialInventoryState,
      items: [
        { id: 'med1', name: 'Bandages', quantity: 5, category: 'medical', description: 'Stops bleeding' },
        { id: 'con1', name: 'Whiskey', quantity: 3, category: 'consumable', description: 'Liquid courage' },
        { id: 'gen1', name: 'Pocket Knife', quantity: 1, category: 'general', description: 'Useful tool' },
        { id: 'wep1', name: 'Revolver', quantity: 1, category: 'weapon', description: 'Six shooter' },
        { id: 'med0', name: 'Empty Laudanum', quantity: 0, category: 'medical', description: 'Used up' },
        { id: 'con0', name: 'Empty Canteen', quantity: 0, category: 'consumable', description: 'Needs water' },
      ] as InventoryItem[],
      equippedWeaponId: null
    };
  });

  it('should handle initial state', () => {
    // Use a valid, minimal action type like NO_OP
    expect(inventoryReducer(undefined, { type: 'NO_OP' })).toEqual(initialInventoryState);
  });

  describe("inventory/USE_ITEM", () => {
    it('should decrease quantity for a medical item with quantity > 1', () => {
      const action: UseItemAction = { type: 'inventory/USE_ITEM', payload: 'med1' };
      const state = inventoryReducer(initialState, action);
      const updatedItem = state.items.find(item => item.id === 'med1');
      expect(updatedItem?.quantity).toBe(4);
    });

    it('should decrease quantity for a consumable item with quantity > 1', () => {
      const action: UseItemAction = { type: 'inventory/USE_ITEM', payload: 'con1' };
      const state = inventoryReducer(initialState, action);
      const updatedItem = state.items.find(item => item.id === 'con1');
      expect(updatedItem?.quantity).toBe(2);
    });

    it('should decrease quantity for a consumable item with quantity = 1 to 0', () => {
        // Modify state for this specific test
        const singleConsumableState: InventoryState = {
            ...initialState,
            items: initialState.items.map(item => item.id === 'con1' ? { ...item, quantity: 1 } : item)
        };
      const action: UseItemAction = { type: 'inventory/USE_ITEM', payload: 'con1' };
      const state = inventoryReducer(singleConsumableState, action);
      const updatedItem = state.items.find(item => item.id === 'con1');
      expect(updatedItem?.quantity).toBe(0);
    });

    it('should NOT decrease quantity for a general item', () => {
      const action: UseItemAction = { type: 'inventory/USE_ITEM', payload: 'gen1' };
      const state = inventoryReducer(initialState, action);
      const updatedItem = state.items.find(item => item.id === 'gen1');
      expect(updatedItem?.quantity).toBe(1); // Quantity should remain unchanged
    });

    it('should NOT decrease quantity for a weapon item', () => {
      const action: UseItemAction = { type: 'inventory/USE_ITEM', payload: 'wep1' };
      const state = inventoryReducer(initialState, action);
      const updatedItem = state.items.find(item => item.id === 'wep1');
      expect(updatedItem?.quantity).toBe(1); // Quantity should remain unchanged
    });

    it('should not change state if the item does not exist', () => {
      const action: UseItemAction = { type: 'inventory/USE_ITEM', payload: 'nonexistent_item' };
      expect(inventoryReducer(initialState, action)).toEqual(initialState);
    });

    it('should not change state if the consumable/medical item quantity is already 0', () => {
      const actionMed: UseItemAction = { type: 'inventory/USE_ITEM', payload: 'med0' };
      const actionCon: UseItemAction = { type: 'inventory/USE_ITEM', payload: 'con0' };
      expect(inventoryReducer(initialState, actionMed)).toEqual(initialState);
      expect(inventoryReducer(initialState, actionCon)).toEqual(initialState);
    });

    it('should not change state if payload is missing', () => {
      const action = { type: 'inventory/USE_ITEM' }; // Missing payload
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Using 'as any' to explicitly test reducer behavior with a malformed action (missing payload).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(inventoryReducer(initialState, action as any)).toEqual(initialState);
    });
  });

  describe("inventory/ADD_ITEM with malformed data", () => {
    it('should normalize an item with nested name object', () => {
      // Use type casting to simulate malformed data
      const action: AddItemAction = { 
        type: 'inventory/ADD_ITEM', 
        payload: {
          id: 'test1',
          // Use type assertion to bypass type checking for test
          name: { name: 'Nested Name Item', category: 'consumable' } as unknown as string,
          quantity: 1,
          description: 'This item has a nested name structure',
          category: 'general' // Need to provide this since it's required
        }
      };
      
      const state = inventoryReducer(initialState, action);
      const addedItem = state.items.find(item => item.id === 'test1');
      
      expect(addedItem).toBeDefined();
      expect(addedItem?.name).toBe('Nested Name Item');
      expect(addedItem?.category).toBe('consumable');
    });

    it('should normalize an item with nested category object', () => {
      const action: AddItemAction = { 
        type: 'inventory/ADD_ITEM', 
        payload: {
          id: 'test2',
          name: 'Normal Name',
          // Use type assertion to bypass type checking for test
          category: { category: 'medical' } as unknown as ItemCategory,
          quantity: 1,
          description: 'This item has a nested category structure'
        }
      };
      
      const state = inventoryReducer(initialState, action);
      const addedItem = state.items.find(item => item.id === 'test2');
      
      expect(addedItem).toBeDefined();
      expect(addedItem?.name).toBe('Normal Name');
      expect(addedItem?.category).toBe('medical');
    });

    it('should normalize an item with both nested name and category', () => {
      const action: AddItemAction = { 
        type: 'inventory/ADD_ITEM', 
        payload: {
          id: 'test3',
          // Use type assertion to bypass type checking for test
          name: { name: 'Double Nested Item', category: 'weapon' } as unknown as string,
          category: { category: 'medical' } as unknown as ItemCategory,
          quantity: '3' as unknown as number, // string quantity
          description: 'This item has both nested structures'
        }
      };
      
      const state = inventoryReducer(initialState, action);
      const addedItem = state.items.find(item => item.id === 'test3');
      
      expect(addedItem).toBeDefined();
      expect(addedItem?.name).toBe('Double Nested Item');
      // Our implementation prioritizes category from nested name, but in this test
      // we're expecting 'medical' from the category property instead
      expect(addedItem?.category).toBe('medical'); // From direct category object
      expect(addedItem?.quantity).toBe(3); // Converted to number
    });

    it('should default to general category for invalid categories', () => {
      const action: AddItemAction = { 
        type: 'inventory/ADD_ITEM', 
        payload: {
          id: 'test4',
          name: 'Invalid Category Item',
          // Use type assertion to bypass type checking for test
          category: 'not-a-valid-category' as ItemCategory,
          quantity: 1,
          description: 'This item has an invalid category'
        }
      };
      
      const state = inventoryReducer(initialState, action);
      const addedItem = state.items.find(item => item.id === 'test4');
      
      expect(addedItem).toBeDefined();
      expect(addedItem?.name).toBe('Invalid Category Item');
      expect(addedItem?.category).toBe('general'); // Defaulted to general
    });

    it('should handle completely malformed item with minimum valid data', () => {
      const action = { 
        type: 'inventory/ADD_ITEM', 
        payload: {
          // Minimal required property
          id: 'test5'
          // Missing name, category, etc.
        }
      } as AddItemAction; // Type assertion to allow incomplete data for test
      
      const state = inventoryReducer(initialState, action);
      const addedItem = state.items.find(item => item.id === 'test5');
      
      expect(addedItem).toBeDefined();
      expect(addedItem?.name).toBe('Unknown Item'); // Default name
      expect(addedItem?.category).toBe('general'); // Default category
      expect(addedItem?.quantity).toBe(1); // Default quantity
      expect(addedItem?.description).toBe('A Unknown Item'); // Generated description
    });

    it('should normalize multiple items with SET_INVENTORY', () => {
      const action = { 
        type: 'inventory/SET_INVENTORY', 
        payload: [
          {
            id: 'set1',
            name: { name: 'First Set Item', category: 'weapon' } as unknown as string,
            quantity: 2
          },
          {
            id: 'set2',
            name: 'Second Set Item',
            category: 'consumable' as ItemCategory,
            quantity: 3
          }
        ]
      } as SetInventoryAction;
      
      const state = inventoryReducer(initialState, action);
      
      expect(state.items).toHaveLength(2);
      
      const item1 = state.items.find(item => item.id === 'set1');
      expect(item1?.name).toBe('First Set Item');
      expect(item1?.category).toBe('weapon');
      expect(item1?.quantity).toBe(2);
      
      const item2 = state.items.find(item => item.id === 'set2');
      expect(item2?.name).toBe('Second Set Item');
      expect(item2?.category).toBe('consumable');
      expect(item2?.quantity).toBe(3);
    });
  });

  describe("inventory/UPDATE_ITEM_QUANTITY", () => {
    it('should update the quantity of an existing item', () => {
      const action: UpdateItemQuantityAction = { 
        type: 'inventory/UPDATE_ITEM_QUANTITY', 
        payload: { id: 'med1', quantity: 10 }
      };
      
      const state = inventoryReducer(initialState, action);
      const updatedItem = state.items.find(item => item.id === 'med1');
      
      expect(updatedItem?.quantity).toBe(10);
    });
  });

  describe("inventory/CLEAN_INVENTORY", () => {
    it('should remove items with quantity 0', () => {
      const action: GameAction = { type: 'inventory/CLEAN_INVENTORY' };
      
      const state = inventoryReducer(initialState, action);
      
      expect(state.items).toHaveLength(4); // 6 original items - 2 with quantity 0
      expect(state.items.find(item => item.id === 'med0')).toBeUndefined();
      expect(state.items.find(item => item.id === 'con0')).toBeUndefined();
    });
  });
});
