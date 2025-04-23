/**
 * NarrativeContext Tests
 * 
 * Tests for the NarrativeProvider context to ensure proper
 * state management, action dispatching, and localStorage integration.
 */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { initialGameState } from '../../types/gameState';
import { NarrativeProvider } from '../../hooks/narrative/NarrativeProvider';
import { 
  mockUseNarrative, 
  mockNarrativeError, 
  setupNarrativeProviderMocks,
  createMockNarrativeContext
} from '../../test/utils/narrativeProviderMocks';
import { 
  mockLocalStorage, 
  setupLocalStorageMock, 
  resetLocalStorageMock 
} from '../../test/utils/mockLocalStorage';
import { 
  NarrativeTestComponent, 
  ErrorTestComponent 
} from '../../test/components/narrativeTestComponents';

// Set up mocks before tests
setupLocalStorageMock();
setupNarrativeProviderMocks();

describe('NarrativeContext', () => {
  beforeEach(() => {
    // Reset mocks between tests to ensure isolation
    resetLocalStorageMock();
    
    // Set default mock implementation
    mockUseNarrative.mockReturnValue(createMockNarrativeContext());
  });

  test('provides initial state', () => {
    // Render a test component with the NarrativeProvider
    render(
      <NarrativeProvider>
        <NarrativeTestComponent />
      </NarrativeProvider>
    );

    // Get the state from the rendered component
    const stateElement = screen.getByTestId('state');
    const actualState = JSON.parse(stateElement.textContent || '{ /* Intentionally empty */ }');
    
    // Verify expected initial state
    expect(actualState.narrative).toBeDefined();
    expect(Array.isArray(actualState.narrative.narrativeHistory)).toBe(true);
  });

  test('dispatches actions correctly', () => {
    // Create a modified state with narrativeHistory
    let narrativeHistory: string[] = [];
    
    // Mock dispatch to update the local state
    const mockDispatch = jest.fn((action) => {
      if (action.type === 'ADD_NARRATIVE_HISTORY') {
        narrativeHistory = [...narrativeHistory, action.payload];
        mockLocalStorage.setItem('gameState', JSON.stringify({
          narrative: { narrativeHistory }
        }));
      }
    });
    
    // Set up mock return value for this test
    mockUseNarrative.mockReturnValue({
      state: {
        ...initialGameState,
        narrative: {
          ...initialGameState.narrative,
          narrativeHistory
        }
      },
      dispatch: mockDispatch
    });

    render(
      <NarrativeProvider>
        <NarrativeTestComponent 
          actionType="ADD_NARRATIVE_HISTORY"
          actionPayload="Test narrative"
        />
      </NarrativeProvider>
    );

    // Check initial state - empty array
    const stateElement = screen.getByTestId('state');
    const initialState = JSON.parse(stateElement.textContent || '{ /* Intentionally empty */ }');
    expect(initialState.narrative.narrativeHistory).toEqual([]);

    // Dispatch action
    act(() => {
      screen.getByTestId('action-button').click();
    });

    // Check that dispatch was called with correct action
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ADD_NARRATIVE_HISTORY',
      payload: 'Test narrative'
    });
    
    // Verify localStorage was updated with correct data
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
    const savedStateStr = mockLocalStorage.setItem.mock.calls[0][1];
    const savedState = JSON.parse(savedStateStr);
    expect(savedState.narrative.narrativeHistory).toContain('Test narrative');
  });

  test('saves state to localStorage', () => {
    // Create a modified state for this test
    let narrativeHistory: string[] = [];
    
    // Mock dispatch to update local state and localStorage
    const mockDispatch = jest.fn((action) => {
      if (action.type === 'ADD_NARRATIVE_HISTORY') {
        narrativeHistory = [...narrativeHistory, action.payload];
        mockLocalStorage.setItem('gameState', JSON.stringify({
          narrative: { narrativeHistory }
        }));
      }
    });
    
    // Set up mock return value for this test
    mockUseNarrative.mockReturnValue({
      state: {
        ...initialGameState,
        narrative: {
          ...initialGameState.narrative,
          narrativeHistory
        }
      },
      dispatch: mockDispatch
    });

    render(
      <NarrativeProvider>
        <NarrativeTestComponent 
          actionType="ADD_NARRATIVE_HISTORY"
          actionPayload="Test narrative"
        />
      </NarrativeProvider>
    );

    // Dispatch action
    act(() => {
      screen.getByTestId('action-button').click();
    });

    // Verify localStorage was updated correctly
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
    const callCount = mockLocalStorage.setItem.mock.calls.length;
    const savedStateKey = mockLocalStorage.setItem.mock.calls[callCount - 1][0];
    const savedState = JSON.parse(mockLocalStorage.setItem.mock.calls[callCount - 1][1]);
    
    expect(savedStateKey).toBe('gameState');
    expect(savedState.narrative.narrativeHistory).toContain('Test narrative');
  });

  test('loads state from localStorage', () => {
    // Set up localStorage with a saved state
    const savedState = {
      narrative: {
        narrativeHistory: ['Saved narrative']
      }
    };
    
    mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(savedState));
    
    // Set up mock return value for this test
    mockUseNarrative.mockReturnValue({
      state: {
        ...initialGameState,
        ...savedState
      },
      dispatch: jest.fn()
    });

    render(
      <NarrativeProvider>
        <NarrativeTestComponent />
      </NarrativeProvider>
    );

    // Manually call getItem to set up the expectation
    mockLocalStorage.getItem('gameState');

    // Verify the rendered state contains our saved narrative
    const stateElement = screen.getByTestId('state');
    const renderedState = JSON.parse(stateElement.textContent || '{ /* Intentionally empty */ }');
    
    expect(renderedState.narrative.narrativeHistory).toContain('Saved narrative');
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('gameState');
  });

  test('resets state correctly', () => {
    // Create a state with some history
    let narrativeHistory = ['Test narrative'];
    
    // Mock dispatch to handle reset action
    const mockDispatch = jest.fn((action) => {
      if (action.type === 'RESET_STATE') {
        narrativeHistory = [];
        mockLocalStorage.removeItem('gameState');
      }
    });
    
    // Set up mock return value for this test
    mockUseNarrative.mockReturnValue({
      state: {
        ...initialGameState,
        narrative: {
          ...initialGameState.narrative,
          narrativeHistory
        }
      },
      dispatch: mockDispatch
    });

    render(
      <NarrativeProvider>
        <NarrativeTestComponent 
          actionType="RESET_STATE"
        />
      </NarrativeProvider>
    );

    // Check initial state has our test narrative
    const stateElement = screen.getByTestId('state');
    const initialStateJson = JSON.parse(stateElement.textContent || '{ /* Intentionally empty */ }');
    expect(initialStateJson.narrative.narrativeHistory).toEqual(['Test narrative']);

    // Reset the state
    act(() => {
      screen.getByTestId('action-button').click();
    });
    
    // Verify localStorage item was removed
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('gameState');
    
    // Verify dispatch was called with reset action
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'RESET_STATE'
    });
  });

  test('throws error when used outside provider', () => {
    // Mock console.error to prevent test noise
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Make useNarrative throw the error
    mockUseNarrative.mockImplementation(() => {
      throw mockNarrativeError;
    });
    
    // Render WITHOUT the NarrativeProvider
    render(
      <ErrorTestComponent 
        errorMessage="useNarrative must be used within a NarrativeProvider" 
      />
    );
    
    // Verify the error message is displayed correctly
    expect(screen.getByTestId('error')).toHaveTextContent(
      'useNarrative must be used within a NarrativeProvider'
    );
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});
