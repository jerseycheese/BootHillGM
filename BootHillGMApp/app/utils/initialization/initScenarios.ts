// /app/utils/initialization/initScenarios.ts
import { GameStorage } from '../../utils/gameStorage';
import { AIService } from '../../services/ai/aiService';
import { ActionType } from '../../types/campaign';
import { GameAction } from '../../types/actions';
import { logDiagnostic } from '../initializationDiagnostics';
import { Character } from '../../types/character';
import { NarrativeJournalEntry } from '../../types/journal';
import { Dispatch } from 'react';
import { 
  debug, 
  createNarrativeEntry,  
  generateEnhancedNarrativeSummary,
  createFallbackContent,
  saveGameState,
  GameLocation
} from './initHelpers';
import { InitializationRef } from './initState';

interface AIGenerationResult {
  narrative?: string;
  suggestedActions?: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
  }>;
  location?: {
    type: string;
    name?: string;
    description?: string;
  };
}

/**
 * Converts a location object to GameLocation type
 * Ensures locations have required properties for persistence
 */
function convertToGameLocation(location: AIGenerationResult['location'] | undefined): GameLocation {
  if (!location) {
    return { type: 'town', name: 'Boot Hill' };
  }
  
  // Handle wilderness locations that have description instead of name
  if (location.type === 'wilderness' && location.description && !location.name) {
    return { 
      type: location.type,
      name: location.description // Use description as name for GameLocation compatibility
    };
  }
  
  // For other location types, ensure name exists
  return {
    type: location.type || 'town',
    name: location.name || 'Boot Hill'
  };
}

/**
 * Handles generating content using direct AI generation
 */
export async function handleDirectAIGeneration(params: {
  narrativeContent: string | null;
  journalContent: string | null;
  suggestedActionsContent: string | null;
  character: Character;
  dispatch: Dispatch<GameAction>;
  initRef: InitializationRef;
}): Promise<boolean> {
  const { 
    narrativeContent, 
    journalContent, 
    suggestedActionsContent, 
    character, 
    dispatch
  } = params;
  
  debug('Using direct AI generation for reset content');
  
  try {
    // Parse existing content
    const narrative = JSON.parse(narrativeContent || 'null');
    const journal = JSON.parse(journalContent || 'null');
    const suggestedActions = JSON.parse(suggestedActionsContent || 'null');
    
    if (!narrative || !journal || !suggestedActions) {
      debug('Incomplete pre-generated content, aborting direct method');
      return false;
    }
    
    // Initialize a new game state
    const initialState = GameStorage.initializeNewGame();
    
    // Set character first
    dispatch({
      type: 'character/SET_CHARACTER',
      payload: character
    } as GameAction);
    
    // Set initial state
    dispatch({ 
      type: 'SET_STATE', 
      payload: initialState 
    } as GameAction);
    
    // Set inventory
    const defaultItems = character.inventory?.items || GameStorage.getDefaultInventoryItems();
    dispatch({
      type: 'inventory/SET_INVENTORY',
      payload: defaultItems
    } as GameAction);
    
    // Dispatch content to state
    if (typeof narrative === 'string') {
      // Add narrative to history
      dispatch({
        type: 'ADD_NARRATIVE_HISTORY',
        payload: narrative
      });
      
      // Add journal entries
      if (Array.isArray(journal)) {
        journal.forEach((entry: NarrativeJournalEntry) => {
          dispatch({
            type: 'journal/ADD_ENTRY',
            payload: entry
          });
        });
      }
    }
    
    // Set suggested actions
    if (Array.isArray(suggestedActions) && suggestedActions.length) {
      dispatch({
        type: 'SET_SUGGESTED_ACTIONS',
        payload: suggestedActions
      });
    }
    
    debug('Successfully applied pre-generated content');
    
    // Save state to localStorage
    saveGameState(character, narrative, journal[0], suggestedActions);
    
    return true;
  } catch (parseError: unknown) {
    debug('Error parsing pre-generated content:', parseError);
    return false;
  }
}

/**
 * Handles the reset initialization flow, including AI content generation
 */
export async function handleResetInitialization(params: {
  initRef: InitializationRef;
  character: Character;
  narrativeContent: string | null;
  journalContent: string | null;
  suggestedActionsContent: string | null;
  dispatch: Dispatch<GameAction>;
}): Promise<void> {
  const {
    initRef,
    character,
    narrativeContent,
    journalContent,
    suggestedActionsContent,
    dispatch
  } = params;
  
  debug('Force generation detected, always regenerating content');
  
  // If content is available from reset handler, use it
  if (narrativeContent && journalContent && suggestedActionsContent) {
    debug('Found pre-generated content from reset handler, using it');
    
    const success = await handleDirectAIGeneration({
      narrativeContent,
      journalContent,
      suggestedActionsContent,
      character,
      dispatch,
      initRef
    });
    
    if (success) {
      initRef.directAIGenerationAttempted = true;
      return;
    }
  } else {
    debug('No pre-generated content found, will generate new content');
  }
  
  // If no content used yet, generate new content
  if (!initRef.directAIGenerationAttempted) {
    try {
      debug('Generating new AI content for character');
      
      // Use AIService which has retry mechanism
      const aiService = new AIService();
      const initialAIResponse = await aiService.generateGameContent(character);
      
      debug('AI response received:', {
        hasNarrative: !!initialAIResponse.narrative,
        narrativePreview: initialAIResponse.narrative?.substring(0, 50),
        suggestedActionCount: initialAIResponse.suggestedActions?.length || 0
      });

      // Initialize a new game state
      const initialState = GameStorage.initializeNewGame();
      
      // Set character first
      dispatch({
        type: 'character/SET_CHARACTER',
        payload: character
      } as GameAction);
      
      // Set initial state
      dispatch({ 
        type: 'SET_STATE', 
        payload: initialState 
      } as GameAction);
      
      // Set inventory
      const defaultItems = character.inventory?.items || GameStorage.getDefaultInventoryItems();
      dispatch({
        type: 'inventory/SET_INVENTORY',
        payload: defaultItems
      } as GameAction);

      // Handle AI narrative response
      let narrativeEntryObj: NarrativeJournalEntry | null = null;
      
      if (initialAIResponse.narrative) {
        // Generate a proper summary for the journal with enhanced context
        const narrativeSummary = await generateEnhancedNarrativeSummary(
          aiService,
          initialAIResponse.narrative,
          character
        );
        
        // Log the final summary for debugging
        logDiagnostic('JOURNAL', 'Final narrative summary for reset journal entry', {
          summaryLength: narrativeSummary.length,
          summary: narrativeSummary
        });
        
        narrativeEntryObj = createNarrativeEntry(
          initialAIResponse.narrative,
          'New Adventure',
          Date.now(),
          narrativeSummary
        );
        
        // Add entry to journal
        dispatch({
          type: 'journal/ADD_ENTRY',
          payload: narrativeEntryObj
        });
        
        // Add narrative to history
        dispatch({
          type: 'ADD_NARRATIVE_HISTORY',
          payload: initialAIResponse.narrative
        });
        
        // Save to localStorage with explicit summary field to ensure it's preserved
        localStorage.setItem('narrative', JSON.stringify(initialAIResponse.narrative));
        
        // Ensure the journal entry explicitly includes the narrativeSummary field
        const journalEntryWithSummary = {
          ...narrativeEntryObj,
          narrativeSummary // Explicitly set to ensure it's included
        };
        
        localStorage.setItem('journal', JSON.stringify([journalEntryWithSummary]));
        
        // Also save the summary separately for debugging and recovery
        localStorage.setItem('narrative_summary', narrativeSummary);
        
        debug('Successfully generated AI narrative content');
      }

      // Handle suggested actions
      if (initialAIResponse.suggestedActions?.length) {
        const actions = initialAIResponse.suggestedActions.map(a => ({
          id: a.id || `action-${Date.now()}-${Math.random()}`,
          title: a.title || 'Unnamed Action',
          description: a.description || '',
          type: (a.type || 'optional') as ActionType
        }));
        
        // Add actions to state
        dispatch({
          type: 'SET_SUGGESTED_ACTIONS',
          payload: actions
        });
        
        // Save to localStorage
        localStorage.setItem('suggestedActions', JSON.stringify(actions));
        
        debug('Successfully generated AI suggested actions');
      }
      
      // Convert location to GameLocation format for persistence
      const gameLocation = convertToGameLocation(initialAIResponse.location);
      
      // Save state to localStorage
      saveGameState(
        character, 
        initialAIResponse.narrative || '', 
        narrativeEntryObj, 
        initialAIResponse.suggestedActions || [],
        gameLocation
      );
      
      initRef.directAIGenerationAttempted = true;
    } catch (aiError: unknown) {
      debug('AI generation failed, using fallback:', aiError);
      
      const fallbackContent = createFallbackContent(character);
      
      // Add to state
      dispatch({
        type: 'journal/ADD_ENTRY',
        payload: fallbackContent.entry
      });
      
      dispatch({
        type: 'ADD_NARRATIVE_HISTORY',
        payload: fallbackContent.narrative
      });
      
      dispatch({
        type: 'SET_SUGGESTED_ACTIONS',
        payload: fallbackContent.actions
      });
      
      // Save to localStorage to ensure content persists
      localStorage.setItem('narrative', JSON.stringify(fallbackContent.narrative));
      localStorage.setItem('journal', JSON.stringify([fallbackContent.entry]));
      localStorage.setItem('suggestedActions', JSON.stringify(fallbackContent.actions));
      
      // Save state to localStorage
      saveGameState(
        character, 
        fallbackContent.narrative, 
        fallbackContent.entry, 
        fallbackContent.actions
      );
    }
  }
}

/**
 * Handles normal state restoration when saved state exists
 */
export async function handleRestoredGameState(params: {
  character: Character;
  savedState: string;
  dispatch: Dispatch<GameAction>;
}): Promise<void> {
  const { character, savedState, dispatch } = params;
  
  // Normal case - restore saved state when available
  debug('Found saved state, restoring game...');
  const parsedState = JSON.parse(savedState);
  
  // Ensure character is properly set in parsed state
  if (parsedState.character) {
    parsedState.character.player = character;
  }
  
  dispatch({ 
    type: 'SET_STATE', 
    payload: parsedState 
  } as GameAction);
  
  debug('Game state restored');
}

/**
 * Handles first-time initialization when no saved state exists
 */
export async function handleFirstTimeInitialization(params: {
  character: Character;
  dispatch: Dispatch<GameAction>;
}): Promise<void> {
  const { character, dispatch } = params;
  
  // Initialize a new game when no saved state exists (first time run)
  debug('First time initialization, no saved state found');
  
  // Initialize new game here (this is the normal case for first time run)
  const initialState = GameStorage.initializeNewGame();
  
  // Set character first
  dispatch({
    type: 'character/SET_CHARACTER',
    payload: character
  } as GameAction);
  
  // Set initial state
  dispatch({ 
    type: 'SET_STATE', 
    payload: initialState 
  } as GameAction);
  
  // Set default inventory
  const defaultItems = character.inventory?.items || GameStorage.getDefaultInventoryItems();
  dispatch({
    type: 'inventory/SET_INVENTORY',
    payload: defaultItems
  } as GameAction);
  
  // Generate for new game (first time initialization)
  debug('First time initialization, generating content');
  
  try {
    // Use AIService which has retry mechanism and better controls for content length
    const aiService = new AIService();
    const initialAIResponse = await aiService.generateGameContent(character);
    
    debug('AI response received:', {
      hasNarrative: !!initialAIResponse.narrative,
      narrativePreview: initialAIResponse.narrative?.substring(0, 50),
      suggestedActionCount: initialAIResponse.suggestedActions?.length || 0
    });

    // Handle AI narrative response
    let narrativeEntryObj: NarrativeJournalEntry | null = null;
    
    if (initialAIResponse.narrative) {
      // Generate a proper summary for the journal
      let narrativeSummary = '';
      try {
        debug('Generating narrative summary...');
        
        // Enhanced context for better summary generation
        const summaryContext = `Character ${character.name} in Boot Hill. Create a complete sentence summary of this narrative.`;
        
        narrativeSummary = await aiService.generateNarrativeSummary(
          initialAIResponse.narrative,
          summaryContext
        );
        
        // Validate the summary - it should be a complete sentence
        if (!narrativeSummary || narrativeSummary.length < 10 || 
            (!narrativeSummary.endsWith('.') && !narrativeSummary.endsWith('!') && !narrativeSummary.endsWith('?'))) {
          debug('Generated summary is too short or incomplete, creating a better one');
          
          // Create a more distinctive summary that's not just the first sentence
          const firstSentenceMatch = initialAIResponse.narrative.match(/^([^.!?]+[.!?])/);
          const firstSentence = firstSentenceMatch ? firstSentenceMatch[0] : '';
          
          // Create a summary that's still useful
          narrativeSummary = firstSentence ? 
            `${firstSentence} ${character.name}'s adventure begins in Boot Hill.` : 
            `${character.name} begins a new adventure in the frontier town of Boot Hill.`;
        }
        
        debug('Final narrative summary:', narrativeSummary);
      } catch (summaryError: unknown) {
        debug('Error generating summary:', summaryError);
        
        // Create a fallback summary
        const firstSentenceMatch = initialAIResponse.narrative.match(/^([^.!?]+[.!?])/);
        const firstSentence = firstSentenceMatch ? firstSentenceMatch[0] : '';
        
        narrativeSummary = firstSentence ? 
          `${firstSentence} ${character.name}'s adventure begins in Boot Hill.` : 
          `${character.name} begins a new adventure in the frontier town of Boot Hill.`;
        
        debug('Created fallback summary:', narrativeSummary);
      }
      
      // Log the final summary for debugging
      logDiagnostic('JOURNAL', 'Final narrative summary for journal entry', {
        summaryLength: narrativeSummary.length,
        summary: narrativeSummary
      });
      
      narrativeEntryObj = createNarrativeEntry(
        initialAIResponse.narrative,
        'New Adventure',
        Date.now(),
        narrativeSummary
      );
      
      // Add entry to journal
      dispatch({
        type: 'journal/ADD_ENTRY',
        payload: narrativeEntryObj
      });
      
      // Add narrative to history
      dispatch({
        type: 'ADD_NARRATIVE_HISTORY',
        payload: initialAIResponse.narrative
      });
      
      // Save to localStorage
      localStorage.setItem('narrative', JSON.stringify(initialAIResponse.narrative));
      
      // Make sure the journal entry has the summary
      const journalEntryWithSummary = {
        ...narrativeEntryObj,
        narrativeSummary
      };
      
      // Save to localStorage
      localStorage.setItem('journal', JSON.stringify([journalEntryWithSummary]));
      
      // Also save the summary separately for debugging
      localStorage.setItem('narrative_summary', narrativeSummary);
      
      debug('Saved narrative and journal entry with summary to localStorage');
    }

    // Handle suggested actions
    if (initialAIResponse.suggestedActions?.length) {
      const actions = initialAIResponse.suggestedActions.map(a => ({
        id: a.id || `action-${Date.now()}-${Math.random()}`,
        title: a.title || 'Unnamed Action',
        description: a.description || '',
        type: (a.type || 'optional') as ActionType
      }));
      
      dispatch({
        type: 'SET_SUGGESTED_ACTIONS',
        payload: actions
      });
      
      // Save to localStorage
      localStorage.setItem('suggestedActions', JSON.stringify(actions));
    }
    
    // Convert location to GameLocation format for persistence
    const gameLocation = convertToGameLocation(initialAIResponse.location);
    
    // Save state to localStorage
    saveGameState(
      character, 
      initialAIResponse.narrative || '', 
      narrativeEntryObj, 
      initialAIResponse.suggestedActions || [],
      gameLocation
    );
  } catch (error: unknown) {
    debug('Initial AI generation failed:', error);
    
    // Use fallback content but avoid wrapping text in generic game intro
    const fallbackContent = createFallbackContent(character);
    
    dispatch({
      type: 'journal/ADD_ENTRY',
      payload: fallbackContent.entry
    });
    
    dispatch({
      type: 'ADD_NARRATIVE_HISTORY',
      payload: fallbackContent.narrative
    });
    
    // Add fallback actions
    dispatch({
      type: 'SET_SUGGESTED_ACTIONS',
      payload: fallbackContent.actions
    });
    
    // Save to localStorage
    localStorage.setItem('narrative', JSON.stringify(fallbackContent.narrative));
    localStorage.setItem('journal', JSON.stringify([fallbackContent.entry]));
    localStorage.setItem('suggestedActions', JSON.stringify(fallbackContent.actions));
    
    // Save state to localStorage
    saveGameState(
      character,
      fallbackContent.narrative,
      fallbackContent.entry,
      fallbackContent.actions
    );
  }
}