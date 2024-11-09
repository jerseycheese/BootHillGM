export type JournalEntryType = 'narrative' | 'combat' | 'inventory' | 'quest';

export interface BaseJournalEntry {
  timestamp: number;
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
