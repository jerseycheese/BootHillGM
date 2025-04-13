// /app/utils/initialization/initHelpers.ts
import { NarrativeJournalEntry } from '../../types/journal';
import { AIService } from '../../services/ai/aiService';
import { Character } from '../../types/character';

/**
 * Debug logging function for initialization
 */
export const debug = (..._args: Parameters<typeof console.log>): void => {
  // Log removed - but keep function signature to match calls in code
};

/**
 * Helper function type for creating narrative entries
 */
export function createNarrativeEntry(
  content: string,
  title: string = 'New Adventure',
  timestamp: number = Date.now(),
  summary?: string
): NarrativeJournalEntry {
  return {
    id: `entry_narrative_${Date.now()}`,
    timestamp,
    type: 'narrative',
    title,
    content,
    ...(summary ? { narrativeSummary: summary } : {})
  };
}

/**
 * Helper function for fallback narrative
 */
export function createFallbackNarrativeEntry(content: string): NarrativeJournalEntry {
  return createNarrativeEntry(
    content,
    'New Adventure',
    Date.now()
  );
}

/**
 * Generates a narrative summary, with retry logic for better quality
 */
export async function generateEnhancedNarrativeSummary(
  aiService: AIService,
  narrative: string,
  character: Character
): Promise<string> {
  let narrativeSummary = '';
  
  try {
    // Enhanced context for better summary generation - explicitly request a summary that's different from the first sentence
    const summaryContext = `Character ${character.name} in Boot Hill. Create a complete sentence summary of this narrative that is NOT just the first sentence. Make it a unique, AI-generated summary.`;
    
    // Make multiple attempts to get a good summary
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        narrativeSummary = await aiService.generateNarrativeSummary(
          narrative,
          summaryContext
        );
        
        // Validate the summary - it should be a complete sentence and not just the first sentence
        const firstSentenceMatch = narrative.match(/^([^.!?]+[.!?])/);
        const firstSentence = firstSentenceMatch ? firstSentenceMatch[0].trim() : '';
        
        if (narrativeSummary && 
            narrativeSummary.length > 10 && 
            (narrativeSummary.endsWith('.') || narrativeSummary.endsWith('!') || narrativeSummary.endsWith('?')) &&
            narrativeSummary.trim() !== firstSentence) {
          break;
        } else {
          // Short delay before retry
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch {
        // Continue to next attempt
      }
    }
    
    // If we still don't have a good summary, create a distinctive one
    if (!narrativeSummary || narrativeSummary.length < 10 || 
        (!narrativeSummary.endsWith('.') && !narrativeSummary.endsWith('!') && !narrativeSummary.endsWith('?'))) {
      
      // Create a summary that's clearly not just the first sentence
      narrativeSummary = `${character.name} finds themselves in Boot Hill, a frontier town full of opportunity and danger.`;
    }
  } catch {
    // Create a distinctive fallback summary that's not just the first sentence
    narrativeSummary = `${character.name} begins a new chapter in their adventure in the frontier town of Boot Hill.`;
  }
  
  return narrativeSummary;
}

/**
 * Creates fallback content when AI generation fails
 */
export function createFallbackContent(character: Character) {
  // Create fallback content if AI generation fails - ensure it's a complete sentence without wrapping text
  const fallbackNarrative = `The dusty streets of Boot Hill welcome ${character.name} as the frontier town bustles with activity. Weathered buildings line the main road, while locals and travelers move about their business with caution and purpose.`;
  
  const fallbackSummary = `${character.name} arrives in Boot Hill, greeted by the frontier town's dusty streets and cautious locals.`;
  
  const fallbackEntry = createNarrativeEntry(
    fallbackNarrative,
    'New Adventure',
    Date.now(),
    fallbackSummary
  );
  
  // Add fallback actions
  const fallbackActions = [
    { id: 'look-around', title: 'Look around', description: 'Survey your surroundings', type: 'optional' as const },
    { id: 'saloon', title: 'Visit saloon', description: 'Head to the local saloon', type: 'optional' as const },
    { id: 'inventory', title: 'Check inventory', description: 'Review your belongings', type: 'optional' as const }
  ];
  
  return {
    narrative: fallbackNarrative,
    entry: fallbackEntry,
    summary: fallbackSummary,
    actions: fallbackActions
  };
}

/**
 * Interface for game location
 * Used in saveGameState to ensure proper location formatting
 */
export interface GameLocation {
  type: string;
  name: string;
}

/**
 * Interface for action items
 */
export interface ActionItem {
  id: string;
  title: string;
  description: string;
  type: string;
}

/**
 * Saves state to localStorage for persistence
 */
export function saveGameState(
  character: Character,
  narrative: string, 
  journalEntry: NarrativeJournalEntry | null, 
  actions: ActionItem[],
  location: GameLocation = { type: 'town', name: 'Boot Hill' }
) {
  const defaultItems = character.inventory?.items || [];
  
  // Save state to localStorage
  const stateToSave = {
    character: { player: character, opponent: null },
    inventory: { items: defaultItems, equippedWeaponId: null },
    journal: { entries: journalEntry ? [journalEntry] : [] },
    narrative: { narrativeHistory: narrative ? [narrative] : [] },
    suggestedActions: actions,
    location: location
  };
  
  localStorage.setItem('saved-game-state', JSON.stringify(stateToSave));
  
  return stateToSave;
}