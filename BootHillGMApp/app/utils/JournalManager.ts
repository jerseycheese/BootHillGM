/**
 * JournalManager handles creation and management of game journal entries.
 * Supports multiple entry types (narrative, combat, inventory) with filtering
 * and search capabilities. Journal entries maintain narrative continuity and
 * track important game events.
 */
import { AIService } from '../services/ai/aiService';
import { cleanText, cleanCombatLogEntry } from './textCleaningUtils';
import { generateUUID } from './uuidGenerator';
import {
  JournalEntry,
  NarrativeJournalEntry,
  CombatJournalEntry,
  InventoryJournalEntry,
  JournalFilter
} from '../types/journal';

// Create a default AIService instance for use when no service is provided
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

export class JournalManager {
  /**
   * Adds a narrative entry to the journal with AI-generated summary
   * 
   * @param journal - Current journal entries array
   * @param content - Text content of the narrative entry
   * @param context - Optional context for AI summary generation
   * @param aiService - Optional AIService instance for dependency injection
   * @returns Updated journal entries array
   */
  static async addNarrativeEntry(
    journal: JournalEntry[],
    content: string,
    context?: string,
    aiService = defaultAIService
  ): Promise<JournalEntry[]> {
    if (!journal) journal = [];
    try {
      const cleanedContent = cleanText(content);
      
      // Generate AI summary with enhanced context about the character
      let summaryContext = context || '';
      if (!summaryContext && journal.length > 0) {
        // If no context provided, use previous entries as context
        const prevEntry = journal[journal.length - 1];
        if (prevEntry) {
          summaryContext = `Previous journal entry: ${prevEntry.content}`;
        }
      }
      
      // Extract character name from content if available to enhance summary
      const characterNameMatch = cleanedContent.match(/([A-Z][a-z]+)(?:\s+steps|\s+walks|\s+enters|\s+arrives)/);
      if (characterNameMatch && !summaryContext.includes('character')) {
        summaryContext = `Character ${characterNameMatch[1]}. ${summaryContext}`;
      }
      
      // Ensure we generate a proper summary rather than using truncated text
      const narrativeSummary = await aiService.generateNarrativeSummary(
        cleanedContent,
        summaryContext
      );
      
      // Make sure the summary is a complete sentence with proper punctuation
      let finalSummary = narrativeSummary || '';
      if (finalSummary && !finalSummary.endsWith('.') && 
          !finalSummary.endsWith('!') && 
          !finalSummary.endsWith('?')) {
        finalSummary += '.';
      }
      
      // Create a new narrative journal entry
      const newEntry: NarrativeJournalEntry = {
        id: generateUUID(),
        title: 'New Adventure',
        type: 'narrative',
        timestamp: Date.now(),
        content: cleanedContent,
        narrativeSummary: finalSummary || this.createFallbackSummary(cleanedContent)
      };
      
      return [...journal, newEntry];
    } catch (error) {
      console.error('Error creating narrative entry:', error);
      
      // Create an enhanced fallback entry with better summary
      const characterNameMatch = content.match(/([A-Z][a-z]+)(?:\s+steps|\s+walks|\s+enters|\s+arrives)/);
      const characterName = characterNameMatch ? characterNameMatch[1] : 'The character';
      
      let fallbackSummary = `${characterName} embarks on a new journey in the frontier town of Boot Hill.`;
      
      // Ensure consistent punctuation
      if (!fallbackSummary.endsWith('.') && 
          !fallbackSummary.endsWith('!') && 
          !fallbackSummary.endsWith('?')) {
        fallbackSummary += '.';
      }
      
      const fallbackEntry: NarrativeJournalEntry = {
        id: generateUUID(),
        title: 'New Adventure',
        type: 'narrative',
        timestamp: Date.now(),
        content: cleanText(content),
        narrativeSummary: fallbackSummary
      };
      
      return [...journal, fallbackEntry];
    }
  }

  /**
   * Creates a simple fallback summary when AI generation fails
   */
  private static createFallbackSummary(content: string): string {
    if (!content) return 'New journal entry added.';
    
    // Extract first sentence if possible
    const firstSentenceMatch = content.match(/^([^.!?]+[.!?])/);
    if (firstSentenceMatch) {
      return firstSentenceMatch[0];
    }
    
    // If no clear sentence, create a summary of first 50 chars
    if (content.length <= 50) {
      // Ensure it ends with a period for consistency
      return content.endsWith('.') ? content : content + '.';
    }
    
    // Find the last space before the 50 char limit to avoid cutting words
    const truncated = content.substring(0, 50);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    const summary = lastSpaceIndex === -1 
      ? truncated + '...' 
      : truncated.substring(0, lastSpaceIndex) + '...';
      
    return summary;
  }

  /**
   * Adds a combat entry to the journal
   * 
   * @param journal - Current journal entries array
   * @param playerName - Name of the player character
   * @param opponentName - Name of the opponent
   * @param outcome - Result of the combat encounter
   * @param summary - Text summary of the combat
   * @returns Updated journal entries array
   */
  static addCombatEntry(
    journal: JournalEntry[],
    playerName: string,
    opponentName: string,
    outcome: CombatJournalEntry['outcome'],
    summary: string
  ): JournalEntry[] {
    if (!journal) journal = [];
    
    // Clean the summary and remove metadata
    const cleanedSummary = cleanCombatLogEntry(summary);
    
    // Create a more readable summary
    let narrativeSummary = '';
    switch(outcome) {
      case 'victory':
        narrativeSummary = `${playerName} defeated ${opponentName} in combat.`;
        break;
      case 'defeat':
        narrativeSummary = `${playerName} was defeated by ${opponentName} in combat.`;
        break;
      case 'draw':
        narrativeSummary = `${playerName} and ${opponentName} fought to a draw.`;
        break;
      case 'escape':
        narrativeSummary = `${playerName} escaped from combat with ${opponentName}.`;
        break;
      default:
        narrativeSummary = `${playerName} and ${opponentName} engaged in combat.`;
    }
    
    // Create a new combat journal entry
    const newEntry: CombatJournalEntry = {
      id: generateUUID(),
      title: `Combat: ${playerName} vs ${opponentName}`,
      type: 'combat',
      timestamp: Date.now(),
      content: cleanedSummary,
      combatants: {
        player: playerName,
        opponent: opponentName
      },
      outcome,
      narrativeSummary
    };
    
    return [...journal, newEntry];
  }

  /**
   * Adds an inventory entry to the journal
   * 
   * @param journal - Current journal entries array
   * @param acquiredItems - Array of item names that were acquired
   * @param removedItems - Array of item names that were removed
   * @param context - Context for the inventory change
   * @returns Updated journal entries array
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

    // Create a new inventory journal entry
    const newEntry: InventoryJournalEntry = {
      id: generateUUID(),
      title: 'Inventory Update',
      type: 'inventory',
      timestamp: Date.now(),
      content: cleanText(context || ''),
      items: {
        acquired: acquiredItems || [],
        removed: removedItems || []
      },
      narrativeSummary: this.generateInventorySummary(acquiredItems || [], removedItems || [])
    };
    
    return [...journal, newEntry];
  }

  /**
   * Filters journal entries based on type, date range, and search text
   * 
   * @param journal - Journal entries to filter
   * @param filter - Filter criteria
   * @returns Filtered journal entries
   */
  static filterJournal(journal: JournalEntry[], filter: JournalFilter): JournalEntry[] {
    if (!journal) return [];
    
    return journal.filter(entry => {
      if (filter.type && entry.type !== filter.type) return false;
      if (filter.startDate && entry.timestamp < filter.startDate) return false;
      if (filter.endDate && entry.timestamp > filter.endDate) return false;
      if (filter.searchText && !this.entryMatchesSearch(entry, filter.searchText)) return false;
      return true;
    });
  }

  /**
   * Checks if a journal entry matches the search text
   * 
   * @param entry - Journal entry to check
   * @param searchText - Text to search for
   * @returns True if the entry matches the search, false otherwise
   */
  private static entryMatchesSearch(entry: JournalEntry, searchText: string): boolean {
    if (!searchText) return true;
    
    const searchLower = searchText.toLowerCase();
    return !!(
      (entry.content && entry.content.toLowerCase().includes(searchLower)) ||
      (entry.narrativeSummary && entry.narrativeSummary.toLowerCase().includes(searchLower))
    );
  }

  /**
   * Generates a summary of inventory changes
   * 
   * @param acquired - Array of acquired item names
   * @param removed - Array of removed item names
   * @returns Formatted summary string
   */
  private static generateInventorySummary(acquired: string[], removed: string[]): string {
    const parts: string[] = [];
    if (acquired && acquired.length) {
      parts.push(`Acquired: ${acquired.join(', ')}`);
    }
    if (removed && removed.length) {
      parts.push(`Used/Lost: ${removed.join(', ')}`);
    }
    
    // Ensure consistent punctuation
    const summary = parts.join('. ');
    return summary.endsWith('.') ? summary : summary + '.';
  }

  /**
   * Adds a journal entry, handling both string and JournalEntry inputs
   * 
   * @param journal - Current journal entries array
   * @param entry - Either a string (for narrative entries) or JournalEntry object
   * @param aiService - Optional AIService instance for dependency injection
   * @returns Updated journal entries array
   */
  static async addJournalEntry(
    journal: JournalEntry[],
    entry: string | JournalEntry,
    aiService = defaultAIService
  ): Promise<JournalEntry[]> {
    if (!journal) journal = [];
    
    if (typeof entry === 'string') {
      return this.addNarrativeEntry(journal, entry, undefined, aiService);
    }
    
    // If it's already a JournalEntry, ensure it has required fields
    const timestamp = entry.timestamp || Date.now();
    const type = entry.type || 'narrative';
    
    // Create a properly typed entry based on the type
    switch (type) {
      case 'narrative':
        const cleanedContent = cleanText(entry.content);
        // Generate AI summary if one doesn't exist
        let narrativeSummary = entry.narrativeSummary;
        if (!narrativeSummary) {
          try {
            // Create a better context for summary generation
            const characterNameMatch = cleanedContent.match(/([A-Z][a-z]+)(?:\s+steps|\s+walks|\s+enters|\s+arrives)/);
            const characterContext = characterNameMatch 
              ? `Character ${characterNameMatch[1]} in Boot Hill.` 
              : 'Character in Boot Hill.';
              
            // Generate proper AI summary
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
            
            // Create a fallback summary that's not just the first sentence
            const characterNameMatch = cleanedContent.match(/([A-Z][a-z]+)(?:\s+steps|\s+walks|\s+enters|\s+arrives)/);
            const characterName = characterNameMatch ? characterNameMatch[1] : 'The character';
            
            narrativeSummary = `${characterName} continues their adventure in Boot Hill.`;
          }
        }
        
        // Final fallback if we still don't have a summary
        if (!narrativeSummary) {
          narrativeSummary = this.createFallbackSummary(cleanedContent);
        }
        
        return [...journal, {
          ...entry,
          id: entry.id || generateUUID(),
          timestamp: timestamp,
          type: 'narrative',
          content: cleanedContent,
          narrativeSummary
        } as NarrativeJournalEntry];
      case 'combat':
        // Ensure narrativeSummary exists
        let combatSummary = entry.narrativeSummary;
        if (!combatSummary && entry.content) {
          const combatEntry = entry as Partial<CombatJournalEntry>;
          const playerName = combatEntry.combatants?.player || 'The character';
          const opponentName = combatEntry.combatants?.opponent || 'an opponent';
          const outcome = combatEntry.outcome || 'unknown';
          
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
          id: entry.id || generateUUID(),
          timestamp,
          type: 'combat',
          narrativeSummary: combatSummary || 'Combat occurred.'
        } as CombatJournalEntry];
      case 'inventory':
        const inventoryEntry = entry as Partial<InventoryJournalEntry>;
        const acquiredItems = inventoryEntry.items?.acquired || [];
        const removedItems = inventoryEntry.items?.removed || [];
        const inventorySummary = entry.narrativeSummary || 
                                 this.generateInventorySummary(acquiredItems, removedItems);
        
        return [...journal, {
          ...entry,
          id: entry.id || generateUUID(),
          timestamp: timestamp,
          type: 'inventory',
          narrativeSummary: inventorySummary
        } as InventoryJournalEntry];
      case 'quest':
        return [...journal, {
          ...entry,
          id: entry.id || generateUUID(),
          timestamp: timestamp,
          type: 'quest',
          narrativeSummary: entry.narrativeSummary || 'A new quest has begun.'
        } as JournalEntry];
      default:
        return [...journal, {
          ...entry,
          id: entry.id || generateUUID(),
          timestamp,
          type: 'narrative',
          narrativeSummary: entry.narrativeSummary || this.createFallbackSummary(entry.content)
        } as NarrativeJournalEntry];
    }
  }
}