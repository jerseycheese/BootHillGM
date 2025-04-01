import React from 'react';
import { renderHook } from '@testing-library/react';
import { 
  useInventoryItems,
  useInventoryItem,
  useWeapons,
  useInventoryByCategory,
  useInventoryStats,
  useEquippedWeapon
} from '../../hooks/selectors/useInventorySelectors';
import { TestCampaignStateProvider } from '../utils/testWrappers';
import { InventoryItem } from '../../types/item.types';

describe('Inventory Selector Hooks', () => {
  // Sample inventory items - defined separately from test state
  const sampleItems: InventoryItem[] = [
    { 
      id: '1', 
      name: 'Revolver', 
      description: 'A reliable six-shooter', 
      category: 'weapon', 
      quantity: 1, 
      isEquipped: true 
    },
    { 
      id: '2', 
      name: 'Knife', 
      description: 'A sharp hunting knife', 
      category: 'weapon', 
      quantity: 1, 
      isEquipped: false 
    },
    { 
      id: '3', 
      name: 'Bandage', 
      description: 'Clean cloth for wounds', 
      category: 'medical', 
      quantity: 3 
    },
    { 
      id: '4', 
      name: 'Whiskey', 
      description: 'Strong liquor', 
      category: 'consumable',
      quantity: 2 
    }
  ];

  // Helper function to create our state structure
  const createTestState = (items: InventoryItem[] = []) => ({
    inventory: {
      items: items
    }
  });
  
  test('useInventoryItems should return all inventory items', () => {
    // Use our helper function to create proper state structure
    const testState = createTestState(sampleItems);
    
    // Console.log to debug
    console.log('Test state inventory items: ', 
      JSON.stringify(testState.inventory.items, null, 2));

    const { result } = renderHook(() => useInventoryItems(), { 
      wrapper: ({ children }) => (
        <TestCampaignStateProvider initialState={testState}>
          {children}
        </TestCampaignStateProvider>
      )
    });
    
    // Verify the returned items match our sample items
    expect(result.current).toEqual(sampleItems);
    expect(result.current.length).toBe(4);
  });
  
  test('useInventoryItems should handle empty inventory', () => {
    const { result } = renderHook(() => useInventoryItems(), { 
      wrapper: ({ children }) => (
        <TestCampaignStateProvider initialState={createTestState([])}>
          {children}
        </TestCampaignStateProvider>
      )
    });
    
    expect(result.current).toEqual([]);
    expect(result.current.length).toBe(0);
  });
  
  test('useInventoryItems should handle undefined inventory', () => {
    const { result } = renderHook(() => useInventoryItems(), { 
      wrapper: ({ children }) => (
        <TestCampaignStateProvider initialState={{ inventory: { items: undefined } }}>
          {children}
        </TestCampaignStateProvider>
      )
    });
    
    expect(result.current).toEqual([]);
    expect(result.current.length).toBe(0);
  });
  
  test('useInventoryItem should return an item by ID', () => {
    // Use our helper function with the full item set
    const testState = createTestState(sampleItems);
    
    const { result } = renderHook(() => useInventoryItem('2'), { 
      wrapper: ({ children }) => (
        <TestCampaignStateProvider initialState={testState}>
          {children}
        </TestCampaignStateProvider>
      )
    });
    
    expect(result.current).toEqual({
      id: '2',
      name: 'Knife',
      description: 'A sharp hunting knife',
      category: 'weapon',
      quantity: 1,
      isEquipped: false
    });
  });
  
  test('useInventoryItem should return undefined for non-existent item', () => {
    // Use our helper function with the full item set
    const testState = createTestState(sampleItems);
    
    const { result } = renderHook(() => useInventoryItem('999'), { 
      wrapper: ({ children }) => (
        <TestCampaignStateProvider initialState={testState}>
          {children}
        </TestCampaignStateProvider>
      )
    });
    
    expect(result.current).toBeUndefined();
  });
  
  test('useInventoryByCategory should filter items by category', () => {
    // Use our helper function with the full item set
    const testState = createTestState(sampleItems);
    
    const { result } = renderHook(() => useInventoryByCategory('weapon'), { 
      wrapper: ({ children }) => (
        <TestCampaignStateProvider initialState={testState}>
          {children}
        </TestCampaignStateProvider>
      )
    });
    
    expect(result.current.length).toBe(2);
    expect(result.current[0].name).toBe('Revolver');
    expect(result.current[1].name).toBe('Knife');
  });
  
  test('useWeapons should return all weapon items', () => {
    // Use our helper function with the full item set
    const testState = createTestState(sampleItems);
    
    const { result } = renderHook(() => useWeapons(), { 
      wrapper: ({ children }) => (
        <TestCampaignStateProvider initialState={testState}>
          {children}
        </TestCampaignStateProvider>
      )
    });
    
    expect(result.current.length).toBe(2);
    expect(result.current[0].category).toBe('weapon');
    expect(result.current[1].category).toBe('weapon');
  });
  
  test('useEquippedWeapon should return the equipped weapon', () => {
    // Use our helper function with the full item set
    const testState = createTestState(sampleItems);
    
    const { result } = renderHook(() => useEquippedWeapon(), { 
      wrapper: ({ children }) => (
        <TestCampaignStateProvider initialState={testState}>
          {children}
        </TestCampaignStateProvider>
      )
    });
    
    expect(result.current).toEqual({
      id: '1',
      name: 'Revolver',
      description: 'A reliable six-shooter',
      category: 'weapon',
      quantity: 1,
      isEquipped: true
    });
  });
  
  test('useInventoryStats should calculate correct statistics', () => {
    // Use our helper function with the full item set
    const testState = createTestState(sampleItems);
    
    const { result } = renderHook(() => useInventoryStats(), { 
      wrapper: ({ children }) => (
        <TestCampaignStateProvider initialState={testState}>
          {children}
        </TestCampaignStateProvider>
      )
    });
    
    expect(result.current).toEqual({
      totalItems: 4,
      totalQuantity: 7, // 1 + 1 + 3 + 2
      weaponCount: 2,
      healingCount: 1 // Only one medical item
    });
  });
});
