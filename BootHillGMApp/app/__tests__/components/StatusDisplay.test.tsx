import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusDisplay } from '../../components/StatusDisplay';
import { Character } from '../../types/character';

describe('StatusDisplay', () => {
  const mockCharacter: Character = {
    isNPC: false,
    isPlayer: true,
    id: 'test-id',
    name: 'Test Character',
    inventory: [],
    isUnconscious: false,
    attributes: {
      strength: 15,
      baseStrength: 15,
      speed: 9,
      gunAccuracy: 8,
      throwingAccuracy: 8,
      bravery: 12,
      experience: 0,
    },
    wounds: [],
    strengthHistory: {
      baseStrength: 15,
      changes: []
    }
  };

  it('renders current strength value', () => {
    render(<StatusDisplay character={mockCharacter} />);
    expect(screen.getByTestId('status-display-strength-value')).toHaveTextContent('15 STR');
  });

  it('does not show strength history when no changes exist', () => {
    render(<StatusDisplay character={mockCharacter} />);
    expect(screen.queryByTestId('strength-history')).not.toBeInTheDocument();
  });

  it('shows strength history when changes exist', () => {
    const characterWithHistory: Character = {
      ...mockCharacter,
      strengthHistory: {
        baseStrength: 15,
        changes: [
          {
            previousValue: 15,
            newValue: 12,
            reason: 'damage',
            timestamp: new Date('2025-02-13T16:30:00')
          },
          {
            previousValue: 12,
            newValue: 8,
            reason: 'damage',
            timestamp: new Date('2025-02-13T16:31:00')
          }
        ]
      }
    };

    render(<StatusDisplay character={characterWithHistory} />);
    
    const historySection = screen.getByTestId('strength-history');
    expect(historySection).toBeInTheDocument();
    
    // Check if changes are displayed in reverse chronological order
    const changes = screen.getAllByTestId(/strength-change-/);
    expect(changes).toHaveLength(2);
    expect(changes[0]).toHaveTextContent('12 → 8');
    expect(changes[1]).toHaveTextContent('15 → 12');
  });

  it('applies correct color based on strength value', () => {
    // Test critical strength (red)
    const criticalCharacter = {
      ...mockCharacter,
      attributes: { ...mockCharacter.attributes, strength: 1 }
    };
    const { rerender } = render(<StatusDisplay character={criticalCharacter} />);
    expect(screen.getByTestId('status-display-strength-value')).toHaveClass('text-red-600');

    // Test low strength (yellow)
    const lowCharacter = {
      ...mockCharacter,
      attributes: { ...mockCharacter.attributes, strength: 4 }
    };
    rerender(<StatusDisplay character={lowCharacter} />);
    expect(screen.getByTestId('status-display-strength-value')).toHaveClass('text-yellow-600');

    // Test normal strength (green)
    rerender(<StatusDisplay character={mockCharacter} />);
    expect(screen.getByTestId('status-display-strength-value')).toHaveClass('text-green-600');
  });
});
