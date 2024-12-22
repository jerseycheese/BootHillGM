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
        type: 'narrative',
        timestamp: Date.now(),
        content: cleanedContent,
        narrativeSummary
      };
      
      return [...journal, newEntry];
    } catch {
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
   console.debug('JournalManager.addCombatEntry: summary:', summary);
    const cleanedSummary = cleanCombatLogEntry(summary);
    
    // Create a new combat journal entry
    const newEntry: CombatJournalEntry = {
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
   console.debug('JournalManager.addInventoryEntry: acquiredItems:', acquiredItems, 'removedItems:', removedItems, 'context:', context);

    // Create a new inventory journal entry
    const newEntry: InventoryJournalEntry = {
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

  // Backward compatibility method
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
         timestamp: timestamp,
          type: 'narrative',
          content: cleanedContent,
          narrativeSummary
        } as NarrativeJournalEntry];
      case 'combat':
        return [...journal, {
          ...entry,
          timestamp,
          type: 'combat'
        } as CombatJournalEntry];
     case 'inventory':
        return [...journal, {
         ...entry,
         timestamp: timestamp,
          type: 'inventory'
        } as InventoryJournalEntry];
     case 'quest':
       return [...journal, {
         ...entry,
         timestamp: timestamp,
          type: 'quest'
        } as JournalEntry];
      default:
        return [...journal, {
          ...entry,
          timestamp,
          type: 'narrative'
        } as NarrativeJournalEntry];
    }
  }
}
