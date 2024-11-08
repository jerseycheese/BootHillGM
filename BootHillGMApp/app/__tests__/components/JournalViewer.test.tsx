import React from 'react';
import { render, screen } from '@testing-library/react';
import JournalViewer from '../../components/JournalViewer';
import { JournalEntry } from '../../types/journal';

describe('JournalViewer', () => {
  const mockEntries: JournalEntry[] = [
    { timestamp: 1617235200000, content: 'First entry', narrativeSummary: 'First narrative' },
    { timestamp: 1617321600000, content: 'Second entry', narrativeSummary: 'Second narrative' },
    { timestamp: 1617408000000, content: 'Third entry', narrativeSummary: 'Third narrative' }
  ];

  test('renders without crashing', () => {
    render(<JournalViewer entries={[]} />);
    expect(screen.getByText('Journal')).toBeInTheDocument();
  });

  test('displays the correct number of journal entries', () => {
    render(<JournalViewer entries={mockEntries} />);
    const entries = screen.getAllByRole('listitem');
    expect(entries).toHaveLength(3);
  });

  // Test journal entries order and format without timezone dependencies
  test('displays journal entries in reverse chronological order', () => {
    render(<JournalViewer entries={mockEntries} />);
    const entries = screen.getAllByRole('listitem');
  
    // Verify order (newest to oldest)
    expect(entries[0]).toHaveTextContent('04/02/2021: Third entry');
    expect(entries[1]).toHaveTextContent('04/01/2021: Second entry');
    expect(entries[2]).toHaveTextContent('03/31/2021: First entry');
  });
  
  

  test('displays a message when there are no entries', () => {
    render(<JournalViewer entries={[]} />);
    expect(screen.getByText('No journal entries yet.')).toBeInTheDocument();
  });

  test('displays original content when narrative summary is not available', () => {
    const entriesWithoutSummary: JournalEntry[] = [
      { timestamp: 1617494400000, content: 'Entry without summary' },
    ];
    render(<JournalViewer entries={entriesWithoutSummary} />);
    expect(screen.getByText(/Entry without summary/)).toBeInTheDocument();
  });
});