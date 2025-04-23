// /app/utils/initialization/scenarios/resetInitialization.ts
import { Dispatch } from 'react';
import { GameAction } from '../../../types/actions';
import { Character } from '../../../types/character';
import { SuggestedAction, ActionType } from '../../../types/campaign'; // Combined imports
import { AIService } from '../../../services/ai/aiService';
import { debug, createNarrativeEntry, generateEnhancedNarrativeSummary, createFallbackContent } from '../initHelpers';
import { InitializationRef } from '../initState';
import { handleDirectAIGeneration } from './directAIGeneration';
import { GameStorage } from '../../storage/gameStateStorage';
import { LocationService } from '../../../services/locationService';
import { logDiagnostic } from '../../initializationDiagnostics';

/**
 * Handles the reset initialization flow, including AI content generation
 * This function is called when the application needs to reset the game state
 * It handles both pre-generated content and generating new content via AI
 * 
 * @param params - Object containing initialization parameters
 * @param params.initRef - Reference to initialization state
 * @param params.character - The player character
 * @param params.narrativeContent - Pre-generated narrative content string or null
 * @param params.journalContent - Pre-generated journal content string or null
 * @param params.suggestedActionsContent - Pre-generated suggested actions string or null
 * @param params.dispatch - Redux dispatch function
 * @returns Promise resolving to void
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
  
  if (process.env.NODE_ENV !== 'production') {
    debug('Force generation detected, always regenerating content');
  }
  
  // If content is available from reset handler, use it
  if (narrativeContent && journalContent && suggestedActionsContent) {
    if (process.env.NODE_ENV !== 'production') {
      debug('Found pre-generated content from reset handler, using it');
    }
    
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
  } else if (process.env.NODE_ENV !== 'production') {
    debug('No pre-generated content found, will generate new content');
  }
  
  // If no content used yet, generate new content
  if (!initRef.directAIGenerationAttempted) {
    try {
      if (process.env.NODE_ENV !== 'production') {
        debug('Generating new AI content for character');
      }
      
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

      // Initialize game state with character
      GameStorage.initializeGameState(character, dispatch);

      // Handle AI narrative response
      let narrativeEntryObj = null;
      
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
        
        // Add content to state
        GameStorage.dispatchNarrativeContent(dispatch, initialAIResponse.narrative, narrativeEntryObj);
        
        // Save to localStorage
        GameStorage.saveContentToLocalStorage(
          initialAIResponse.narrative,
          narrativeEntryObj,
          (initialAIResponse.suggestedActions || []) as SuggestedAction[]
        );
        
        if (process.env.NODE_ENV !== 'production') {
          debug('Successfully generated AI narrative content');
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
        
        // Add actions to state
        GameStorage.dispatchSuggestedActions(dispatch, actions);
        
        // Save to localStorage
        localStorage.setItem('suggestedActions', JSON.stringify(actions));
        
        if (process.env.NODE_ENV !== 'production') {
          debug('Successfully generated AI suggested actions');
        }
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
      
      initRef.directAIGenerationAttempted = true;
    } catch (aiError: unknown) {
      const errorMessage = aiError instanceof Error ? aiError.message : String(aiError);
      if (process.env.NODE_ENV !== 'production') {
        debug('AI generation failed, using fallback:', errorMessage);
      }
      
      const fallbackContent = createFallbackContent(character);
      
      // Initialize game state
      GameStorage.initializeGameState(character, dispatch);
      
      // Add to state
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
      
      initRef.directAIGenerationAttempted = true;
    }
  }
}
