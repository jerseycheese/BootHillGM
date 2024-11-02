import React from 'react';
import { render, screen } from '@testing-library/react';
import { CombatStatus } from '../../../components/Combat/CombatStatus';

describe('CombatStatus', () => {
  test('renders health values correctly', () => {
    render(
      <CombatStatus
        playerHealth={100}
        opponentHealth={80}
      />
    );

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
  });

  test('applies red text class for low player health', () => {
    render(
      <CombatStatus
        playerHealth={20}
        opponentHealth={100}
      />
    );

    const playerHealthValue = screen.getByText('20');
    expect(playerHealthValue).toHaveClass('text-red-600');
  });

  test('applies red text class for low opponent health', () => {
    render(
      <CombatStatus
        playerHealth={100}
        opponentHealth={25}
      />
    );

    const opponentHealthValue = screen.getByText('25');
    expect(opponentHealthValue).toHaveClass('text-red-600');
  });

  test('does not apply red text class for normal health values', () => {
    render(
      <CombatStatus
        playerHealth={75}
        opponentHealth={85}
      />
    );

    const playerHealthValue = screen.getByText('75');
    const opponentHealthValue = screen.getByText('85');
    
    expect(playerHealthValue).not.toHaveClass('text-red-600');
    expect(opponentHealthValue).not.toHaveClass('text-red-600');
  });
});
