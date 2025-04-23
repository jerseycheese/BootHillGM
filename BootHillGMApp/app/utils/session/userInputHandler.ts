/**
 * User Input Handler
 * 
 * Responsible for processing user input, communicating with AI services,
 * and updating game state based on AI responses.
 * 
 * @module utils/session/userInputHandler
 */
import { Dispatch } from 'react';
import { GameAction } from '../../types/actions';
import { ActionTypes } from '../../types/actionTypes';
import { GameState } from '../../types/gameState';
import { getAIResponse } from '../../services/ai/gameService';
import { getJournalContext } from '../JournalManager';
import { getItemsFromInventory, getEntriesFromJournal } from '../../hooks/selectors/typeGuards';
import { InventoryItem } from '../../types/item.types';
import { generateNarrativeSummary } from '../ai/narrativeSummary';
import { generateActionFallbackEntry } from '../fallback/fallbackJournalGenerator';
import { SuggestedAction, ActionType } from '../../types/campaign';
import { CombatParticipant } from '../../types/combat';
import { v4 as uuidv4 } from 'uuid';
import { extractItemName, extractItemCategory, AIItemResponse } from './itemExtractUtils';
import { JournalEntry } from '../../types/journal';

/**
 * Interface representing the AI response structure
 */
interface AIResponse {
  narrative: string;
  suggestedActions?: SuggestedActionResponse[];
  acquiredItems?: (string | AIItemResponse)[];
  removedItems?: string[];
  location?: {
    type: string;
    name?: string;
    description?: string;
  };
  combatInitiated?: boolean;
  opponent?: CombatParticipant;
}

/**
 * Interface for suggested action data from AI response
 */
interface SuggestedActionResponse {
  id?: string;
  title: string;
  description?: string;
  type?: string;
}

// --- Helper Functions (Moved Before processUserInput) ---

/**
 * Adds a journal entry to the game state
 */
function addJournalEntry(
  dispatch: Dispatch<GameAction>,
  title: string,
  content: string,
  summary: string
) {
  const entryId = `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const journalEntry: JournalEntry = {
    id: entryId,
    title: title,
    timestamp: Date.now(),
    content: content,
    type: 'narrative',
    narrativeSummary: summary || "No summary available"
  };
  
  dispatch({
    type: ActionTypes.ADD_ENTRY,
    payload: journalEntry
  });
}

/**
 * Processes suggested actions from AI response
 */
function processSuggestedActions(
  dispatch: Dispatch<GameAction>,
  suggestedActions: SuggestedActionResponse[] | undefined
) {
  if (!suggestedActions?.length) return;
  
  // Convert response suggested actions to proper typed actions
  const typedSuggestedActions: SuggestedAction[] = suggestedActions.map(action => ({
    id: action.id || `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: action.title,
    description: action.description || action.title,
    type: (action.type as ActionType) || 'basic'
  }));
  
  dispatch({
    type: ActionTypes.SET_SUGGESTED_ACTIONS,
    payload: typedSuggestedActions
  });
}

/**
 * Processes inventory changes from AI response
 */
function processInventoryChanges(
  dispatch: Dispatch<GameAction>,
  response: AIResponse,
  inventoryItems: InventoryItem[]
) {
  // Handle acquired items
  if (response.acquiredItems && response.acquiredItems.length > 0) {
    response.acquiredItems.forEach((rawItem: string | AIItemResponse) => {
      // Extract string name and category from potentially complex structure
      const itemName = extractItemName(rawItem);
      const itemCategory = extractItemCategory(rawItem);
      
      const newItem: InventoryItem = {
        id: uuidv4(),
        name: itemName,
        description: `A ${itemName}`,
        quantity: 1,
        category: itemCategory,
      };
      
      dispatch({ type: ActionTypes.ADD_ITEM, payload: newItem });
    });
  }

  // Handle removed items
  if (response.removedItems && response.removedItems.length > 0) {
    response.removedItems.forEach((itemName: string) => {
      const itemToRemove = inventoryItems.find(
        (item: InventoryItem) => item.name === itemName
      );
      if (itemToRemove) {
        dispatch({ type: ActionTypes.REMOVE_ITEM, payload: itemToRemove.id });
      }
    });
  }
}

/**
 * Processes combat initiation from AI response
 */
function processCombatInitiation(
  dispatch: Dispatch<GameAction>,
  response: AIResponse
) {
  if (!response.combatInitiated || !response.opponent) return;
  
  // Set combat as active
  dispatch({
    type: ActionTypes.SET_COMBAT_ACTIVE, // Using SET_COMBAT_ACTIVE as SET_ACTIVE doesn't exist
    payload: true
  });
  
  // Add opponent to participants
  const opponentParticipant = response.opponent;
  
  // Update combat state with participants and initial values
  dispatch({
    type: ActionTypes.UPDATE_COMBAT_STATE, // Using UPDATE_COMBAT_STATE as UPDATE_STATE doesn't exist
    payload: {
      isActive: true,
      rounds: 1,
      playerTurn: true,
      participants: [opponentParticipant]
    }
  });
}

/**
 * Processes fallback response when AI service fails
 */
function processFallbackResponse(
  dispatch: Dispatch<GameAction>,
  input: string,
  actionType: string
) {
  // Create a fallback journal entry
  const fallbackEntry = generateActionFallbackEntry(input, actionType);
  
  // Add fallback entry to journal
  dispatch({
    type: ActionTypes.ADD_ENTRY,
    payload: fallbackEntry
  });
  
  // Fallback response for narrative history
  dispatch({
    type: ActionTypes.ADD_NARRATIVE_HISTORY, // Use ActionTypes constant
    payload: `You ${input.toLowerCase()}. ${fallbackEntry.content}`
  });

  // Generate fallback suggested actions
  const fallbackActions: SuggestedAction[] = [
    { id: 'fallback-gen-1', title: 'Focus on what you see', type: 'optional', description: 'Look more closely at your surroundings' },
    { id: 'fallback-gen-2', title: 'Check nearby buildings', type: 'optional', description: 'Investigate structures around you' },
    { id: 'fallback-gen-3', title: 'Look for armed individuals', type: 'optional', description: 'Scan for potential threats' },
    { id: 'fallback-gen-4', title: 'Ask about what you see', type: 'optional', description: 'Find someone to talk to about the area' }
  ];
  
  dispatch({
    type: ActionTypes.SET_SUGGESTED_ACTIONS,
    payload: fallbackActions 
  });
}

// --- Main Exported Function ---

/**
 * Processes user input, updates journal/narrative history, and retrieves AI response
 * 
 * @param input - Player action text to process
 * @param actionType - Optional action type for the input
 * @param state - Current game state
 * @param dispatch - State dispatch function
 * @returns Promise resolving to an object containing:
 *  - success: Whether the processing completed successfully
 *  - lastInput: The input that was processed
 *  - lastActionType: The type of action that was processed
 */
export async function processUserInput(
  input: string, 
  actionType: string | undefined, 
  state: GameState, 
  dispatch: Dispatch<GameAction>
): Promise<{success: boolean, lastInput: string, lastActionType?: string}> {
  // Mark as loading while processing
  dispatch({ type: ActionTypes.SET_LOADING, payload: true } as const);

  try {
    // Extract existing journal entries and inventory items
    const journalEntries = getEntriesFromJournal(state.journal);
    const inventoryItems = getItemsFromInventory(state.inventory);

    // Get the action type from the action itself if provided in the UI/state
    const actionObj = state.suggestedActions?.find(action => action.title === input);
    const effectiveActionType = actionType || (actionObj?.type as string) || 'basic';

    // Add player input to narrative history
    dispatch({
      type: ActionTypes.ADD_NARRATIVE_HISTORY, // Use ActionTypes constant
      payload: `Player: ${input}`
    });

    try {
      // Get AI response
      const response = await getAIResponse({
        prompt: input,
        journalContext: getJournalContext(journalEntries),
        inventory: inventoryItems
      }) as AIResponse;

      // Add AI response to narrative history
      dispatch({
        type: ActionTypes.ADD_NARRATIVE_HISTORY, // Use ActionTypes constant
        payload: response.narrative
      });

      // Generate summary using the dedicated AI function
      const aiSummary = await generateNarrativeSummary(input, response.narrative);

      // Add journal entry
      addJournalEntry(dispatch, input, response.narrative, aiSummary);
      
      // Process suggested actions
      processSuggestedActions(dispatch, response.suggestedActions);

      // Handle inventory changes
      processInventoryChanges(dispatch, response, inventoryItems);

      // Update location if provided
      if (response.location) {
        dispatch({ 
          type: ActionTypes.SET_LOCATION,
          payload: response.location 
        });
      }

      // Handle combat initiation
      processCombatInitiation(dispatch, response);

      return {success: true, lastInput: input, lastActionType: actionType};
    } catch (error) {
      console.error('Error getting AI response:', error);
      processFallbackResponse(dispatch, input, effectiveActionType);
      return {success: false, lastInput: input, lastActionType: actionType};
    }
  } catch (error) {
    console.error('Error in processUserInput:', error);
    return {success: false, lastInput: input, lastActionType: actionType};
  } finally {
    // Mark as not loading once complete
    dispatch({ type: ActionTypes.SET_LOADING, payload: false });
  }
}