/**
 * Character Testing Utilities
 * 
 * Provides utilities for testing character-related components.
 */
import { render, RenderResult, screen } from '@testing-library/react';
import React from 'react';
import { CharacterForm } from '../../components/CharacterCreation/CharacterForm';

// Create browser-compatible mock functions
const createMockFn = () => {
  const fn = function(...args: any[]) {
    if (typeof fn.calls !== 'undefined') {
      fn.calls.push(args);
    }
    return fn.returnValue;
  };
  
  fn.calls = [] as any[][]; // Explicitly type calls
  fn.returnValue = undefined;
  
  fn.mockReturnValue = function(value: any) {
    fn.returnValue = value;
    return fn;
  };
  
  fn.mockImplementation = function(implementation: (...args: any[]) => any) { // Use specific function type
    const originalFn = fn;
    const newFn = function(...args: any[]) {
      if (typeof newFn.calls !== 'undefined') {
        newFn.calls.push(args);
      }
      return implementation(...args);
    };
    newFn.calls = originalFn.calls;
    newFn.returnValue = originalFn.returnValue;
    newFn.mockReturnValue = originalFn.mockReturnValue;
    newFn.mockImplementation = originalFn.mockImplementation;
    return newFn;
  };
  
  return fn;
};

/**
 * Render the CharacterForm component for testing
 * 
 * @returns RenderResult with additional helpers for character form tests
 */
export const renderCharacterForm = (props = { /* Intentionally empty */ }): RenderResult & { 
  generateButton: HTMLElement;
} => {
  // Define default mock props for the CharacterForm
  const defaultProps = {
    character: {
      id: 'test-character-id',
      name: 'Test Character',
      attributes: {
        speed: 10,
        gunAccuracy: 10,
        throwingAccuracy: 10,
        strength: 10,
        baseStrength: 10,
        bravery: 10,
        experience: 5
      },
      minAttributes: {
        speed: 1,
        gunAccuracy: 1,
        throwingAccuracy: 1,
        strength: 8,
        baseStrength: 8,
        bravery: 1,
        experience: 0
      },
      maxAttributes: {
        speed: 20,
        gunAccuracy: 20,
        throwingAccuracy: 20,
        strength: 20,
        baseStrength: 20,
        bravery: 20,
        experience: 11
      },
      wounds: [],
      isUnconscious: false,
      isNPC: false,
      isPlayer: true,
      inventory: {
        items: []
      },
    },
    isGeneratingField: false,
    error: undefined,
    onFieldChange: createMockFn(),
    onGenerateField: createMockFn().mockImplementation(() => Promise.resolve()), // Return Promise<void>
    onSubmit: createMockFn().mockImplementation(() => Promise.resolve()), // Return Promise<void>
    generateCharacter: createMockFn().mockImplementation(() => Promise.resolve()), // Return Promise<void>
    isGeneratingCharacter: false,
    ...props
  };
  
  // Render using React.createElement to avoid JSX
  const renderResult = render(React.createElement(CharacterForm, defaultProps));
  
  // Get the generate button
  const generateButton = screen.getByTestId('generate-character-button');
  
  return {
    ...renderResult,
    generateButton
  };
};
