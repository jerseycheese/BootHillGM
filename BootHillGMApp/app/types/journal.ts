export type JournalEntryType = 'narrative' | 'combat' | 'inventory' | 'quest';

export interface BaseJournalEntry {
  id: string;
  title?: string; // Added for test compatibility
  timestamp: number;
  content: string;
  narrativeSummary?: string; // Make sure this is defined in the base interface
}

export interface NarrativeJournalEntry extends BaseJournalEntry {
  type: 'narrative';
  // Add any other narrative-specific fields here
}

export interface CombatJournalEntry extends BaseJournalEntry {
  type: 'combat';
  combatants: {
    player: string;
    opponent: string;
  };
  outcome: 'victory' | 'defeat' | 'escape' | 'truce';
}

export interface InventoryJournalEntry extends BaseJournalEntry {
  type: 'inventory';
  items: {
    acquired: string[];
    removed: string[];
  };
}

export interface QuestJournalEntry extends BaseJournalEntry {
  type: 'quest';
  questTitle: string;
  status: 'started' | 'updated' | 'completed' | 'failed';
}

export type JournalEntry = 
  | NarrativeJournalEntry 
  | CombatJournalEntry 
  | InventoryJournalEntry 
  | QuestJournalEntry;

// Type for raw journal entries that might come from various sources
export interface RawJournalEntry {
  id?: string;
  timestamp?: number;
  content?: string;
  type?: string;
  narrativeSummary?: string;
  combatants?: { player: string; opponent: string };
  outcome?: string;
  items?: { acquired: string[]; removed: string[] };
  questTitle?: string;
  status?: string;
  [key: string]: unknown; // Index signature for any other properties
}

// Interface for entries with narrative summaries
export interface JournalEntryWithSummary {
  narrativeSummary: string;
}

// Enhanced journal entry with guaranteed narrativeSummary
export type EnhancedJournalEntry = JournalEntry & JournalEntryWithSummary;

// Type guards for better type safety
export const isNarrativeEntry = (entry: JournalEntry): entry is NarrativeJournalEntry => 
  entry.type === 'narrative';

export const isCombatEntry = (entry: JournalEntry): entry is CombatJournalEntry => 
  entry.type === 'combat';

export const isInventoryEntry = (entry: JournalEntry): entry is InventoryJournalEntry => 
  entry.type === 'inventory';

export const isQuestEntry = (entry: JournalEntry): entry is QuestJournalEntry => 
  entry.type === 'quest';

export interface JournalFilter {
  type?: JournalEntryType;
  startDate?: number;
  endDate?: number;
  searchText?: string;
}
