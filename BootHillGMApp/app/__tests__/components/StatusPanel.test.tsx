import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StatusPanel from '../../components/StatusPanel';
import { Character } from '../../types/character';

// Assuming StatusPanelProps is defined like this
interface StatusPanelProps {
  character: Character;
  location: string | null;
  onSave: () => void; // Adjust the type as needed
}

describe('StatusPanel', () => {
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
    wounds: [],
    isUnconscious: false
  };

  const mockSave = jest.fn();

  beforeEach(() => {
    mockSave.mockClear();
  });

  test('renders character information correctly', () => {
    render(<StatusPanel character={mockCharacter} location="Test Town" onSave={mockSave} />);
    
    expect(screen.getByText(/Name: Test Character/)).toBeInTheDocument();
    expect(screen.getByText(/Location: Test Town/)).toBeInTheDocument();
  });

  test('displays "Unknown" when location is null', () => {
    render(<StatusPanel character={mockCharacter} location={null} onSave={mockSave} />);
    
    expect(screen.getByText(/Location: Unknown/)).toBeInTheDocument();
  });
});
