import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useLocation } from '../../hooks/useLocation';
import { LocationType } from '../../services/locationService';
import { TestCampaignStateProvider } from '../utils/testWrappers';
import { ReactElement, ReactNode } from 'react';
import { CampaignState } from '../../types/campaign';
import { CampaignStateContextType } from '../../types/campaignState.types';

// Mock the LocationService to prevent network calls during tests
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
}));

describe('useLocation Hook', () => {
  beforeEach(() => {
    // Reset mocks between tests for clean state
    jest.clearAllMocks();
    
    // Mock localStorage to prevent browser API calls during tests
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => null);
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
  });

  it('should initialize with default state if no location provided', () => {
    // Create state with undefined location
    const initialState: Partial<CampaignState> = {
      location: undefined
    };
    
    // Use our test wrapper
    const { result } = renderHook(() => useLocation(), {
      wrapper: ({ children }) => (
        <TestCampaignStateProvider initialState={initialState}>
          {children}
        </TestCampaignStateProvider>
      )
    });
    
    // Should use default location
    expect(result.current.locationState.currentLocation).toEqual({ type: 'unknown' });
    expect(result.current.locationState.history).toEqual([]);
  });

  it('should use existing state if available', () => {
    // Create a location of type LocationType
    const location: LocationType = { type: 'town', name: 'Boothill' };
    
    // Create initial state with location
    const initialState: Partial<CampaignState> = {
      location
    };
    
    // Use our test wrapper
    const { result } = renderHook(() => useLocation(), {
      wrapper: ({ children }) => (
        <TestCampaignStateProvider initialState={initialState}>
          {children}
        </TestCampaignStateProvider>
      )
    });
    
    // Should use the location from state
    expect(result.current.locationState.currentLocation).toEqual({ type: 'town', name: 'Boothill' });
    // The history will be empty since we only provided the location
    expect(result.current.locationState.history).toEqual([]);
  });

  it('should dispatch location update', () => {
    // Start with empty state
    const initialState = {};
    
    // Create a wrapper that tracks dispatches
    const mockDispatch = jest.fn();
    
    interface ContextWithValue {
      props: {
        value: CampaignStateContextType;
        children: ReactNode;
      };
    }
    
    const { result } = renderHook(() => useLocation(), {
      wrapper: ({ children }) => {
        const originalContext = TestCampaignStateProvider({
          children: null,
          initialState: initialState
        }) as ReactElement & ContextWithValue;
        
        // Clone the context value with our mock dispatch
        const contextValue: CampaignStateContextType = {
          ...originalContext.props.value,
          dispatch: mockDispatch
        };
        
        // Create a new context provider with our modified value
        return React.cloneElement(
          originalContext,
          { value: contextValue },
          children
        );
      }
    });
    
    // Create a new location to use
    const newLocation: LocationType = { type: 'town', name: 'Testville' };
    
    // Call updateLocation
    act(() => {
      result.current.updateLocation(newLocation);
    });
    
    // Dispatch should be called with a SET_LOCATION action
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'SET_LOCATION'
    }));
    
    // The payload should contain the new location in a LocationState structure
    const payload = mockDispatch.mock.calls[0][0].payload;
    expect(payload).toHaveProperty('currentLocation', newLocation);
    expect(payload).toHaveProperty('history');
    expect(Array.isArray(payload.history)).toBe(true);
  });
});
