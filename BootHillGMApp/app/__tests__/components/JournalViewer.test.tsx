import React from 'react';
import { render, screen } from '@testing-library/react';
import JournalViewer from '../../components/JournalViewer';
import { NarrativeJournalEntry, CombatJournalEntry } from '../../types/journal';

describe('JournalViewer', () => {
  const mockNarrativeEntry: NarrativeJournalEntry = {
    id: 'narrative-1',
    type: 'narrative',
    timestamp: 1617235200000,
    content: 'Started the journey',
    narrativeSummary: 'A new adventure begins'
  };

  const mockCombatEntry: CombatJournalEntry = {
    id: 'combat-1',
    type: 'combat',
    timestamp: 1617321600000,
    content: 'Combat occurred',
    combatants: {
      player: 'Player',
      opponent: 'Bandit'
    },
    outcome: 'victory',
    narrativeSummary: 'Combat summary'
  };

  test('renders without crashing', () => {
    render(<JournalViewer entries={[]} />);
    expect(screen.getByText('Journal')).toBeInTheDocument();
  });

  test('renders empty state message', () => {
    render(<JournalViewer entries={[]} />);
    expect(screen.getByText('No journal entries yet.')).toBeInTheDocument();
  });

  test('renders entries with timestamps', () => {
    render(<JournalViewer entries={[mockNarrativeEntry, mockCombatEntry]} />);

    // Verify narrative entry
    expect(screen.getByText(/A new adventure begins/)).toBeInTheDocument();
    
    // Verify combat entry
    expect(screen.getByText(/Combat summary/)).toBeInTheDocument();

    // Check timestamp formatting
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    }).format(mockNarrativeEntry.timestamp);
    expect(screen.getByText(RegExp(formattedDate))).toBeInTheDocument();
  });

  test('handles invalid timestamps gracefully', () => {
    const entryWithInvalidDate: NarrativeJournalEntry = {
      id: 'invalid-timestamp',
      type: 'narrative',
      timestamp: NaN,
      content: 'Invalid date entry'
    };
    
    render(<JournalViewer entries={[entryWithInvalidDate]} />);
    expect(screen.getByText('Invalid date', { selector: 'strong' })).toBeInTheDocument();
  });

  test('handles undefined entries gracefully', () => {
    // @ts-expect-error - Testing with undefined entries to ensure component doesn't crash
    render(<JournalViewer entries={undefined} />);
    expect(screen.getByText('Journal')).toBeInTheDocument();
    // Should not show "No journal entries yet" message
    expect(screen.getByText('No journal entries yet.')).toBeInTheDocument();
  });

  test('handles null entries gracefully', () => {
    // @ts-expect-error - Testing with null entries to ensure component doesn't crash
    render(<JournalViewer entries={null} />);
    expect(screen.getByText('Journal')).toBeInTheDocument();
    // Should not show "No journal entries yet" message
    expect(screen.getByText('No journal entries yet.')).toBeInTheDocument();
  });
});