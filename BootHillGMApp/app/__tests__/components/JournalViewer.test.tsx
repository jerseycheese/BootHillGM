import React from 'react';
import { render, screen } from '@testing-library/react';
import JournalViewer from '../../components/JournalViewer';
import { JournalEntry } from '../../types/journal';

describe('JournalViewer', () => {
  const mockEntries: JournalEntry[] = [
    { timestamp: 1617235200000, content: 'First entry' },   // 04/01/2021
    { timestamp: 1617321600000, content: 'Second entry' },  // 04/02/2021
    { timestamp: 1617408000000, content: 'Third entry' },   // 04/03/2021
  ];

  it('renders without crashing', () => {
    render(<JournalViewer entries={[]} />);
    expect(screen.getByText('Journal')).toBeInTheDocument();
  });

  it('displays the correct number of journal entries', () => {
    render(<JournalViewer entries={mockEntries} />);
    const entries = screen.getAllByRole('listitem');
    expect(entries).toHaveLength(3);
  });

  it('displays journal entries in reverse chronological order', () => {
    render(<JournalViewer entries={mockEntries} />);
    const entries = screen.getAllByRole('listitem');
    expect(entries[0]).toHaveTextContent('Third entry');
    expect(entries[1]).toHaveTextContent('Second entry');
    expect(entries[2]).toHaveTextContent('First entry');
  });

  it('displays the correct timestamp and content for each entry', () => {
    render(<JournalViewer entries={mockEntries} />);
    expect(screen.getByText(/Third entry/)).toHaveTextContent('04/03/2021');
    expect(screen.getByText(/Second entry/)).toHaveTextContent('04/02/2021');
    expect(screen.getByText(/First entry/)).toHaveTextContent('04/01/2021');
  });

  it('displays a message when there are no entries', () => {
    render(<JournalViewer entries={[]} />);
    expect(screen.getByText('No journal entries yet.')).toBeInTheDocument();
  });
});