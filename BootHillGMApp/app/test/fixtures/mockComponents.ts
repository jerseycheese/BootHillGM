/**
 * Mock data for component testing
 * 
 * These fixtures provide consistent test data for snapshot tests.
 * Using these ensures tests are predictable and snapshots don't change
 * due to random data.
 */

// Fixed timestamp for consistent date rendering
export const FIXED_TIMESTAMP = 1648635000000; // March 30, 2022

// Mock player decisions with different variations
export const mockPlayerDecisions = {
  critical: {
    id: 'decision-critical',
    prompt: 'The outlaw has drawn his gun. What do you do?',
    context: 'The entire saloon has gone silent. This decision could mean life or death.',
    importance: 'critical' as const,
    options: [
      { id: 'option-1', text: 'Draw your gun', impact: 'Likely to result in a gunfight' },
      { id: 'option-2', text: 'Try to reason with him', impact: 'May avoid bloodshed but risky' },
      { id: 'option-3', text: 'Dive for cover', impact: 'Avoid the immediate danger but may escalate tension' },
    ],
    associatedCharacters: ['Outlaw Joe', 'Sheriff Miller'],
    location: { type: 'town' as const, name: 'Dusty Saloon' },
    timestamp: FIXED_TIMESTAMP,
    aiGenerated: false,
  },
  significant: {
    id: 'decision-significant',
    prompt: 'The bank manager offers you a loan. Do you accept?',
    context: 'This could determine your financial future in the town.',
    importance: 'significant' as const,
    options: [
      { id: 'option-1', text: 'Accept the loan', impact: 'Gain immediate funds but incur debt' },
      { id: 'option-2', text: 'Decline politely', impact: 'Maintain independence but limit short-term options' },
      { id: 'option-3', text: 'Negotiate better terms', impact: 'Might get a better deal but risk offending him' },
    ],
    associatedCharacters: ['Bank Manager'],
    location: { type: 'town' as const, name: 'First National Bank' },
    timestamp: FIXED_TIMESTAMP,
    aiGenerated: false,
  },
  moderate: {
    id: 'decision-moderate',
    prompt: 'Will you help the rancher with his cattle drive?',
    context: 'It would take a few days but could earn you some cash and respect.',
    importance: 'moderate' as const,
    options: [
      { id: 'option-1', text: 'Agree to help', impact: 'Earn money and reputation with ranchers' },
      { id: 'option-2', text: 'Decline the offer', impact: 'Free to pursue other opportunities' },
      { id: 'option-3', text: 'Negotiate payment', impact: 'Might get better pay but seem greedy' },
    ],
    associatedCharacters: ['Rancher Williams'],
    location: { type: 'wilderness' as const, description: 'Ranch Outside Town' },
    timestamp: FIXED_TIMESTAMP,
    aiGenerated: false,
  },
  minor: {
    id: 'decision-minor',
    prompt: 'The bartender offers you a whiskey on the house. Accept?',
    context: 'A small gesture of goodwill.',
    importance: 'minor' as const,
    options: [
      { id: 'option-1', text: 'Accept gratefully', impact: 'Gain slight favor with the bartender' },
      { id: 'option-2', text: 'Decline politely', impact: 'Maintain sobriety but might seem standoffish' },
    ],
    associatedCharacters: ['Bartender'],
    location: { type: 'town' as const, name: 'Local Saloon' },
    timestamp: FIXED_TIMESTAMP,
    aiGenerated: false,
  },
  noOptions: {
    id: 'decision-no-options',
    prompt: 'What will you do next?',
    context: 'You stand at a crossroads with many possibilities.',
    importance: 'moderate' as const,
    options: [],
    associatedCharacters: [],
    location: { type: 'town' as const, name: 'Town Center' },
    timestamp: FIXED_TIMESTAMP,
    aiGenerated: false,
  },
  noContext: {
    id: 'decision-no-context',
    prompt: 'Do you approach the stranger?',
    importance: 'moderate' as const,
    options: [
      { id: 'option-1', text: 'Yes', impact: 'Might make a new friend or enemy' },
      { id: 'option-2', text: 'No', impact: 'Avoid potential trouble' },
    ],
    associatedCharacters: ['Stranger'],
    location: { type: 'town' as const, name: 'Main Street' },
    timestamp: FIXED_TIMESTAMP,
    context: '', // Add missing context
    aiGenerated: false,
  },
};

import { NarrativeJournalEntry, CombatJournalEntry, InventoryJournalEntry, QuestJournalEntry } from '../../types/journal';
// Removed unused LocationType import

// Mock journal entries for testing
export const mockJournalEntries: {
  narrative: NarrativeJournalEntry;
  combat: CombatJournalEntry;
  inventory: InventoryJournalEntry;
  quest: QuestJournalEntry;
} = {
  narrative: {
    id: 'narrative-entry-1',
    type: 'narrative',
    timestamp: FIXED_TIMESTAMP,
    content: 'You arrive at the dusty town of Redemption as the sun begins to set.',
    narrativeSummary: 'Arrived at Redemption',
    title: 'Arrival', // Add optional title
  },
  combat: {
    id: 'combat-entry-1',
    title: 'Bandit Fight', // Add optional title
    type: 'combat',
    timestamp: FIXED_TIMESTAMP + 3600000, // 1 hour later
    content: 'You defeated the bandit with your trusty six-shooter.',
    // Removed non-existent combatResult property
    narrativeSummary: 'Defeated a bandit',
    // Add missing CombatJournalEntry properties
    combatants: { player: 'Player', opponent: 'Bandit' },
    outcome: 'victory',
  },
  inventory: {
    id: 'inventory-entry-1',
    title: 'Looting', // Add optional title
    type: 'inventory',
    timestamp: FIXED_TIMESTAMP + 7200000, // 2 hours later
    content: 'Inventory updated',
    items: {
      acquired: ['Whiskey', 'Ammunition'],
      removed: ['Bandage'],
    },
  },
  quest: {
    id: 'quest-entry-1',
    title: 'Quest Update', // Add optional title
    type: 'quest',
    timestamp: FIXED_TIMESTAMP + 10800000, // 3 hours later
    content: 'Started a new quest',
    questTitle: 'The Missing Sheriff',
    status: 'started', // Corrected status value
  },
};

// Define a type for the entry keys to make it safer
type EntryType = keyof typeof mockJournalEntries;

// Utility function to combine mock entries in different ways
export function createMockEntryList(types: EntryType[]) {
  return types.map(type => mockJournalEntries[type]);
}
