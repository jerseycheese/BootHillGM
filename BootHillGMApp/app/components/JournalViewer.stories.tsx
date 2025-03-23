import React, { ReactElement } from 'react';
import JournalViewer from './JournalViewer';
import { JournalEntry } from '../types/journal';

// Type for story rendering function
type StoryRenderFn = () => ReactElement;

// Mock entries for stories
const mockNarrativeEntry: JournalEntry = {
  type: 'narrative',
  timestamp: Date.now() - 86400000, // Yesterday
  content: 'Arrived in Deadwood after a long journey.',
  narrativeSummary: 'Arrived in Deadwood'
};

const mockCombatEntry: JournalEntry = {
  type: 'combat',
  timestamp: Date.now() - 43200000, // 12 hours ago
  content: 'Engaged in a shootout with a local bandit.',
  combatants: {
    player: 'Sheriff Johnson',
    opponent: 'Bandit Joe'
  },
  outcome: 'victory',
  narrativeSummary: 'Defeated Bandit Joe in a shootout'
};

const mockInventoryEntry: JournalEntry = {
  type: 'inventory',
  timestamp: Date.now() - 21600000, // 6 hours ago
  content: 'Updated inventory after the fight.',
  items: {
    acquired: ['Revolver', 'Ammunition'],
    removed: ['Old Pistol']
  }
};

const mockQuestEntry: JournalEntry = {
  type: 'quest',
  timestamp: Date.now() - 10800000, // 3 hours ago
  content: 'Started tracking down the leader of the bandit gang.',
  questTitle: 'Hunt Down the Bandit Leader',
  status: 'started' // Fixed: Using a valid status value from the type definition
};

const meta = {
  title: 'Journal/JournalViewer',
  component: JournalViewer,
  parameters: {
    // Required for Next.js App Router compatibility
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ['autodocs'],
  // Define controls for the component props
  argTypes: {
    entries: { 
      control: 'object',
      description: 'Array of journal entries'
    },
  },
  // Add empty decorators array to match pattern in other stories
  decorators: [
    (Story: StoryRenderFn) => <Story />
  ]
};

export default meta;

// Empty journal
export const Empty = {
  args: {
    entries: []
  },
};

// Journal with narrative entries only
export const NarrativeEntries = {
  args: {
    entries: [mockNarrativeEntry]
  },
};

// Journal with combat entries only
export const CombatEntries = {
  args: {
    entries: [mockCombatEntry]
  },
};

// Journal with inventory entries only
export const InventoryEntries = {
  args: {
    entries: [mockInventoryEntry]
  },
};

// Journal with quest entries only
export const QuestEntries = {
  args: {
    entries: [mockQuestEntry]
  },
};

// Journal with all types of entries
export const MixedEntries = {
  args: {
    entries: [
      mockNarrativeEntry,
      mockCombatEntry,
      mockInventoryEntry,
      mockQuestEntry
    ]
  },
};

// Journal with many entries for scrolling
export const ManyEntries = {
  args: {
    entries: Array(20).fill(null).map((_, index) => ({
      ...mockNarrativeEntry,
      timestamp: Date.now() - (index * 3600000),
      content: `Journal entry ${index + 1}: ${mockNarrativeEntry.content}`,
      narrativeSummary: `Entry ${index + 1}: ${mockNarrativeEntry.narrativeSummary}`
    }))
  },
};