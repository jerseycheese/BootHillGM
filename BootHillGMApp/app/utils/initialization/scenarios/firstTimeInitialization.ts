// /app/utils/initialization/scenarios/firstTimeInitialization.ts
import { Dispatch } from 'react';
import { GameAction } from '../../../types/actions';
import { Character } from '../../../types/character';
import { SuggestedAction, ActionType } from '../../../types/campaign'; // Combined imports
import { AIService } from '../../../services/ai/aiService';
import { debug, createNarrativeEntry, createFallbackContent } from '../initHelpers';
import { logDiagnostic } from '../../initializationDiagnostics';
import { GameStorage } from '../../storage/gameStateStorage';
import { LocationService } from '../../../services/locationService';

/**
 * Handles first-time initialization when no saved state exists
 * This function is called for new game sessions with no prior state
 * It generates AI content and falls back to static content on error
 * 
 * @param params - Object containing initialization parameters
 * @param params.character - The player character
 * @param params.dispatch - Redux dispatch function
 * @returns Promise resolving to void
 */
export async function handleFirstTimeInitialization(params: {
  character: Character;
  dispatch: Dispatch<GameAction>;
}): Promise<void> {
  const { character, dispatch } = params;
  
  if (process.env.NODE_ENV !== 'production') {
    debug('First time initialization, no saved state found');
  }
  
  // Initialize game state with character
  GameStorage.initializeGameState(character, dispatch);
  
  if (process.env.NODE_ENV !== 'production') {
    debug('First time initialization, generating content');
  }
  
  try {
    // Use AIService which has retry mechanism
    const aiService = new AIService();
    const initialAIResponse = await aiService.generateGameContent(character);
    
    if (process.env.NODE_ENV !== 'production') {
      debug('AI response received:', {
        hasNarrative: !!initialAIResponse.narrative,
        narrativePreview: initialAIResponse.narrative?.substring(0, 50),
        suggestedActionCount: initialAIResponse.suggestedActions?.length || 0
      });
    }

    // Handle AI narrative response
    let narrativeEntryObj = null;
    
    if (initialAIResponse.narrative) {
      // Generate a proper summary for the journal
      let narrativeSummary = '';
      try {
        if (process.env.NODE_ENV !== 'production') {
          debug('Generating narrative summary...');
        }
        
        // Enhanced context for better summary generation
        const summaryContext = `Character ${character.name} in Boot Hill. Create a complete sentence summary of this narrative.`;
        
        narrativeSummary = await aiService.generateNarrativeSummary(
          initialAIResponse.narrative,
          summaryContext
        );
        
        // Validate the summary - it should be a complete sentence
        if (!narrativeSummary || narrativeSummary.length < 10 || 
            (!narrativeSummary.endsWith('.') && !narrativeSummary.endsWith('!') && !narrativeSummary.endsWith('?'))) {
          if (process.env.NODE_ENV !== 'production') {
            debug('Generated summary is too short or incomplete, creating a better one');
          }
          
          // Create a more distinctive summary that's not just the first sentence
          const firstSentenceMatch = initialAIResponse.narrative.match(/^([^.!?]+[.!?])/);
          const firstSentence = firstSentenceMatch ? firstSentenceMatch[0] : '';
          
          // Create a summary that's still useful
          narrativeSummary = firstSentence ? 
            `${firstSentence} ${character.name}'s adventure begins in Boot Hill.` : 
            `${character.name} begins a new adventure in the frontier town of Boot Hill.`;
        }
        
        if (process.env.NODE_ENV !== 'production') {
          debug('Final narrative summary:', narrativeSummary);
        }
      } catch (summaryError: unknown) {
        const errorMessage = summaryError instanceof Error ? summaryError.message : String(summaryError);
        if (process.env.NODE_ENV !== 'production') {
          debug('Error generating summary:', errorMessage);
        }
        
        // Create a fallback summary
        const firstSentenceMatch = initialAIResponse.narrative.match(/^([^.!?]+[.!?])/);
        const firstSentence = firstSentenceMatch ? firstSentenceMatch[0] : '';
        
        narrativeSummary = firstSentence ? 
          `${firstSentence} ${character.name}'s adventure begins in Boot Hill.` : 
          `${character.name} begins a new adventure in the frontier town of Boot Hill.`;
        
        if (process.env.NODE_ENV !== 'production') {
          debug('Created fallback summary:', narrativeSummary);
        }
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
      
      // Add content to state
      GameStorage.dispatchNarrativeContent(dispatch, initialAIResponse.narrative, narrativeEntryObj);
      
      // Save to localStorage
      GameStorage.saveContentToLocalStorage(
        initialAIResponse.narrative,
        narrativeEntryObj,
        (initialAIResponse.suggestedActions || []) as SuggestedAction[]
      );
      
      if (process.env.NODE_ENV !== 'production') {
        debug('Saved narrative and journal entry with summary to localStorage');
      }
    }

    // Handle suggested actions
    if (initialAIResponse.suggestedActions?.length) {
      const actions = initialAIResponse.suggestedActions.map(a => ({
        id: a.id || `action-${Date.now()}-${Math.random()}`,
        title: a.title || 'Unnamed Action',
        description: a.description || '',
        type: (a.type || 'optional') as ActionType
      })) as SuggestedAction[];
      
      // Dispatch to state
      GameStorage.dispatchSuggestedActions(dispatch, actions);
      
      // Save to localStorage
      localStorage.setItem('suggestedActions', JSON.stringify(actions));
    }
    
    // Convert location to proper format for persistence
    const locationService = LocationService.getInstance();
    const gameLocation = locationService.convertAIGeneratedLocation(initialAIResponse.location);
    
    // Save state to localStorage
    GameStorage.saveInitialGameState(
      character, 
      initialAIResponse.narrative || '', 
      narrativeEntryObj, 
      (initialAIResponse.suggestedActions || []) as SuggestedAction[],
      gameLocation
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (process.env.NODE_ENV !== 'production') {
      debug('Initial AI generation failed:', errorMessage);
    }
    
    // Use fallback content but avoid wrapping text in generic game intro
    const fallbackContent = createFallbackContent(character);
    
    // Add content to state
    GameStorage.dispatchNarrativeContent(dispatch, fallbackContent.narrative, fallbackContent.entry);
    GameStorage.dispatchSuggestedActions(dispatch, fallbackContent.actions);
    
    // Save to localStorage
    GameStorage.saveContentToLocalStorage(
      fallbackContent.narrative,
      fallbackContent.entry,
      fallbackContent.actions
    );
    
    // Save state to localStorage
    GameStorage.saveInitialGameState(
      character,
      fallbackContent.narrative,
      fallbackContent.entry,
      fallbackContent.actions
    );
  }
}