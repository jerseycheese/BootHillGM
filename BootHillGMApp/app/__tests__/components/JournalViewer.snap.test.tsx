import React from 'react';
import { render } from '@testing-library/react';
import JournalViewer from '@/components/JournalViewer';
import { mockJournalEntries } from '@/test/fixtures/mockComponents';

// Mock formatDate to ensure consistent snapshots
const originalDate = global.Date;
beforeAll(() => {
  // Mock Date constructor to return a fixed date
  const mockDate = new Date(1648635000000); // March 30, 2022
  global.Date = class extends originalDate {
    constructor(date?: string | number | Date) { // Add optional type
      // If a date is provided, call the original constructor
      // Otherwise, initialize with the mock date's time
      super(date ? date : mockDate.getTime());
    }
    // Optionally override other static methods if needed, e.g., Date.now()
    static now() {
      return mockDate.getTime();
    }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any; // Assert the type for assignment to global.Date
});

afterAll(() => {
  global.Date = originalDate;
});

describe('JournalViewer snapshots', () => {
  it('matches snapshot with empty entries', () => {
    const { container } = render(<JournalViewer entries={[]} />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with narrative entry', () => {
    const { container } = render(<JournalViewer entries={[mockJournalEntries.narrative]} />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with combat entry', () => {
    const { container } = render(<JournalViewer entries={[mockJournalEntries.combat]} />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with inventory entry', () => {
    const { container } = render(<JournalViewer entries={[mockJournalEntries.inventory]} />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with quest entry', () => {
    const { container } = render(<JournalViewer entries={[mockJournalEntries.quest]} />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with multiple entries of different types', () => {
    const allEntries = [
      mockJournalEntries.narrative,
      mockJournalEntries.combat,
      mockJournalEntries.inventory,
      mockJournalEntries.quest,
    ];
    const { container } = render(<JournalViewer entries={allEntries} />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with entries in reverse chronological order', () => {
    // Confirm the sort function works by reversing the order
    const reversedEntries = [
      mockJournalEntries.quest,
      mockJournalEntries.inventory,
      mockJournalEntries.combat,
      mockJournalEntries.narrative,
    ];
    const { container } = render(<JournalViewer entries={reversedEntries} />);
    expect(container).toMatchSnapshot();
  });

  it('renders with accessible attributes', () => {
    const { getByTestId } = render(<JournalViewer entries={[mockJournalEntries.narrative]} />);
    const journalViewer = getByTestId('journal-viewer');
    expect(journalViewer).toBeInTheDocument();
    expect(journalViewer).toMatchSnapshot();
  });
});
