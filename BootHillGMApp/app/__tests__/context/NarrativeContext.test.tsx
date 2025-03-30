import { useEffect, useState } from "react";
import { render, screen, act, waitFor } from '@testing-library/react';
import { NarrativeProvider, useNarrative } from '../../context/NarrativeContext';
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
    reset: jest.fn(() => {
      store = {};
    })
  };
})();

const originalLocalStorage = window.localStorage;
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('NarrativeContext', () => {
  beforeEach(() => {
    mockLocalStorage.reset();
    jest.clearAllMocks();
  });

  // Test context creation
  it('should create context with initial state', () => {
    const TestComponent = () => {
      const { state } = useNarrative();
      return <div data-testid="state-content">{JSON.stringify(state)}</div>;
    };

    render(
      <NarrativeProvider>
        <TestComponent />
      </NarrativeProvider>
    );

    const stateContent = screen.getByTestId('state-content');
    const renderedState = JSON.parse(stateContent.textContent || '{}');
    
    // Check key properties individually
    expect(renderedState.currentStoryPoint).toEqual(initialNarrativeState.currentStoryPoint);
    expect(renderedState.visitedPoints).toEqual(initialNarrativeState.visitedPoints);
    expect(renderedState.availableChoices).toEqual(initialNarrativeState.availableChoices);
    expect(renderedState.narrativeHistory).toEqual(initialNarrativeState.narrativeHistory);
    expect(renderedState.displayMode).toEqual(initialNarrativeState.displayMode);
    expect(renderedState.error).toEqual(initialNarrativeState.error);
    // Check that lore is present
    expect(renderedState.lore).toBeDefined();
  });

  // Test useNarrative hook
  it('should throw error when useNarrative used outside provider', () => {
    const TestComponent = () => {
      useNarrative();
      return null;
    };

    // Suppress console.error to avoid cluttering test output
    const originalConsoleError = console.error;
    console.error = jest.fn();

    expect(() => render(<TestComponent />)).toThrowError('useNarrative must be used within a NarrativeProvider');

    // Restore console.error
    console.error = originalConsoleError;
  });

  // Test provider functionality
  it('should provide state and dispatch to children', () => {
    const TestComponent = () => {
      const { state, dispatch } = useNarrative();
      return (
        <>
          <div data-testid="state-content">{JSON.stringify(state)}</div>
          <button onClick={() => dispatch({ type: 'RESET_NARRATIVE' })}>Reset</button>
        </>
      );
    };

    render(
      <NarrativeProvider>
        <TestComponent />
      </NarrativeProvider>
    );

    const stateContent = screen.getByTestId('state-content');
    const initialState = JSON.parse(stateContent.textContent || '{}');
    
    // Check initial state has required properties
    expect(initialState.narrativeHistory).toEqual([]);
    
    act(() => {
      screen.getByRole('button', { name: 'Reset' }).click();
    });
    
    // After reset, state should match initial state
    const resetState = JSON.parse(stateContent.textContent || '{}');
    expect(resetState.narrativeHistory).toEqual([]);
  });

  // Test localStorage integration
  it('should save state to localStorage', () => {
    const TestComponent = () => {
      const { state, saveNarrativeState } = useNarrative();

      // Modify the state to trigger a save
      const newState = { ...state, narrativeHistory: ['New entry'] };

      return (
        <button onClick={() => saveNarrativeState(newState)}>Save</button>
      );
    };

    render(
      <NarrativeProvider>
        <TestComponent />
      </NarrativeProvider>
    );

    act(() => {
      screen.getByRole('button', { name: 'Save' }).click();
    });

    // Check localStorage.setItem was called
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'narrativeState', 
      expect.stringContaining('New entry')
    );
  });
  
  describe('localStorage loading', () => {
    const expectedState = { 
      ...initialNarrativeState, 
      narrativeHistory: ['Loaded entry'] 
    };
    
    beforeAll(() => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(expectedState));
    });
    
    afterAll(() => {
      mockLocalStorage.getItem.mockReset();
      Object.keys(originalLocalStorage).forEach(key => {
        window.localStorage[key] = originalLocalStorage[key];
      });
    });
    
    it('should load state from localStorage', async () => {
      const TestComponent = () => {
        const { state } = useNarrative();
        const [, setIsInitialized] = useState(false);
        useEffect(() => {
          const savedState = localStorage.getItem('narrativeState');
          if (savedState) {
            setIsInitialized(true);
          }
        }, []);
        return <div data-testid="state">{JSON.stringify(state)}</div>;
      };
      
      render(
        <NarrativeProvider>
          <TestComponent />
        </NarrativeProvider>
      );
    
      await waitFor(() => {
        expect(screen.getByTestId('state')).toHaveTextContent(/Loaded entry/);
      });
    });
    
    it('should load state from localStorage and contain Loaded entry', async () => {
      const TestComponent = () => {
        const { state } = useNarrative();
        const [, setIsInitialized] = useState(false);
        useEffect(() => {
          const savedState = localStorage.getItem('narrativeState');
          if (savedState) {
            setIsInitialized(true);
          }
        }, []);
        return <div data-testid="state">{JSON.stringify(state)}</div>;
      };
      
      render(<NarrativeProvider><TestComponent /></NarrativeProvider>);
      
      await waitFor(() => {
        expect(screen.getByTestId('state')).toHaveTextContent(/Loaded entry/);
      });
    });
  });

  // Test with reducer actions
  it('should update state when actions are dispatched', () => {
    mockLocalStorage.clear();
    const TestComponent = () => {
      const { state, dispatch } = useNarrative();
      return (
        <>
          <div data-testid="narrative-history">{JSON.stringify(state.narrativeHistory)}</div>
          <button onClick={() => dispatch({ type: 'ADD_NARRATIVE_HISTORY', payload: 'New entry' })}>Add History</button>
          <button onClick={() => dispatch({ type: 'SET_DISPLAY_MODE', payload: 'flashback' })}>Set Flashback</button>
        </>
      );
    };
    
    render(
      <NarrativeProvider>
        <TestComponent />
      </NarrativeProvider>
    );

    expect(screen.getByTestId('narrative-history')).toHaveTextContent(JSON.stringify([]));
    
    act(() => {
      screen.getByRole('button', { name: 'Add History' }).click();
    });
    
    expect(screen.getByTestId('narrative-history')).toHaveTextContent(JSON.stringify(['New entry']));

    act(() => {
      screen.getByRole('button', { name: 'Set Flashback' }).click();
    });
    
    expect(screen.getByTestId('narrative-history')).toHaveTextContent(JSON.stringify(['New entry'])); // History shouldn't change
  });
});
