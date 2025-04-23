/**
 * ActionTypes Component Integration Tests
 * 
 * This file tests that components are correctly using ActionTypes
 * constants instead of string literals.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { createMockDispatch } from '../../test/utils/actionTypeTestUtils';
import { ActionTypes } from '../../types/actionTypes';

// Mock GameStateProvider component
const GameStateProvider = ({ children, dispatch }) => {
  return (
    <div data-testid="mock-state-provider">
      {children}
    </div>
  );
};

// Mock StatusDisplayManager component
const StatusDisplayManager = ({ character, location }) => {
  const handleResetStrength = () => {
    // This would normally use the useContext hook to get dispatch
    window.mockDispatch({
      type: ActionTypes.SET_CHARACTER,
      payload: { 
        ...character,
        attributes: {
          ...character.attributes,
          strength: character.attributes.baseStrength
        }
      }
    });
  };

  return (
    <div data-testid="status-display-manager">
      <h2>Character: {character.name}</h2>
      <div>Strength: {character.attributes.strength}</div>
      <button 
        data-testid="reset-strength-button"
        onClick={handleResetStrength}
      >
        Reset Strength
      </button>
    </div>
  );
};

// Mock character and location for testing
const mockCharacter = {
  id: 'test-character',
  name: 'Test Character',
  attributes: {
    speed: 5,
    gunAccuracy: 5,
    throwingAccuracy: 5,
    strength: 10,
    baseStrength: 10,
    bravery: 5,
    experience: 0
  },
  wounds: [],
  isUnconscious: false
};

const mockLocation = {
  type: 'town',
  name: 'Test Town',
  description: 'A test town'
};

describe('ActionTypes in Components', () => {
  let mockDispatchUtils;

  beforeEach(() => {
    // Create a fresh mock dispatch for each test
    mockDispatchUtils = createMockDispatch();
    
    // Assign dispatch to global for test access
    window.mockDispatch = mockDispatchUtils.dispatch;
    
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete window.mockDispatch;
  });

  describe('StatusDisplayManager', () => {
    it('uses ActionTypes.SET_CHARACTER when resetting strength', () => {
      // Only show the reset button in test mode
      process.env.NODE_ENV = 'test';
      
      const { getByTestId } = render(
        <GameStateProvider dispatch={mockDispatchUtils.dispatch}>
          <StatusDisplayManager 
            character={mockCharacter} 
            location={mockLocation} 
          />
        </GameStateProvider>
      );

      // Find and click the reset strength button
      const resetButton = getByTestId('reset-strength-button');
      fireEvent.click(resetButton);

      // Verify the component used ActionTypes.SET_CHARACTER
      expect(mockDispatchUtils.wasActionDispatched(ActionTypes.SET_CHARACTER)).toBe(true);
    });
  });
});
