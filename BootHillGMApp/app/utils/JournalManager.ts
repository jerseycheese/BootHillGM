/**
 * JournalManager handles creation and management of game journal entries.
 * Supports multiple entry types (narrative, combat, inventory) with filtering
 * and search capabilities. Journal entries maintain narrative continuity and
 * track important game events.
 */
import { generateNarrativeSummary } from '../services/ai';
import { cleanText, cleanCombatLogEntry } from './textCleaningUtils';
import {
  JournalEntry,
  NarrativeJournalEntry,
  CombatJournalEntry,
  InventoryJournalEntry,
  JournalFilter
} from '../types/journal';

// Generate a UUID for use in tests and environments where crypto.randomUUID() is not available
function generateUUID(): string {
  // Simple UUID generation fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Use crypto.randomUUID if available, otherwise use our fallback
const getUUID = (): string => {
  try {
    return crypto.randomUUID();
  } catch {
    return generateUUID();
  }
};

// Legacy exports for backward compatibility
export const addJournalEntry = async (
  journal: JournalEntry[],
  entry: string | JournalEntry
): Promise<JournalEntry[]> => {
  return JournalManager.addJournalEntry(journal, entry);
};

export const addCombatJournalEntry = (
  journal: JournalEntry[],
  playerName: string,
  opponentName: string,
  outcome: CombatJournalEntry['outcome'],
  summary: string
): JournalEntry[] => {
  return JournalManager.addCombatEntry(journal, playerName, opponentName, outcome, summary);
};

export const getJournalContext = (journal: JournalEntry[]): string => {
  if (!journal.length) return '';
  const recentEntries = journal.slice(-3);
  return recentEntries.map(entry => entry.content).join('\n');
};

export const filterJournal = (journal: JournalEntry[], filter: JournalFilter): JournalEntry[] => {
  return JournalManager.filterJournal(journal, filter);
};

export class JournalManager {
  static async addNarrativeEntry(
    journal: JournalEntry[],
    content: string,
    context?: string
  ): Promise<JournalEntry[]> {
    try {
      const cleanedContent = cleanText(content);
      const narrativeSummary = await generateNarrativeSummary(cleanedContent, context ?? '');
      
      // Create a new narrative journal entry
      const newEntry: NarrativeJournalEntry = {
        id: getUUID(), // Use our safe UUID generator
        title: 'Narrative Update', // Add default title
        type: 'narrative',
        timestamp: Date.now(),
        content: cleanedContent,
        narrativeSummary
      };
      
      return [...journal, newEntry];
    } catch (error) {
      console.error('Error creating narrative entry:', error);
      return journal;
    }
  }

  static addCombatEntry(
    journal: JournalEntry[],
    playerName: string,
    opponentName: string,
    outcome: CombatJournalEntry['outcome'],
    summary: string
  ): JournalEntry[] {
    // Clean the summary and remove metadata
    const cleanedSummary = cleanCombatLogEntry(summary);
    
    // Create a new combat journal entry
    const newEntry: CombatJournalEntry = {
      id: getUUID(), // Use our safe UUID generator
      title: `Combat: ${playerName} vs ${opponentName}`, // Add title
      type: 'combat',
      timestamp: Date.now(),
      content: cleanedSummary,
      combatants: {
        player: playerName,
        opponent: opponentName
      },
      outcome,
      narrativeSummary: cleanedSummary
    };
    
    return [...journal, newEntry];
  }

  static addInventoryEntry(
    journal: JournalEntry[],
    acquiredItems: string[],
    removedItems: string[],
    context: string
  ): JournalEntry[] {
    if (acquiredItems.length === 0 && removedItems.length === 0) {
      return journal;
    }

    // Create a new inventory journal entry
    const newEntry: InventoryJournalEntry = {
      id: getUUID(), // Use our safe UUID generator
      title: 'Inventory Update', // Add title
      type: 'inventory',
      timestamp: Date.now(),
      content: cleanText(context),
      items: {
        acquired: acquiredItems,
        removed: removedItems
      },
      narrativeSummary: this.generateInventorySummary(acquiredItems, removedItems)
    };
    
    return [...journal, newEntry];
  }

  static filterJournal(journal: JournalEntry[], filter: JournalFilter): JournalEntry[] {
    return journal.filter(entry => {
      if (filter.type && entry.type !== filter.type) return false;
      if (filter.startDate && entry.timestamp < filter.startDate) return false;
      if (filter.endDate && entry.timestamp > filter.endDate) return false;
      if (filter.searchText && !this.entryMatchesSearch(entry, filter.searchText)) return false;
      return true;
    });
  }

  private static entryMatchesSearch(entry: JournalEntry, searchText: string): boolean {
    const searchLower = searchText.toLowerCase();
    return (
      entry.content.toLowerCase().includes(searchLower) ||
      (entry.narrativeSummary?.toLowerCase().includes(searchLower) ?? false)
    );
  }

  private static generateInventorySummary(acquired: string[], removed: string[]): string {
    const parts: string[] = [];
    if (acquired.length) {
      parts.push(`Acquired: ${acquired.join(', ')}`);
    }
    if (removed.length) {
      parts.push(`Used/Lost: ${removed.join(', ')}`);
    }
    return parts.join('. ');
  }

  /**
   * Adds a journal entry, handling both string and JournalEntry inputs
   * 
   * @param journal - Current journal entries array
   * @param entry - Either a string (for narrative entries) or JournalEntry object
   * @returns Updated journal entries array
   */
  static async addJournalEntry(
    journal: JournalEntry[],
    entry: string | JournalEntry
  ): Promise<JournalEntry[]> {
    if (typeof entry === 'string') {
      return this.addNarrativeEntry(journal, entry);
    }
    
    // If it's already a JournalEntry, ensure it has required fields
    const timestamp = entry.timestamp || Date.now();
    const type = entry.type || 'narrative';
    
    // Create a properly typed entry based on the type
    switch (type) {
      case 'narrative':
        const cleanedContent = cleanText(entry.content);
        const narrativeSummary = await generateNarrativeSummary(cleanedContent, '');
        return [...journal, {
          ...entry,
          id: entry.id || getUUID(),
          timestamp: timestamp,
          type: 'narrative',
          content: cleanedContent,
          narrativeSummary
        } as NarrativeJournalEntry];
      case 'combat':
        return [...journal, {
          ...entry,
          id: entry.id || getUUID(),
          timestamp,
          type: 'combat'
        } as CombatJournalEntry];
      case 'inventory':
        return [...journal, {
          ...entry,
          id: entry.id || getUUID(),
          timestamp: timestamp,
          type: 'inventory'
        } as InventoryJournalEntry];
      case 'quest':
        return [...journal, {
          ...entry,
          id: entry.id || getUUID(),
          timestamp: timestamp,
          type: 'quest'
        } as JournalEntry];
      default:
        return [...journal, {
          ...entry,
          id: entry.id || getUUID(),
          timestamp,
          type: 'narrative'
        } as NarrativeJournalEntry];
    }
  }
}
