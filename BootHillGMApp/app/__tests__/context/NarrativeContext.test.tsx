import { render, screen, act } from '@testing-library/react';
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
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('NarrativeContext', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  // Test context creation
  it('should create context with initial state', () => {
    const TestComponent = () => {
      const { state } = useNarrative();
      return <div>{JSON.stringify(state)}</div>;
    };

    render(
      <NarrativeProvider>
        <TestComponent />
      </NarrativeProvider>
    );

    expect(screen.getByText(JSON.stringify(initialNarrativeState))).toBeInTheDocument();
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
                  <div>{JSON.stringify(state)}</div>
                  <button onClick={() => dispatch({ type: 'RESET_NARRATIVE' })}>Reset</button>
              </>
          );
      };

      render(
          <NarrativeProvider>
              <TestComponent />
          </NarrativeProvider>
      );

      expect(screen.getByText(JSON.stringify(initialNarrativeState))).toBeInTheDocument();
      act(() => {
          screen.getByRole('button', { name: 'Reset' }).click();
      });
      expect(screen.getByText(JSON.stringify(initialNarrativeState))).toBeInTheDocument(); // State should be reset
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

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('narrativeState', JSON.stringify({ ...initialNarrativeState, narrativeHistory: ['New entry'] }));
  });

  it('should load state from localStorage', () => {
      const expectedState = { ...initialNarrativeState, narrativeHistory: ['Loaded entry'] };
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(expectedState));

      const TestComponent = () => {
        const { state } = useNarrative();
        return <div>{JSON.stringify(state)}</div>;
      };

      render(
        <NarrativeProvider>
          <TestComponent />
        </NarrativeProvider>
      );

      expect(screen.getByText(JSON.stringify(expectedState))).toBeInTheDocument();
  });

  // Test with reducer actions
  it('should update state when actions are dispatched', () => {
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
        screen.getByRole('button', {name: 'Set Flashback'}).click();
      });
      expect(screen.getByTestId('narrative-history')).toHaveTextContent(JSON.stringify(['New entry'])); // History shouldn't change
  });
});