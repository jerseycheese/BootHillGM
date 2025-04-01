import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { TestCampaignStateProvider } from '../utils/testWrappers';
import { useGameSession } from '../../hooks/useGameSession';
import { InventoryManager } from '../../utils/inventoryManager';
import { getAIResponse } from '../../services/ai/gameService';
import { ItemCategory } from '../../types/item.types';
import * as useItemHandlerModule from '../../hooks/useItemHandler';

// Mock the dependencies
jest.mock('../../utils/inventoryManager', () => ({
  InventoryManager: {
    validateItemUse: jest.fn(() => ({ valid: true })),
  },
}));

jest.mock('../../services/ai/gameService', () => ({
  getAIResponse: jest.fn().mockResolvedValue({ 
    narrative: 'Mocked AI response.' 
  }),
}));

// Mock the location service which is used by useLocation
jest.mock('../../services/locationService', () => ({
  LocationService: {
    getInstance: jest.fn(() => ({
      updateLocationHistory: jest.fn((history, newLocation) => 
        history ? [...history, newLocation] : [newLocation]),
      getLocationDetail: jest.fn(() => ({})),
      getLocationsByType: jest.fn(() => []),
      getLocationHistory: jest.fn(() => []),
    })),
  },
  LocationType: {},
  LocationState: {},
}));

// Mock the necessary combat hooks
jest.mock('../../hooks/combat/useCombatState', () => ({
  useCombatState: jest.fn(() => ({
    isProcessing: false,
    setIsProcessing: jest.fn(),
    isUpdatingRef: { current: false },
    combatQueueLength: 0,
    stateProtection: { current: { withProtection: jest.fn(), getQueueLength: jest.fn() } }
  })),
}));

jest.mock('../../hooks/combat/useCombatActions', () => ({
  useCombatActions: jest.fn(() => ({
    handleStrengthChange: jest.fn(),
    executeCombatRound: jest.fn()
  })),
}));

// Mock useNarrativeUpdater hook
jest.mock('../../hooks/useNarrativeUpdater', () => ({
  useNarrativeUpdater: jest.fn(() => jest.fn()),
}));

// Mock the useLocation hook to avoid infinite loops
jest.mock('../../hooks/useLocation', () => ({
  useLocation: jest.fn(() => ({
    locationState: {
      currentLocation: { type: 'town', name: 'Boothill' },
      history: []
    },
    updateLocation: jest.fn()
  })),
}));

// Mock the useCombatManager hook to avoid circular dependencies
jest.mock('../../hooks/useCombatManager', () => ({
  useCombatManager: jest.fn(() => ({
    handleCombatEnd: jest.fn(),
    initiateCombat: jest.fn(),
    isProcessing: false
  })),
}));

// Mock useItemHandler hook to avoid undefined issues
jest.mock('../../hooks/useItemHandler', () => ({
  useItemHandler: jest.fn(() => ({
    handleUseItem: jest.fn(),
    isUsingItem: jest.fn(() => false),
    isLoading: false,
    error: null,
    setError: jest.fn()
  })),
}));

// Mock the selectors/typeGuards to provide consistent data
jest.mock('../../hooks/selectors/typeGuards', () => ({
  getItemsFromInventory: jest.fn(state => state?.inventory?.items || []),
  getEntriesFromJournal: jest.fn(state => state?.journal?.entries || [])
}));

describe('useGameSession', () => {
  const createInitialState = () => ({
    inventory: {
      items: [
        {
          id: 'test-item',
          name: 'Test Item',
          quantity: 1,
          description: 'A test item',
          category: 'general' as ItemCategory,
        }
      ]
    },
    journal: {
      entries: []
    },
    character: {
      player: {
        id: 'test-player',
        name: 'Test Player',
        attributes: {}
      }
    },
    combat: {
      opponent: null,
      isActive: false
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mocked functions to ensure tests don't interfere with each other
    (getAIResponse as jest.Mock).mockResolvedValue({ narrative: 'Mocked AI response.' });
    (InventoryManager.validateItemUse as jest.Mock).mockReturnValue({ valid: true });
    
    // Make sure the useItemHandler hook always returns a consistent value
    jest.spyOn(useItemHandlerModule, 'useItemHandler').mockReturnValue({
      handleUseItem: jest.fn().mockResolvedValue(true),
      isUsingItem: jest.fn(() => false),
      isLoading: false,
      error: null,
      setError: jest.fn()
    });
  });

  it('should return the basic state and functions', () => {
    const { result } = renderHook(() => useGameSession(), {
      wrapper: ({ children }) => (
        <TestCampaignStateProvider initialState={createInitialState()}>
          {children}
        </TestCampaignStateProvider>
      )
    });
    
    // Just check that the hook returns the expected API
    expect(result.current).toHaveProperty('state');
    expect(result.current).toHaveProperty('dispatch');
    expect(result.current).toHaveProperty('handleUserInput');
    expect(result.current).toHaveProperty('handleUseItem');
    expect(result.current).toHaveProperty('isUsingItem');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
  });
  
  it('should call useItemHandler with the correct item ID', async () => {
    // Mock the item handler implementation for this specific test
    const handleUseItemMock = jest.fn().mockResolvedValue(true);
    jest.spyOn(useItemHandlerModule, 'useItemHandler').mockReturnValue({
      handleUseItem: handleUseItemMock,
      isUsingItem: jest.fn(() => false),
      isLoading: false,
      error: null,
      setError: jest.fn()
    });
    
    const { result } = renderHook(() => useGameSession(), {
      wrapper: ({ children }) => (
        <TestCampaignStateProvider initialState={createInitialState()}>
          {children}
        </TestCampaignStateProvider>
      )
    });
    
    await act(async () => {
      await result.current.handleUseItem('test-item');
    });
    
    expect(handleUseItemMock).toHaveBeenCalledWith('test-item');
  });
  
  it('should synchronize errors from useItemHandler', async () => {
    // Set up an error in the useItemHandler hook
    jest.spyOn(useItemHandlerModule, 'useItemHandler').mockReturnValue({
      handleUseItem: jest.fn().mockRejectedValue(new Error('Test error')),
      isUsingItem: jest.fn(() => false),
      isLoading: false,
      error: 'Test error',
      setError: jest.fn()
    });
    
    const { result } = renderHook(() => useGameSession(), {
      wrapper: ({ children }) => (
        <TestCampaignStateProvider initialState={createInitialState()}>
          {children}
        </TestCampaignStateProvider>
      )
    });
    
    // No need to call handleUseItem - the error should already be synchronized
    expect(result.current.error).toBe('Test error');
  });
});
