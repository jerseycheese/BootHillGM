/**
 * JournalManager handles creation and management of game journal entries.
 * Supports multiple entry types with filtering and search capabilities.
 */
import { AIService } from '../services/ai/aiService';
import { cleanText } from './textCleaningUtils';
import { generateUUID } from './uuidGenerator';
import {
  JournalEntry,
  NarrativeJournalEntry,
  CombatJournalEntry,
  InventoryJournalEntry,
  JournalFilter
} from '../types/journal';
import { createNarrativeEntry } from './journal/narrativeEntryUtils';
import { createCombatEntry } from './journal/combatEntryUtils';
import { createInventoryEntry } from './journal/inventoryEntryUtils';
import { createFallbackSummary, entryMatchesSearch } from './journal/journalUtils';

// Default AIService instance
export const defaultAIService = new AIService();

// Legacy exports for backward compatibility
export const addJournalEntry = async (
  journal: JournalEntry[],
  entry: string | JournalEntry,
  aiService = defaultAIService
): Promise<JournalEntry[]> => {
  return JournalManager.addJournalEntry(journal, entry, aiService);
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
  if (!journal || !journal.length) return '';
  const recentEntries = journal.slice(-3);
  return recentEntries.map(entry => entry.content).join('\n');
};

export const filterJournal = (journal: JournalEntry[], filter: JournalFilter): JournalEntry[] => {
  return JournalManager.filterJournal(journal, filter);
};

// Type for unknown entry
interface UnknownEntry {
  id?: string;
  timestamp?: number;
  title?: string;
  type?: string;
  content?: string;
  narrativeSummary?: string;
  [key: string]: unknown;
}

export class JournalManager {
  /**
   * Adds a narrative entry to the journal with AI-generated summary
   */
  static async addNarrativeEntry(
    journal: JournalEntry[],
    content: string,
    context?: string,
    aiService = defaultAIService
  ): Promise<JournalEntry[]> {
    if (!journal) journal = [];
    
    try {
      const prevEntry = journal.length > 0 ? journal[journal.length - 1] : undefined;
      const newEntry = await createNarrativeEntry(content, context, prevEntry, aiService);
      return [...journal, newEntry];
    } catch (error) {
      console.error('Error creating narrative entry:', error);
      const fallbackEntry = this.createFallbackNarrativeEntry(content);
      return [...journal, fallbackEntry];
    }
  }

  /**
   * Creates a fallback narrative entry when AI generation fails
   */
  private static createFallbackNarrativeEntry(content: string): NarrativeJournalEntry {
    const characterNameMatch = content.match(/([A-Z][a-z]+)(?:\s+steps|\s+walks|\s+enters|\s+arrives)/);
    const characterName = characterNameMatch ? characterNameMatch[1] : 'The character';
    
    let fallbackSummary = `${characterName} embarks on a new journey in the frontier town of Boot Hill.`;
    
    // Ensure consistent punctuation
    if (!fallbackSummary.endsWith('.') && 
        !fallbackSummary.endsWith('!') && 
        !fallbackSummary.endsWith('?')) {
      fallbackSummary += '.';
    }
    
    return {
      id: generateUUID(),
      title: 'New Adventure',
      type: 'narrative',
      timestamp: Date.now(),
      content: cleanText(content),
      narrativeSummary: fallbackSummary
    };
  }

  /**
   * Adds a combat entry to the journal
   */
  static addCombatEntry(
    journal: JournalEntry[],
    playerName: string,
    opponentName: string,
    outcome: CombatJournalEntry['outcome'],
    summary: string
  ): JournalEntry[] {
    if (!journal) journal = [];
    const newEntry = createCombatEntry(playerName, opponentName, outcome, summary);
    return [...journal, newEntry];
  }

  /**
   * Adds an inventory entry to the journal
   */
  static addInventoryEntry(
    journal: JournalEntry[],
    acquiredItems: string[],
    removedItems: string[],
    context: string
  ): JournalEntry[] {
    if (!journal) journal = [];
    
    if (!acquiredItems?.length && !removedItems?.length) {
      return journal;
    }

    const newEntry = createInventoryEntry(acquiredItems, removedItems, context);
    return [...journal, newEntry];
  }

  /**
   * Filters journal entries based on type, date range, and search text
   */
  static filterJournal(journal: JournalEntry[], filter: JournalFilter): JournalEntry[] {
    if (!journal) return [];
    
    return journal.filter(entry => {
      if (filter.type && entry.type !== filter.type) return false;
      if (filter.startDate && entry.timestamp < filter.startDate) return false;
      if (filter.endDate && entry.timestamp > filter.endDate) return false;
      if (filter.searchText && !entryMatchesSearch(entry, filter.searchText)) return false;
      return true;
    });
  }

  /**
   * Adds a journal entry, handling both string and JournalEntry inputs
   */
  static async addJournalEntry(
    journal: JournalEntry[],
    entry: string | JournalEntry,
    aiService = defaultAIService
  ): Promise<JournalEntry[]> {
    if (!journal) journal = [];
    
    // Handle string entries (narrative)
    if (typeof entry === 'string') {
      return this.addNarrativeEntry(journal, entry, undefined, aiService);
    }
    
    // Handle existing JournalEntry objects
    const timestamp = entry.timestamp || Date.now();
    const id = entry.id || generateUUID();
    
    // Process based on entry type
    switch (entry.type) {
      case 'narrative': {
        const narrativeEntry = entry as NarrativeJournalEntry;
        return this.processExistingNarrativeEntry(journal, narrativeEntry, timestamp, id, aiService);
      }
      case 'combat': {
        const combatEntry = entry as CombatJournalEntry;
        return this.processExistingCombatEntry(journal, combatEntry, timestamp, id);
      }
      case 'inventory': {
        const inventoryEntry = entry as InventoryJournalEntry;
        return this.processExistingInventoryEntry(journal, inventoryEntry, timestamp, id);
      }
      case 'quest': {
        return [...journal, {
          ...entry,
          id,
          timestamp,
          type: 'quest',
          narrativeSummary: entry.narrativeSummary || 'A new quest has begun.'
        } as JournalEntry];
      }
      default: {
        // For unknown types, create a default narrative entry
        const unknownEntry = entry as UnknownEntry;
        const content = typeof unknownEntry.content === 'string' ? unknownEntry.content : '';
        const narrativeSummary = typeof unknownEntry.narrativeSummary === 'string' 
          ? unknownEntry.narrativeSummary 
          : undefined;
        
        return [...journal, {
          id,
          timestamp,
          title: typeof unknownEntry.title === 'string' ? unknownEntry.title : 'New Entry',
          type: 'narrative',
          content,
          narrativeSummary: narrativeSummary || createFallbackSummary(content)
        } as NarrativeJournalEntry];
      }
    }
  }

  /**
   * Processes an existing narrative entry
   */
  private static async processExistingNarrativeEntry(
    journal: JournalEntry[],
    entry: NarrativeJournalEntry,
    timestamp: number,
    id: string,
    aiService: AIService
  ): Promise<JournalEntry[]> {
    const cleanedContent = cleanText(entry.content);
    
    // Generate AI summary if one doesn't exist
    let narrativeSummary = entry.narrativeSummary;
    if (!narrativeSummary) {
      try {
        // Create context for summary generation
        const characterNameMatch = cleanedContent.match(/([A-Z][a-z]+)(?:\s+steps|\s+walks|\s+enters|\s+arrives)/);
        const characterContext = characterNameMatch 
          ? `Character ${characterNameMatch[1]} in Boot Hill.` 
          : 'Character in Boot Hill.';
          
        // Generate AI summary
        narrativeSummary = await aiService.generateNarrativeSummary(
          cleanedContent,
          characterContext
        );
        
        // Ensure consistent punctuation
        if (narrativeSummary && !narrativeSummary.endsWith('.') && 
            !narrativeSummary.endsWith('!') && 
            !narrativeSummary.endsWith('?')) {
          narrativeSummary += '.';
        }
      } catch (error) {
        console.error('Error generating narrative summary:', error);
        
        // Create a fallback summary
        const characterNameMatch = cleanedContent.match(/([A-Z][a-z]+)(?:\s+steps|\s+walks|\s+enters|\s+arrives)/);
        const characterName = characterNameMatch ? characterNameMatch[1] : 'The character';
        
        narrativeSummary = `${characterName} continues their adventure in Boot Hill.`;
      }
    }
    
    // Final fallback if we still don't have a summary
    if (!narrativeSummary) {
      narrativeSummary = createFallbackSummary(cleanedContent);
    }
    
    return [...journal, {
      ...entry,
      id,
      timestamp,
      type: 'narrative',
      content: cleanedContent,
      narrativeSummary
    } as NarrativeJournalEntry];
  }

  /**
   * Processes an existing combat entry
   */
  private static processExistingCombatEntry(
    journal: JournalEntry[],
    entry: CombatJournalEntry,
    timestamp: number,
    id: string
  ): JournalEntry[] {
    // Ensure narrativeSummary exists
    let combatSummary = entry.narrativeSummary;
    if (!combatSummary && entry.content) {
      const playerName = entry.combatants?.player || 'The character';
      const opponentName = entry.combatants?.opponent || 'an opponent';
      const outcome = entry.outcome || 'unknown';
      
      switch(outcome) {
        case 'victory':
          combatSummary = `${playerName} defeated ${opponentName} in combat.`;
          break;
        case 'defeat':
          combatSummary = `${playerName} was defeated by ${opponentName} in combat.`;
          break;
        default:
          combatSummary = `${playerName} engaged in combat with ${opponentName}.`;
      }
    }
    
    return [...journal, {
      ...entry,
      id,
      timestamp,
      type: 'combat',
      narrativeSummary: combatSummary || 'Combat occurred.'
    } as CombatJournalEntry];
  }

  /**
   * Processes an existing inventory entry
   */
  private static processExistingInventoryEntry(
    journal: JournalEntry[],
    entry: InventoryJournalEntry,
    timestamp: number,
    id: string
  ): JournalEntry[] {
    const acquiredItems = entry.items?.acquired || [];
    const removedItems = entry.items?.removed || [];
    
    let inventorySummary = entry.narrativeSummary;
    if (!inventorySummary) {
      const parts: string[] = [];
      if (acquiredItems.length) {
        parts.push(`Acquired: ${acquiredItems.join(', ')}`);
      }
      if (removedItems.length) {
        parts.push(`Used/Lost: ${removedItems.join(', ')}`);
      }
      
      // Ensure consistent punctuation
      inventorySummary = parts.join('. ');
      inventorySummary = inventorySummary.endsWith('.') ? inventorySummary : inventorySummary + '.';
    }
    
    return [...journal, {
      ...entry,
      id,
      timestamp,
      type: 'inventory',
      narrativeSummary: inventorySummary
    } as InventoryJournalEntry];
  }
}