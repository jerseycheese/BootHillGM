import React from 'react';
import { render, act } from '@testing-library/react';
import { CampaignStateProvider, useCampaignState } from './CampaignStateManager';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('CampaignStateManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('initializes with default state', () => {
    const TestComponent = () => {
      const { state } = useCampaignState();
      return <div data-testid="test">{JSON.stringify(state)}</div>;
    };

    const { getByTestId } = render(
      <CampaignStateProvider>
        <TestComponent />
      </CampaignStateProvider>
    );

    const testElement = getByTestId('test');
    const initialState = JSON.parse(testElement.textContent || '');

    expect(initialState.character).toBeNull();
    expect(initialState.currentLocation).toBe('');
    expect(initialState.gameProgress).toBe(0);
    expect(initialState.journal).toEqual([]);
    expect(initialState.narrative).toBe('');
    expect(initialState.inventory).toEqual([]);
  });

  test('updates state correctly', () => {
    const TestComponent = () => {
      const { state, dispatch } = useCampaignState();
      React.useEffect(() => {
        dispatch({ type: 'SET_CHARACTER', payload: { name: 'Test Character', health: 100 } });
        dispatch({ type: 'SET_LOCATION', payload: 'Test Town' });
      }, [dispatch]);
      return <div data-testid="test">{JSON.stringify(state)}</div>;
    };

    const { getByTestId } = render(
      <CampaignStateProvider>
        <TestComponent />
      </CampaignStateProvider>
    );

    const testElement = getByTestId('test');
    const updatedState = JSON.parse(testElement.textContent || '');

    expect(updatedState.character).toEqual({ name: 'Test Character', health: 100 });
    expect(updatedState.currentLocation).toBe('Test Town');
  });

  test('saves state to localStorage', () => {
    const TestComponent = () => {
      const { state, dispatch } = useCampaignState();
      React.useEffect(() => {
        dispatch({ type: 'SET_CHARACTER', payload: { name: 'Saved Character', health: 100 } });
      }, [dispatch]);
      return <div data-testid="test">{JSON.stringify(state)}</div>;
    };

    render(
      <CampaignStateProvider>
        <TestComponent />
      </CampaignStateProvider>
    );

    const savedState = JSON.parse(localStorage.getItem('campaignState') || '{}');
    expect(savedState.character).toEqual({ name: 'Saved Character', health: 100 });
  });

  test('loads state from localStorage', () => {
    localStorage.setItem('campaignState', JSON.stringify({
      character: { name: 'Loaded Character', health: 90 },
      currentLocation: 'Loaded Town',
      gameProgress: 5,
      journal: ['Entry 1'],
      narrative: 'Loaded narrative',
      inventory: [{ id: '1', name: 'Loaded Item', quantity: 1 }]
    }));

    const TestComponent = () => {
      const { state } = useCampaignState();
      return <div data-testid="test">{JSON.stringify(state)}</div>;
    };

    const { getByTestId } = render(
      <CampaignStateProvider>
        <TestComponent />
      </CampaignStateProvider>
    );

    const testElement = getByTestId('test');
    const loadedState = JSON.parse(testElement.textContent || '');

    expect(loadedState.character).toEqual({ name: 'Loaded Character', health: 90 });
    expect(loadedState.currentLocation).toBe('Loaded Town');
    expect(loadedState.gameProgress).toBe(5);
    expect(loadedState.journal).toEqual(['Entry 1']);
    expect(loadedState.narrative).toBe('Loaded narrative');
    expect(loadedState.inventory).toEqual([{ id: '1', name: 'Loaded Item', quantity: 1 }]);
  });
});