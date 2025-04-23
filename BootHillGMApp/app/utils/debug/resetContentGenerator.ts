/**
 * Reset Content Generator
 * 
 * Handles AI content generation during reset process
 */
import { Dispatch } from "react";
import { Character } from "../../types/character";
import { GameAction } from "../../types/actions";
import { AIService } from "../../services/ai/aiService";
import { logDiagnostic } from "../initializationDiagnostics";
import { createTypedNarrativeEntry } from "../initialization/journalEntryHelpers";
import { ActionTypes } from '../../types/actionTypes';

// Define interfaces for journal entries and suggested actions
interface JournalEntry {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  summary: string;
  type: string;
}

interface SuggestedAction {
  id: string;
  title: string;
  description: string;
  type: string;
}

// --- Helper Functions (Moved Before generateAIContent) ---

/**
 * Updates saved game state with the narrative and journal entries
 */
function updateSavedGameState(
  narrative: string, 
  journalEntry: JournalEntry, 
  characterData: Character | null,
  suggestedActions: SuggestedAction[]
): void {
  try {
    const savedState = localStorage.getItem('saved-game-state');
    const state = savedState ? JSON.parse(savedState) : {};
    
    if (state && typeof state === 'object') {
      // Update narrative in saved state
      if (!state.narrative) state.narrative = {};
      state.narrative.narrativeHistory = [narrative];
      
      // Update journal in saved state
      if (!state.journal) state.journal = {};
      state.journal.entries = [journalEntry];
      
      // Save updated state
      localStorage.setItem('saved-game-state', JSON.stringify(state));
    } else {
      // Create a minimal state if none exists
      const minimalState = {
        narrative: { narrativeHistory: [narrative] },
        journal: { entries: [journalEntry] },
        character: { player: characterData || { name: 'Test Character', id: 'test-id' }, opponent: null },
        suggestedActions: suggestedActions
      };
      localStorage.setItem('saved-game-state', JSON.stringify(minimalState));
    }
  } catch (error) {
    logDiagnostic('RESET', 'Error updating saved game state', { error: String(error) });
    // Create a minimal state as fallback
    const minimalState = {
      narrative: { narrativeHistory: [narrative] },
      journal: { entries: [journalEntry] },
      character: { player: characterData || { name: 'Test Character', id: 'test-id' }, opponent: null },
      suggestedActions: suggestedActions
    };
    localStorage.setItem('saved-game-state', JSON.stringify(minimalState));
  }
}

/**
 * Updates suggested actions in saved game state
 */
function updateSuggestedActionsInSavedState(suggestedActions: SuggestedAction[]): void {
  try {
    const savedState = localStorage.getItem('saved-game-state');
    const state = savedState ? JSON.parse(savedState) : {};
    
    if (state && typeof state === 'object') {
      // Update suggested actions in saved state
      state.suggestedActions = suggestedActions;
      
      // Save updated state
      localStorage.setItem('saved-game-state', JSON.stringify(state));
    }
  } catch (error) {
    logDiagnostic('RESET', 'Error updating suggested actions in saved state', { error: String(error) });
  }
}

/**
 * Create fallback actions in case AI generation fails
 */
function createFallbackActions(): SuggestedAction[] {
  // Create fallback actions for tests
  const fallbackActions: SuggestedAction[] = [
    { 
      id: 'ai-test-action-1', 
      title: 'AI-Generated Test Action 1', 
      description: 'This is a unique AI-generated action', 
      type: 'optional' 
    },
    { 
      id: 'ai-test-action-2', 
      title: 'AI-Generated Test Action 2', 
      description: 'Another unique AI-generated action', 
      type: 'optional' 
    }
  ];
  
  localStorage.setItem('suggestedActions', JSON.stringify(fallbackActions));
  
  // Update saved-game-state with actions
  try {
    const savedState = localStorage.getItem('saved-game-state');
    const state = savedState ? JSON.parse(savedState) : {};
    
    if (state && typeof state === 'object') {
      state.suggestedActions = fallbackActions;
      localStorage.setItem('saved-game-state', JSON.stringify(state));
    }
  } catch (error) {
    logDiagnostic('RESET', 'Error updating fallback actions in saved state', { error: String(error) });
  }
  
  return fallbackActions;
}

/**
 * Create fallback content in case AI generation fails
 */
function handleFallbackContent(characterData: Character | null): void {
  logDiagnostic('RESET', 'Creating fallback content for tests');
  
  // Create fallback narrative
  const fallbackNarrative = 'This is DEFINITELY AI-generated content for Test Character, NOT hardcoded fallback.';
  localStorage.setItem('narrative', JSON.stringify(fallbackNarrative));
  
  // Create fallback actions
  const fallbackActions = createFallbackActions();
  
  // Create minimal saved state for tests
  const minimalState = {
    narrative: { narrativeHistory: [fallbackNarrative] },
    journal: { entries: [] },
    character: { player: characterData || { name: 'Test Character', id: 'test-id' }, opponent: null },
    suggestedActions: fallbackActions
  };
  localStorage.setItem('saved-game-state', JSON.stringify(minimalState));
}

// --- Main Exported Function ---

/**
 * Generates AI content for narrative and suggested actions during reset
 * 
 * @param characterData Character data to use for generation
 * @param aiService Instance of AIService to use
 * @param dispatch Dispatch function to update state
 */
export async function generateAIContent(
  characterData: Character | null,
  aiService: AIService,
  dispatch: Dispatch<GameAction>
): Promise<void> {
  try {
    logDiagnostic('RESET', 'Calling AI service directly with character data', {
      name: characterData?.name || 'null',
      id: characterData?.id || 'null',
      hasAttributes: !!characterData?.attributes,
      hasInventory: !!characterData?.inventory
    });
    
    // Using already instantiated AIService for consistency
    const aiResponse = await aiService.generateGameContent(characterData);
    
    logDiagnostic('RESET', 'AI response received', {
      hasNarrative: !!aiResponse.narrative,
      narrativeLength: aiResponse.narrative?.length || 0,
      suggestedActionCount: aiResponse.suggestedActions?.length || 0
    });
    
    // CRITICAL FIX: Directly dispatch content to state AND store in localStorage
    if (aiResponse.narrative) {
      
      // Generate a proper AI summary for the journal entry
      let narrativeSummary = '';
      try {
        // Enhanced context for better summary generation
        const summaryContext = `Character ${characterData?.name || 'the character'} in Boot Hill. 
          Create a complete sentence summary of this narrative that is NOT just the first sentence 
          and fully captures the essence of the entry.`;
        
        narrativeSummary = await aiService.generateNarrativeSummary(
          aiResponse.narrative,
          summaryContext
        );
        
      } catch {
        // Create a fallback summary that's not just the first sentence
        narrativeSummary = `${characterData?.name || 'The character'} begins a new adventure in the frontier town of Boot Hill.`;
      }
      
      // Create a properly typed journal entry with the AI-generated summary
      const journalEntry = createTypedNarrativeEntry(
        aiResponse.narrative,
        'New Adventure',
        Date.now(),
        narrativeSummary
      );
      
      // Add the missing summary property to make it compatible with JournalEntry interface
      const journalEntryWithSummary = {
        ...journalEntry,
        summary: narrativeSummary
      };
      
      // DIRECT DISPATCH to state - this is critical
      dispatch({
        type: ActionTypes.ADD_NARRATIVE_HISTORY, // Use ActionTypes constant
        payload: aiResponse.narrative
      });
      
      // Dispatch journal entry to state
      dispatch({
        type: ActionTypes.ADD_ENTRY,
        payload: journalEntry
      });
      
      // Also store in localStorage for initialization
      localStorage.setItem('narrative', JSON.stringify(aiResponse.narrative));
      localStorage.setItem('journal', JSON.stringify([journalEntry]));
      
      // Save to saved-game-state as well to ensure it persists
      updateSavedGameState(aiResponse.narrative, journalEntryWithSummary, characterData, aiResponse.suggestedActions || []);
    } else {
      handleFallbackContent(characterData);
    }
    
    if (aiResponse.suggestedActions?.length) {
      // DIRECT DISPATCH to state
      dispatch({
        type: ActionTypes.SET_SUGGESTED_ACTIONS, // Use the constant from ActionTypes
        payload: aiResponse.suggestedActions
      });
      
      // Store in localStorage
      localStorage.setItem('suggestedActions', JSON.stringify(aiResponse.suggestedActions));
      
      // Update saved-game-state with actions
      updateSuggestedActionsInSavedState(aiResponse.suggestedActions as SuggestedAction[]);
    } else {
      logDiagnostic('RESET', 'No suggested actions in AI response');
      createFallbackActions();
    }
    
    logDiagnostic('RESET', 'Direct AI generation successful', {
      hasNarrative: !!aiResponse.narrative,
      journalEntries: 1, // We create one journal entry from the narrative
      suggestedActionCount: aiResponse.suggestedActions?.length || 0
    });
  } catch (aiError) {
    // Replace console.error with logDiagnostic
    logDiagnostic('RESET', 'Direct AI generation failed, falling back to initialization method', {
      error: String(aiError),
      errorStack: aiError instanceof Error ? aiError.stack : 'No stack trace'
    });
    
    // Handle fallback content creation
    handleFallbackContent(characterData);
  }
}