/**
 * Character Testing Utilities
 * 
 * Provides utilities for testing character-related components.
 */
import { render, RenderResult, screen } from '@testing-library/react';
import React from 'react';
import { CharacterForm } from '../../components/CharacterCreation/CharacterForm';

/**
 * Render the CharacterForm component for testing
 * 
 * @returns RenderResult with additional helpers for character form tests
 */
export const renderCharacterForm = (props = {}): RenderResult & { 
  generateButton: HTMLElement;
} => {
  // Define default mock props for the CharacterForm
  const defaultProps = {
    character: {
      id: 'test-character-id', // Added the required id field
      name: 'Test Character',
      attributes: {
        speed: 10,
        gunAccuracy: 10,
        throwingAccuracy: 10,
        strength: 10,
        baseStrength: 10,
        bravery: 10,
        experience: 5,
      },
      minAttributes: {
        speed: 1,
        gunAccuracy: 1,
        throwingAccuracy: 1,
        strength: 8,
        baseStrength: 8,
        bravery: 1,
        experience: 0,
      },
      maxAttributes: {
        speed: 20,
        gunAccuracy: 20,
        throwingAccuracy: 20,
        strength: 20,
        baseStrength: 20,
        bravery: 20,
        experience: 11,
      },
      wounds: [],
      isUnconscious: false,
      isNPC: false,
      isPlayer: true,
      inventory: [],
    },
    isGeneratingField: false,
    error: undefined,
    onFieldChange: jest.fn(),
    onGenerateField: jest.fn(),
    onSubmit: jest.fn(),
    generateCharacter: jest.fn(),
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
