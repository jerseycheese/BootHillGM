// /app/utils/initialization/scenarios/directAIGeneration.ts
import { Dispatch } from 'react';
import { GameAction } from '../../../types/actions';
import { Character } from '../../../types/character';
import { NarrativeJournalEntry } from '../../../types/journal';
import { SuggestedAction } from '../../../types/campaign';
import { debug } from '../initHelpers';
import { InitializationRef } from '../initState';
import { GameStorage } from '../../storage/gameStateStorage';
import { ActionTypes } from '../../../types/actionTypes';

/**
 * Handles generating content using direct AI generation from pre-existing content
 * 
 * @param params - Object containing initialization parameters
 * @param params.narrativeContent - Pre-generated narrative content string
 * @param params.journalContent - Pre-generated journal content string
 * @param params.suggestedActionsContent - Pre-generated suggested actions string
 * @param params.character - The player character
 * @param params.dispatch - Redux dispatch function
 * @param params.initRef - Reference to initialization state
 * @returns Promise resolving to boolean indicating success
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
  
  if (process.env.NODE_ENV !== 'production') {
    debug('Using direct AI generation for reset content');
  }
  
  try {
    // Parse existing content
    const narrative = JSON.parse(narrativeContent || 'null');
    const journal = JSON.parse(journalContent || 'null');
    const suggestedActions = JSON.parse(suggestedActionsContent || 'null') as SuggestedAction[];
    
    if (!narrative || !journal || !suggestedActions) {
      if (process.env.NODE_ENV !== 'production') {
        debug('Incomplete pre-generated content, aborting direct method');
      }
      return false;
    }
    
    // Initialize a game state with character
    GameStorage.initializeGameState(character, dispatch);
    
    // Dispatch content to state
    if (typeof narrative === 'string') {
      // Add narrative to history
      dispatch({
        type: ActionTypes.ADD_NARRATIVE_HISTORY, // Use ActionTypes constant
        payload: narrative
      });
      
      // Add journal entries
      if (Array.isArray(journal)) {
        journal.forEach((entry: NarrativeJournalEntry) => {
          dispatch({
            type: ActionTypes.ADD_ENTRY,
            payload: entry
          });
        });
      }
    }
    
    // Set suggested actions
    GameStorage.dispatchSuggestedActions(dispatch, suggestedActions);
    
    if (process.env.NODE_ENV !== 'production') {
      debug('Successfully applied pre-generated content');
    }
    
    // Save state to localStorage
    GameStorage.saveInitialGameState(character, narrative, journal[0], suggestedActions);
    
    return true;
  } catch (parseError: unknown) {
    const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
    if (process.env.NODE_ENV !== 'production') {
      debug('Error parsing pre-generated content:', errorMessage);
    }
    return false;
  }
}
