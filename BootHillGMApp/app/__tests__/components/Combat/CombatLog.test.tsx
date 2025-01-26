import { render, screen } from '@testing-library/react';
import { CombatLog } from '../../../components/Combat/CombatLog';
import type { CombatSummary } from '../../../types/combat';

beforeEach(() => {
  HTMLElement.prototype.scrollIntoView = jest.fn();
});

describe('CombatLog', () => {
  const mockEntries = [
    { text: 'Hit landed', type: 'hit' as const, timestamp: 1 },
    { text: 'Attack missed', type: 'miss' as const, timestamp: 2 }
  ];

  const mockSummary: CombatSummary = {
    winner: 'player',
    results: 'Player wins the duel',
    stats: {
      rounds: 3,
      damageDealt: 15,
      damageTaken: 8
    }
  };

  it('renders combat log entries', () => {
    render(<CombatLog entries={mockEntries} />);
    expect(screen.getByText('Hit landed')).toBeInTheDocument();
    expect(screen.getByText('Attack missed')).toBeInTheDocument();
  });

  it('renders combat summary when combat ends', () => {
    render(
      <CombatLog 
        entries={mockEntries} 
        summary={mockSummary}
        isCombatEnded={true}
      />
    );
    
    expect(screen.getByText('Victory!')).toBeInTheDocument();
    expect(screen.getByText('Player wins the duel')).toBeInTheDocument();
    expect(screen.getByTestId('combat-summary-rounds')).toBeInTheDocument();
    expect(screen.getByTestId('combat-summary-damage-dealt')).toBeInTheDocument();
    expect(screen.getByTestId('combat-summary-damage-taken')).toBeInTheDocument();
  });

  it('shows combat log when combat is ongoing', () => {
    render(
      <CombatLog 
        entries={mockEntries} 
        summary={mockSummary}
        isCombatEnded={false}
      />
    );
    
    expect(screen.getByText('Hit landed')).toBeInTheDocument();
    expect(screen.queryByText('Victory!')).not.toBeInTheDocument();
  });
});