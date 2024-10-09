import React from 'react';
import { render } from '@testing-library/react';
import { CampaignStateProvider, useCampaignState } from './CampaignStateManager';
import { Character } from '../types/character';

// Mock localStorage for testing purposes
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

// Replace the window.localStorage with our mock version
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('CampaignStateManager', () => {
  // Clear localStorage before each test
  beforeEach(() => {
    localStorage.clear();
  });

  // Test case: Check if the CampaignStateManager initializes with the default state
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

    // Verify that the initial state matches our expectations
    expect(initialState.character).toBeNull();
    expect(initialState.location).toBe('');
    expect(initialState.gameProgress).toBe(0);
    expect(initialState.journal).toEqual([]);
    expect(initialState.narrative).toBe('');
    expect(initialState.inventory).toEqual([]);
  });

  // Test case: Verify that the state updates correctly when actions are dispatched
  test('updates state correctly', () => {
    const TestComponent = () => {
      const { state, dispatch } = useCampaignState();
      React.useEffect(() => {
        const testCharacter: Character = {
          name: 'Test Character',
          health: 100,
          attributes: {
            speed: 10,
            gunAccuracy: 10,
            throwingAccuracy: 10,
            strength: 10,
            bravery: 10,
            experience: 5
          },
          skills: {
            shooting: 50,
            riding: 50,
            brawling: 50
          }
        };
        dispatch({ type: 'SET_CHARACTER', payload: testCharacter });
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

    // Verify that the state has been updated correctly
    expect(updatedState.character).toEqual({
      name: 'Test Character',
      health: 100,
      attributes: {
        speed: 10,
        gunAccuracy: 10,
        throwingAccuracy: 10,
        strength: 10,
        bravery: 10,
        experience: 5
      },
      skills: {
        shooting: 50,
        riding: 50,
        brawling: 50
      }
    });
    expect(updatedState.location).toBe('Test Town');
  });

  // Test case: Check if the state is saved to localStorage when updated
  test('saves state to localStorage', () => {
    const TestComponent = () => {
      const { state, dispatch } = useCampaignState();
      React.useEffect(() => {
        const savedCharacter: Character = {
          name: 'Saved Character',
          health: 100,
          attributes: {
            speed: 10,
            gunAccuracy: 10,
            throwingAccuracy: 10,
            strength: 10,
            bravery: 10,
            experience: 5
          },
          skills: {
            shooting: 50,
            riding: 50,
            brawling: 50
          }
        };
        dispatch({ type: 'SET_CHARACTER', payload: savedCharacter });
      }, [dispatch]);
      return <div data-testid="test">{JSON.stringify(state)}</div>;
    };

    render(
      <CampaignStateProvider>
        <TestComponent />
      </CampaignStateProvider>
    );

    // Verify that the state has been saved to localStorage
    const savedState = JSON.parse(localStorage.getItem('campaignState') || '{}');
    expect(savedState.character).toEqual({
      name: 'Saved Character',
      health: 100,
      attributes: {
        speed: 10,
        gunAccuracy: 10,
        throwingAccuracy: 10,
        strength: 10,
        bravery: 10,
        experience: 5
      },
      skills: {
        shooting: 50,
        riding: 50,
        brawling: 50
      }
    });
  });

  // Test case: Verify that the state is loaded from localStorage on initialization
  test('loads state from localStorage', () => {
    const testTimestamp = Date.now();
    // Set up a test state in localStorage
    localStorage.setItem('campaignState', JSON.stringify({
      character: {
        name: 'Loaded Character',
        health: 90,
        attributes: {
          speed: 11,
          gunAccuracy: 12,
          throwingAccuracy: 13,
          strength: 14,
          bravery: 15,
          experience: 6
        },
        skills: {
          shooting: 60,
          riding: 70,
          brawling: 80
        }
      },
      location: 'Loaded Town',
      gameProgress: 5,
      journal: [{ timestamp: testTimestamp, content: 'Entry 1' }],
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
  
    // Verify that the loaded state matches what we set in localStorage
    expect(loadedState.character).toEqual({
      name: 'Loaded Character',
      health: 90,
      attributes: {
        speed: 11,
        gunAccuracy: 12,
        throwingAccuracy: 13,
        strength: 14,
        bravery: 15,
        experience: 6
      },
      skills: {
        shooting: 60,
        riding: 70,
        brawling: 80
      }
    });
    expect(loadedState.location).toBe('Loaded Town');
    expect(loadedState.gameProgress).toBe(5);
    expect(loadedState.journal).toBeInstanceOf(Array);
    expect(loadedState.journal).toHaveLength(1);
    expect(loadedState.journal[0]).toHaveProperty('timestamp', testTimestamp);
    expect(loadedState.journal[0]).toHaveProperty('content', 'Entry 1');
    expect(loadedState.narrative).toBe('Loaded narrative');
    expect(loadedState.inventory).toEqual([{ id: '1', name: 'Loaded Item', quantity: 1 }]);
  });
});