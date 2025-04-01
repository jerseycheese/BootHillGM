import { renderHook } from '@testing-library/react';
import {
  useInventoryItems,
  useInventoryItem,
  useWeapons,
  useInventoryByCategory,
  useInventoryStats,
  useEquippedWeapon
} from '../../hooks/selectors/useInventorySelectors';
import { createMockGameState } from '../../test/utils/inventoryTestUtils';
import { GameState } from '../../types/gameState';
import { useGame } from '../../hooks/useGame'; // Import useGame to mock it
import { InventoryItem } from '../../types/item.types';

// Mock the useGame hook
jest.mock('../../hooks/useGame', () => ({
  useGame: jest.fn(),
}));

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

  // Helper to create minimal state for inventory tests
  const createInventoryTestState = (items: InventoryItem[] | undefined = []): Partial<GameState> => ({
    // Use createMockGameState to ensure all slices are present, then override inventory
    ...createMockGameState(),
    inventory: { items: items }
  });

  beforeEach(() => {
    // Reset mocks before each test
    (useGame as jest.Mock).mockClear();
  });

  test('useInventoryItems should return all inventory items', () => {
    const testState = createInventoryTestState(sampleItems);
    (useGame as jest.Mock).mockReturnValue({ state: testState });

    const { result } = renderHook(() => useInventoryItems());

    expect(result.current).toEqual(sampleItems);
    expect(result.current.length).toBe(4);
  });

  test('useInventoryItems should handle empty inventory', () => {
    const testState = createInventoryTestState([]);
    (useGame as jest.Mock).mockReturnValue({ state: testState });
    const { result } = renderHook(() => useInventoryItems());

    expect(result.current).toEqual([]);
    expect(result.current.length).toBe(0);
  });

  test('useInventoryItems should handle undefined inventory slice', () => {
    const testState = createMockGameState({ inventory: undefined }); // State where inventory slice is undefined
    (useGame as jest.Mock).mockReturnValue({ state: testState });
    const { result } = renderHook(() => useInventoryItems());

    expect(result.current).toEqual([]);
    expect(result.current.length).toBe(0);
  });

   test('useInventoryItems should handle undefined items array', () => {
     const testState = createMockGameState({ inventory: { items: undefined } }); // State where items array is undefined
     (useGame as jest.Mock).mockReturnValue({ state: testState });
     const { result } = renderHook(() => useInventoryItems());

     expect(result.current).toEqual([]);
     expect(result.current.length).toBe(0);
   });


  test('useInventoryItem should return an item by ID', () => {
    const testState = createInventoryTestState(sampleItems);
    (useGame as jest.Mock).mockReturnValue({ state: testState });
    const { result } = renderHook(() => useInventoryItem('2'));

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
    const testState = createInventoryTestState(sampleItems);
    (useGame as jest.Mock).mockReturnValue({ state: testState });
    const { result } = renderHook(() => useInventoryItem('999'));

    expect(result.current).toBeUndefined();
  });

  test('useInventoryByCategory should filter items by category', () => {
    const testState = createInventoryTestState(sampleItems);
    (useGame as jest.Mock).mockReturnValue({ state: testState });
    const { result } = renderHook(() => useInventoryByCategory('weapon'));

    expect(result.current.length).toBe(2);
    expect(result.current[0].name).toBe('Revolver');
    expect(result.current[1].name).toBe('Knife');
  });

  test('useWeapons should return all weapon items', () => {
    const testState = createInventoryTestState(sampleItems);
    (useGame as jest.Mock).mockReturnValue({ state: testState });
    const { result } = renderHook(() => useWeapons());

    expect(result.current.length).toBe(2);
    expect(result.current[0].category).toBe('weapon');
    expect(result.current[1].category).toBe('weapon');
  });

  test('useEquippedWeapon should return the equipped weapon', () => {
    const testState = createInventoryTestState(sampleItems);
    (useGame as jest.Mock).mockReturnValue({ state: testState });
    const { result } = renderHook(() => useEquippedWeapon());

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
    const testState = createInventoryTestState(sampleItems);
    (useGame as jest.Mock).mockReturnValue({ state: testState });
    const { result } = renderHook(() => useInventoryStats());

    expect(result.current).toEqual({
      totalItems: 4,
      totalQuantity: 7, // 1 + 1 + 3 + 2
      weaponCount: 2,
      healingCount: 1 // Only one medical item
    });
  });
});
