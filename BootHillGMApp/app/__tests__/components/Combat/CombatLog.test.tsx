import React from 'react';
import { render, screen } from '@testing-library/react';
import { CombatLog } from '../../../components/Combat/CombatLog';

describe('CombatLog', () => {
  const mockEntries = [
    'Player hits Opponent with Colt Revolver for 5 damage!',
    'Opponent misses Player! [Roll: 85/62]'
  ];

  test('renders combat log with entries', () => {
    render(<CombatLog entries={mockEntries} />);
    
    expect(screen.getByTestId('combat-log')).toBeInTheDocument();
    expect(screen.getByTestId('combat-log')).toHaveAttribute('role', 'log');
    expect(screen.getByTestId('combat-log')).toHaveAttribute('aria-label', 'Combat log');
    
    mockEntries.forEach((entry, index) => {
      expect(screen.getByTestId(`combat-log-entry-${index}`)).toHaveTextContent(entry);
    });
  });

  test('renders empty combat log when no entries provided', () => {
    render(<CombatLog entries={[]} />);
    
    expect(screen.getByTestId('combat-log')).toBeInTheDocument();
    expect(screen.queryByTestId('combat-log-entry-0')).not.toBeInTheDocument();
  });
});
