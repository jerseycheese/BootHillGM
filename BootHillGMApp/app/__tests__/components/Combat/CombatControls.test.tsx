import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CombatControls } from '../../../components/Combat/CombatControls';

describe('CombatControls', () => {
  const mockAttack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders player turn indicator correctly', () => {
    render(
      <CombatControls
        currentTurn="player"
        isProcessing={false}
        onAttack={mockAttack}
      />
    );

    expect(screen.getByText("Player's Turn")).toHaveClass('bg-green-100');
    expect(screen.getByText("Opponent's Turn")).not.toHaveClass('bg-green-100');
  });

  test('shows attack button only during player turn', () => {
    const { rerender } = render(
      <CombatControls
        currentTurn="player"
        isProcessing={false}
        onAttack={mockAttack}
      />
    );

    expect(screen.getByText('Attack')).toBeInTheDocument();

    rerender(
      <CombatControls
        currentTurn="opponent"
        isProcessing={false}
        onAttack={mockAttack}
      />
    );

    expect(screen.queryByText('Attack')).not.toBeInTheDocument();
  });

  test('disables attack button when processing', () => {
    render(
      <CombatControls
        currentTurn="player"
        isProcessing={true}
        onAttack={mockAttack}
      />
    );

    expect(screen.queryByText('Attack')).not.toBeInTheDocument();
  });

  test('calls onAttack when attack button is clicked', () => {
    render(
      <CombatControls
        currentTurn="player"
        isProcessing={false}
        onAttack={mockAttack}
      />
    );

    fireEvent.click(screen.getByText('Attack'));
    expect(mockAttack).toHaveBeenCalledTimes(1);
  });
});
