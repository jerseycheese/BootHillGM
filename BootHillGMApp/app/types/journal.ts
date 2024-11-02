export type JournalEntryType = 'narrative' | 'combat' | 'inventory' | 'quest';

export interface BaseJournalEntry {
  timestamp: number;
  type: JournalEntryType;
  content: string;
  narrativeSummary?: string;
}

export interface NarrativeJournalEntry extends BaseJournalEntry {
  type: 'narrative';
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

export interface JournalFilter {
  type?: JournalEntryType;
  startDate?: number;
  endDate?: number;
  searchText?: string;
}
