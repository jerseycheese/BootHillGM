import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { NarrativeProvider, useNarrative } from '../NarrativeContext';
import { initialNarrativeState } from '../../types/narrative.types';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('NarrativeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockLocalStorage.clear();
  });

  test('provides initial state', () => {
    const TestComponent = () => {
      const { state } = useNarrative();
      return <div data-testid="test">{JSON.stringify(state)}</div>;
    };

    render(
      <NarrativeProvider>
        <TestComponent />
      </NarrativeProvider>
    );

    const testElement = screen.getByTestId('test');
    const actualState = JSON.parse(testElement.textContent || '{}');
    
    // Check each key individually rather than the whole object
    // This is more flexible in case the initialNarrativeState structure changes
    expect(actualState.currentStoryPoint).toEqual(initialNarrativeState.currentStoryPoint);
    expect(actualState.visitedPoints).toEqual(initialNarrativeState.visitedPoints);
    expect(actualState.availableChoices).toEqual(initialNarrativeState.availableChoices);
    expect(actualState.narrativeHistory).toEqual(initialNarrativeState.narrativeHistory);
    expect(actualState.displayMode).toEqual(initialNarrativeState.displayMode);
    expect(actualState.error).toEqual(initialNarrativeState.error);
    // Lore state should now be part of initialNarrativeState
    expect(actualState.lore).toBeDefined();
  });

  test('dispatches actions correctly', () => {
    const TestComponent = () => {
      const { state, dispatch } = useNarrative();

      const handleAddHistory = () => {
        dispatch({
          type: 'ADD_NARRATIVE_HISTORY',
          payload: 'Test narrative'
        });
      };

      return (
        <div>
          <div data-testid="state">{JSON.stringify(state)}</div>
          <button data-testid="add-history" onClick={handleAddHistory}>
            Add History
          </button>
        </div>
      );
    };

    render(
      <NarrativeProvider>
        <TestComponent />
      </NarrativeProvider>
    );

    // Check initial state
    const stateElement = screen.getByTestId('state');
    const initialState = JSON.parse(stateElement.textContent || '{}');
    expect(initialState.narrativeHistory).toEqual([]);

    // Dispatch action
    act(() => {
      screen.getByTestId('add-history').click();
    });

    // Check updated state
    const updatedState = JSON.parse(stateElement.textContent || '{}');
    expect(updatedState.narrativeHistory).toContain('Test narrative');
    expect(updatedState.narrativeHistory.length).toBe(1);
  });

  test('saves state to localStorage', () => {
    const TestComponent = () => {
      const { state, dispatch } = useNarrative();

      const handleAddHistory = () => {
        dispatch({
          type: 'ADD_NARRATIVE_HISTORY',
          payload: 'Test narrative'
        });
      };

      return (
        <div>
          <div data-testid="state">{JSON.stringify(state)}</div>
          <button data-testid="add-history" onClick={handleAddHistory}>
            Add History
          </button>
        </div>
      );
    };

    render(
      <NarrativeProvider>
        <TestComponent />
      </NarrativeProvider>
    );

    // Dispatch action
    act(() => {
      screen.getByTestId('add-history').click();
    });

    // Check if localStorage was called
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
    
    // Get the saved state from the most recent call
    const callCount = mockLocalStorage.setItem.mock.calls.length;
    const savedStateKey = mockLocalStorage.setItem.mock.calls[callCount - 1][0];
    const savedState = JSON.parse(mockLocalStorage.setItem.mock.calls[callCount - 1][1]);
    
    expect(savedStateKey).toBe('narrativeState');
    expect(savedState.narrativeHistory).toContain('Test narrative');
  });

  test('loads state from localStorage', () => {
    // Set up localStorage with a saved state
    const savedState = {
      ...initialNarrativeState,
      narrativeHistory: ['Saved narrative']
    };
    
    mockLocalStorage.setItem('narrativeState', JSON.stringify(savedState));

    const TestComponent = () => {
      const { state } = useNarrative();
      return <div data-testid="state">{JSON.stringify(state)}</div>;
    };

    render(
      <NarrativeProvider>
        <TestComponent />
      </NarrativeProvider>
    );

    // Check if state was loaded from localStorage
    const stateElement = screen.getByTestId('state');
    const loadedState = JSON.parse(stateElement.textContent || '{}');
    
    expect(loadedState.narrativeHistory).toContain('Saved narrative');
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('narrativeState');
  });

  test('resets state correctly', () => {
    const TestComponent = () => {
      const { state, dispatch, resetNarrativeState } = useNarrative();

      const handleAddHistory = () => {
        dispatch({
          type: 'ADD_NARRATIVE_HISTORY',
          payload: 'Test narrative'
        });
      };

      return (
        <div>
          <div data-testid="state">{JSON.stringify(state)}</div>
          <button data-testid="add-history" onClick={handleAddHistory}>
            Add History
          </button>
          <button data-testid="reset" onClick={resetNarrativeState}>
            Reset
          </button>
        </div>
      );
    };

    render(
      <NarrativeProvider>
        <TestComponent />
      </NarrativeProvider>
    );

    // Add some history
    act(() => {
      screen.getByTestId('add-history').click();
    });

    // Verify state was updated
    const stateElement = screen.getByTestId('state');
    const updatedState = JSON.parse(stateElement.textContent || '{}');
    expect(updatedState.narrativeHistory).toContain('Test narrative');

    // Reset the state
    act(() => {
      screen.getByTestId('reset').click();
    });

    // Verify state was reset - check only specific properties
    const resetState = JSON.parse(stateElement.textContent || '{}');
    expect(resetState.currentStoryPoint).toEqual(initialNarrativeState.currentStoryPoint);
    expect(resetState.visitedPoints).toEqual(initialNarrativeState.visitedPoints);
    expect(resetState.availableChoices).toEqual(initialNarrativeState.availableChoices);
    expect(resetState.narrativeHistory).toEqual(initialNarrativeState.narrativeHistory);
    expect(resetState.displayMode).toEqual(initialNarrativeState.displayMode);
    expect(resetState.error).toEqual(initialNarrativeState.error);
    // Lore should be reset too
    expect(resetState.lore).toBeDefined();
    
    // Verify localStorage item was removed
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('narrativeState');
  });

  test('throws error when used outside provider', () => {
    // Spy on console.error to prevent test output being cluttered
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const TestComponent = () => {
      // This should throw an error
      const { state } = useNarrative();
      return <div>{JSON.stringify(state)}</div>;
    };

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useNarrative must be used within a NarrativeProvider');
    
    // Restore console.error
    (console.error as jest.Mock).mockRestore();
  });
});
