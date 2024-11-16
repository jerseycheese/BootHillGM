import React from 'react';
import { render, screen } from '@testing-library/react';
import { Character } from '../../types/character';
import StatusDisplayManager from '../../components/StatusDisplayManager';

describe('StatusDisplayManager', () => {
  const mockCharacter: Character = {
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
    skills: {
      shooting: 50,
      riding: 50,
      brawling: 50
    },
    wounds: [
      {
        location: 'head',
        severity: 'light',
        strengthReduction: 1,
        turnReceived: 1
      },
      {
        location: 'chest',
        severity: 'serious',
        strengthReduction: 2,
        turnReceived: 2
      }
    ],
    isUnconscious: false
  };

  test('renders character information correctly', () => {
    render(<StatusDisplayManager character={mockCharacter} location="Test Town" />);
    
    expect(screen.getByText('Test Character')).toBeInTheDocument();
    expect(screen.getByText(/Test Town/)).toBeInTheDocument();
    expect(screen.getByText(/Strength: \d+\/10/)).toBeInTheDocument();
  });

  test('displays "Unknown" when location is null', () => {
    render(<StatusDisplayManager character={mockCharacter} location={null} />);
    
    expect(screen.getByText(/Unknown/)).toBeInTheDocument();
  });

  test('displays wounds correctly', () => {
    render(<StatusDisplayManager character={mockCharacter} location="Test Town" />);
    
    expect(screen.getByText('Wounds:')).toBeInTheDocument();
    expect(screen.getByText(/head - light/)).toBeInTheDocument();
    expect(screen.getByText(/chest - serious/)).toBeInTheDocument();

    // Check for strength reduction text with the correct format
    expect(screen.getByText('(-1 STR)')).toBeInTheDocument();
    expect(screen.getByText('(-2 STR)')).toBeInTheDocument();
  });

  test('displays unconscious state correctly', () => {
    const unconsciousCharacter = {
      ...mockCharacter,
      isUnconscious: true
    };
    render(<StatusDisplayManager character={unconsciousCharacter} location="Test Town" />);
    
    // Check for unconscious state in the correct format
    expect(screen.getByText('(Unconscious)')).toBeInTheDocument();
  });
});
