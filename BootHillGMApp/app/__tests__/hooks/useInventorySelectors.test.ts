/**
 * Tests for inventory selector hooks
 */

import { renderHook } from '@testing-library/react';
import * as useGameModule from '../../hooks/useGame';
import { 
  useInventoryItems,
  useInventoryItem,
  useWeapons,
  useInventoryByCategory,
  useInventoryStats,
  useEquippedWeapon
} from '../../hooks/selectors/useInventorySelectors';

// Mock the useGame hook
jest.mock('../../hooks/useGame', () => ({
  useGame: jest.fn()
}));

describe('Inventory Selector Hooks', () => {
  // Sample inventory state
  const sampleInventory = {
    items: [
      { id: '1', name: 'Revolver', category: 'weapon', isEquipped: true, quantity: 1 },
      { id: '2', name: 'Knife', category: 'weapon', isEquipped: false, quantity: 1 },
      { id: '3', name: 'Bandage', category: 'healing', quantity: 3 },
      { id: '4', name: 'Whiskey', category: 'consumable', quantity: 2 }
    ]
  };
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation for useGame
    (useGameModule.useGame as jest.Mock).mockReturnValue({
      state: {
        inventory: sampleInventory
      },
      dispatch: jest.fn()
    });
  });
  
  test('useInventoryItems should return all inventory items', () => {
    const { result } = renderHook(() => useInventoryItems());
    
    expect(result.current).toEqual(sampleInventory.items);
    expect(result.current.length).toBe(4);
  });
  
  test('useInventoryItems should handle empty inventory', () => {
    // Mock empty inventory
    (useGameModule.useGame as jest.Mock).mockReturnValue({
      state: { inventory: { items: [] } },
      dispatch: jest.fn()
    });
    
    const { result } = renderHook(() => useInventoryItems());
    
    expect(result.current).toEqual([]);
    expect(result.current.length).toBe(0);
  });
  
  test('useInventoryItems should handle undefined inventory', () => {
    // Mock undefined inventory
    (useGameModule.useGame as jest.Mock).mockReturnValue({
      state: { inventory: undefined },
      dispatch: jest.fn()
    });
    
    const { result } = renderHook(() => useInventoryItems());
    
    expect(result.current).toEqual([]);
    expect(result.current.length).toBe(0);
  });
  
  test('useInventoryItem should return an item by ID', () => {
    const { result } = renderHook(() => useInventoryItem('2'));
    
    expect(result.current).toEqual({
      id: '2',
      name: 'Knife',
      category: 'weapon',
      isEquipped: false,
      quantity: 1
    });
  });
  
  test('useInventoryItem should return undefined for non-existent item', () => {
    const { result } = renderHook(() => useInventoryItem('999'));
    
    expect(result.current).toBeUndefined();
  });
  
  test('useInventoryByCategory should filter items by category', () => {
    const { result } = renderHook(() => useInventoryByCategory('weapon'));
    
    expect(result.current.length).toBe(2);
    expect(result.current[0].name).toBe('Revolver');
    expect(result.current[1].name).toBe('Knife');
  });
  
  test('useWeapons should return all weapon items', () => {
    const { result } = renderHook(() => useWeapons());
    
    expect(result.current.length).toBe(2);
    expect(result.current[0].category).toBe('weapon');
    expect(result.current[1].category).toBe('weapon');
  });
  
  test('useEquippedWeapon should return the equipped weapon', () => {
    const { result } = renderHook(() => useEquippedWeapon());
    
    expect(result.current).toEqual({
      id: '1',
      name: 'Revolver',
      category: 'weapon',
      isEquipped: true,
      quantity: 1
    });
  });
  
  test('useInventoryStats should calculate correct statistics', () => {
    const { result } = renderHook(() => useInventoryStats());
    
    expect(result.current).toEqual({
      totalItems: 4,
      totalQuantity: 7, // 1 + 1 + 3 + 2
      weaponCount: 2,
      healingCount: 1
    });
  });
});
