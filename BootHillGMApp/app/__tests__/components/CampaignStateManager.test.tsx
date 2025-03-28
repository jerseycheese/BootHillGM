import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { CampaignStateProvider, useCampaignState } from '../../components/CampaignStateManager';
import { GameState } from '../../types/gameState';
import { ItemCategory } from '../../types/item.types';

// Mock the getAIResponse function to avoid actual API calls during tests
jest.mock('../../services/ai/gameService', () => ({
  getAIResponse: jest.fn().mockResolvedValue({
    narrative: 'Test narrative',
    context: {}
  })
}));

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Basic tests for the CampaignStateManager component
describe('CampaignStateManager', () => {
  // Reset localStorage and mocks before each test
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test('provides campaign state context with initial state', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CampaignStateProvider>
        {children}
      </CampaignStateProvider>
    );

    const { result } = renderHook(() => useCampaignState(), { wrapper });

    // Initial state should be set up with the adapter
    expect(result.current.state).toBeDefined();
    expect(result.current.dispatch).toBeDefined();

    // State should have the expected structure
    const state = result.current.state as GameState;
    
    // Check that character state exists with null player and opponent
    expect(state.character).toBeDefined();
    expect(state.player).toBeNull();
    expect(state.opponent).toBeNull();
    
    // Check that inventory exists with items array
    expect(state.inventory).toBeDefined();
    expect(Array.isArray(state.inventory.items)).toBe(true);
    
    // Check that narrative exists with the expected properties
    expect(state.narrative).toBeDefined();
    expect(state.narrative.currentStoryPoint).toBeNull();
    
    // Check that combat state exists and is not active
    expect(state.combat).toBeDefined();
    expect(state.isCombatActive).toBe(false);
  });
  
  test('dispatches actions correctly', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CampaignStateProvider>
        {children}
      </CampaignStateProvider>
    );

    const { result } = renderHook(() => useCampaignState(), { wrapper });

    // Wait for state initialization
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Dispatch a test action
    await act(async () => {
      result.current.dispatch({ 
        type: 'inventory/ADD_ITEM', 
        payload: { 
          id: 'test-item',
          name: 'Test Item',
          description: 'A test item',
          quantity: 1,
          category: 'general' as ItemCategory
        }
      });
      // Allow time for the state to update
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Verify the action was processed - make sure we have access to the updated state
    expect(result.current.inventory).toBeDefined();
    expect(result.current.inventory.length).toBeGreaterThan(0);
    expect(result.current.inventory[0].name).toBe('Test Item');
    
    // Also check the state directly
    expect(result.current.state.inventory.items).toBeDefined();
    expect(result.current.state.inventory.items.length).toBeGreaterThan(0);
    expect(result.current.state.inventory.items[0].name).toBe('Test Item');
  });
});
