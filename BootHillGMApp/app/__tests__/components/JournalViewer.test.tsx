import React from 'react';
import { render, screen } from '@testing-library/react';
import JournalViewer from '../../components/JournalViewer';
import { 
  NarrativeJournalEntry,
  CombatJournalEntry,
  InventoryJournalEntry,
  QuestJournalEntry 
} from '../../types/journal';

// Mock entries with full type coverage
const mockNarrativeEntry: NarrativeJournalEntry = {
  type: 'narrative',
  timestamp: 1617235200000,
  content: 'First entry',
  narrativeSummary: 'First narrative'
};

const mockCombatEntry: CombatJournalEntry = {
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

const mockInventoryEntry: InventoryJournalEntry = {
  type: 'inventory',
  timestamp: 1617408000000,
  content: 'Inventory changed',
  items: {
    acquired: ['Gun', 'Ammo'],
    removed: ['Money']
  },
  narrativeSummary: 'Inventory update'
};

const mockQuestEntry: QuestJournalEntry = {
  type: 'quest',
  timestamp: 1672531200000,
  content: 'Quest updated',
  questTitle: 'Find the treasure',
  status: 'updated',
  narrativeSummary: 'Quest progress'
};

describe('JournalViewer', () => {
  // Test basic rendering
  test('renders without crashing', () => {
    render(<JournalViewer entries={[]} />);
    expect(screen.getByText('Journal')).toBeInTheDocument();
  });

  test('renders empty state message when no entries', () => {
    render(<JournalViewer entries={[]} />);
    expect(screen.getByText('No journal entries yet.')).toBeInTheDocument();
  });

  // Test entry rendering with react-window virtualization
  test('renders virtualized list with entries', () => {
    const entries = [mockNarrativeEntry, mockCombatEntry, mockInventoryEntry, mockQuestEntry];
    render(<JournalViewer entries={entries} />);

    // Verify each entry type is rendered correctly
    expect(screen.getByText(/First narrative/)).toBeInTheDocument();
    expect(screen.getByText(/Combat: Player vs Bandit - victory/)).toBeInTheDocument();
    expect(screen.getByText(/Acquired: Gun, Ammo \| Removed: Money/)).toBeInTheDocument();
    expect(screen.getByText(/Find the treasure: updated/)).toBeInTheDocument();
  });

  // Test entry formatting
  test('formats different entry types correctly', () => {
    const entries = [mockNarrativeEntry];
    render(<JournalViewer entries={entries} />);

    // Test narrative entry formatting
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    }).format(mockNarrativeEntry.timestamp);

    expect(screen.getByText(RegExp(formattedDate))).toBeInTheDocument();
    expect(screen.getByText(/First narrative/)).toBeInTheDocument();
  });

  // Test timestamp sorting
  test('sorts entries by timestamp in descending order', () => {
    const entries = [mockNarrativeEntry, mockInventoryEntry, mockQuestEntry];
    render(<JournalViewer entries={entries} />);

    // Get all entry content and verify order
    const content = screen.getByText(/Find the treasure/);
    expect(content).toBeInTheDocument();
    
    // Verify quest entry (newest) appears in the list
    const questEntry = screen.getByText(/Find the treasure: updated/);
    expect(questEntry).toBeInTheDocument();
  });

  // Test fallback content
  test('uses content when narrativeSummary is not available', () => {
    const entryWithoutSummary: NarrativeJournalEntry = {
      type: 'narrative',
      timestamp: Date.now(),
      content: 'Entry without summary'
    };
    
    render(<JournalViewer entries={[entryWithoutSummary]} />);
    expect(screen.getByText(/Entry without summary/)).toBeInTheDocument();
  });

  // Test date formatting error handling
  test('handles invalid timestamp gracefully', () => {
    const entryWithInvalidDate: NarrativeJournalEntry = {
      type: 'narrative',
      timestamp: NaN,
      content: 'Invalid date entry'
    };
    
    render(<JournalViewer entries={[entryWithInvalidDate]} />);
    expect(screen.getByText('Invalid date', { selector: 'strong' })).toBeInTheDocument();
  });
});
