import { Character } from '../types/character';
import { GameSessionProps } from '../components/GameArea/types';
import { InventoryManager } from '../utils/inventoryManager';
import { GameAction } from '../types/actions';
import { GameEngineAction } from '../types/gameActions';
import { GameState, initialGameState } from '../types/gameState';
import { Dispatch } from 'react';
import { getAIResponse } from '../services/ai/gameService';
import { getJournalContext } from '../utils/JournalManager';
import { getItemsFromInventory, getEntriesFromJournal } from '../hooks/selectors/typeGuards';
import { InventoryItem, ItemCategory } from '../types/item.types';
import { CombatParticipant } from '../types/combat';
import { generateActionFallbackEntry } from './fallback/fallbackJournalGenerator';
import { generateNarrativeSummary } from './ai/narrativeSummary';
import { JournalEntry, NarrativeJournalEntry, JournalEntryType } from '../types/journal';
import { ActionType, SuggestedAction } from '../types/campaign';

/**
 * Creates a typed JournalEntry, ensuring the narrativeSummary is included if provided.
 *
 * @param content - The main content of the journal entry.
 * @param summary - The AI-generated or fallback summary.
 * @param type - The type of journal entry (defaults to 'narrative').
 * @returns A properly structured JournalEntry object.
 */
/**
 * Creates a journal entry with a summary that won't be lost in state transitions
 */
function createJournalEntry(content: string, summary: string, type: JournalEntryType = 'narrative'): JournalEntry {
  // Create a unique ID that includes a timestamp for sorting
  const entryId = `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Debug the creation process
  
  // Create typed entry based on the entry type
  if (type === 'narrative') {
    // For narrative entries, explicitly include the narrativeSummary field
    const narrativeEntry: NarrativeJournalEntry = {
      id: entryId,
      timestamp: Date.now(),
      content: content,
      type: 'narrative',
      // Explicitly add the narrativeSummary field
      narrativeSummary: summary || undefined
    };
    
    // Debug the created entry
    
    return narrativeEntry;
  } else {
    // For other entry types, create a base entry
    // All other entry types will be handled by the reducer logic
    if (type === 'combat') {
      return {
        id: entryId,
        timestamp: Date.now(),
        content: content,
        type: 'combat',
        combatants: { player: '', opponent: '' },
        outcome: 'victory'
      };
    } else if (type === 'inventory') {
      return {
        id: entryId,
        timestamp: Date.now(),
        content: content,
        type: 'inventory',
        items: { acquired: [], removed: [] }
      };
    } else if (type === 'quest') {
      return {
        id: entryId,
        timestamp: Date.now(),
        content: content,
        type: 'quest',
        questTitle: 'Unknown Quest',
        status: 'started'
      };
    } else {
      // Default fallback
      return {
        id: entryId,
        timestamp: Date.now(),
        content: content,
        type: 'narrative'
      } as NarrativeJournalEntry;
    }
  }
}

/**
 * Generates session props for the game interface components
 */
export function generateSessionProps(
  state: GameState | null | undefined,
  dispatch: Dispatch<GameAction> | null | undefined,
  playerCharacter: Character | null,
  isLoading: boolean
): GameSessionProps {
  // Derive opponent directly from state
  const opponent = state?.character?.opponent || null;

  // ID getters for health change handler
  const _getPlayerId = () => playerCharacter?.id || 'player';
  const _getOpponentId = () => opponent?.id || 'opponent';

  // Create adaptedHealthChangeHandler - Placeholder
  const localAdaptedHealthChangeHandler = (characterType: string, newStrength: number) => {
  };

  // Create a non-nullable dispatch function
  const safeDispatch: Dispatch<GameEngineAction> = dispatch as Dispatch<GameEngineAction> || (() => {});

  // Define action handlers that depend on dispatch and state
  const handleUseItem = (itemId: string) => {
  };

  const handleEquipWeapon = (itemId: string) => {
    if (!state || !dispatch || !playerCharacter) {
      return;
    }
    const item = state.inventory?.items.find((i) => i.id === itemId);
    if (!item || item.category !== 'weapon') {
      return;
    }
    
    InventoryManager.equipWeapon(playerCharacter, item);
    dispatch({ type: 'inventory/EQUIP_WEAPON', payload: itemId });
  };

  // Store the last action to potentially implement retryLastAction
  let lastActionInput: string | null = null;
  let lastActionType: string | undefined = undefined;

  /**
   * Processes user input, updates journal/narrative history, and retrieves AI response
   * 
   * @param input - Player action text to process
   * @param actionType - Optional action type for the input
   * @returns Promise resolving to null when complete
   */
  const handleUserInput = async (input: string, actionType?: string) => {
    if (!state || !dispatch) {
      return;
    }

    // Store the action for potential retry
    lastActionInput = input;
    lastActionType = actionType;

    // Mark as loading while processing
    dispatch({ type: 'ui/SET_LOADING', payload: true });

    try {
      // Extract existing journal entries and inventory items
      const journalEntries = getEntriesFromJournal(state.journal);
      const inventoryItems = getItemsFromInventory(state.inventory);

      // Get the action type from the action itself if provided in the UI/state
      const actionObj = state.suggestedActions?.find(action => action.title === input);
      const effectiveActionType = actionType || (actionObj?.type as string) || 'basic';

      // Add player input to narrative history
      dispatch({
        type: 'ADD_NARRATIVE_HISTORY',
        payload: `Player: ${input}`
      });

      try {
        // Get AI response
        const response = await getAIResponse({
          prompt: input,
          journalContext: getJournalContext(journalEntries),
          inventory: inventoryItems
        });

        // Add AI response to narrative history
        dispatch({
          type: 'ADD_NARRATIVE_HISTORY',
          payload: response.narrative
        });

        
        // Generate summary using the dedicated AI function
        const aiSummary = await generateNarrativeSummary(input, response.narrative);

        // Create a properly typed journal entry that preserves the summary
        const journalEntry = createJournalEntry(response.narrative, aiSummary, 'narrative');
        
        // Super verbose debug logging to track the summary through the system
        
        // Dispatch with an explicit type so that our reducer knows how to handle it
        dispatch({
          type: 'journal/ADD_ENTRY',
          payload: journalEntry
        });
        

        // Update suggested actions if available
        if (response.suggestedActions) {
          // Convert response suggested actions to proper typed actions
          const typedSuggestedActions: SuggestedAction[] = response.suggestedActions.map(action => ({
            id: action.id || `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: action.title,
            description: action.description || action.title,
            type: (action.type as ActionType) || 'basic'
          }));
          
          dispatch({
            type: 'SET_SUGGESTED_ACTIONS',
            payload: typedSuggestedActions
          });
        }

        // Handle acquired items
        if (response.acquiredItems?.length > 0) {
          response.acquiredItems.forEach((itemName) => {
            const newItem: InventoryItem = {
              id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: itemName,
              description: itemName,
              quantity: 1,
              category: 'general' as ItemCategory,
            };
            dispatch({ type: 'inventory/ADD_ITEM', payload: newItem });
          });
        }

        // Handle removed items
        if (response.removedItems?.length > 0) {
          response.removedItems.forEach((itemName: string) => {
            const itemToRemove = inventoryItems.find(
              (item: InventoryItem) => item.name === itemName
            );
            if (itemToRemove) {
              dispatch({ type: 'inventory/REMOVE_ITEM', payload: itemToRemove.id });
            }
          });
        }

        // Update location if provided
        if (response.location) {
          dispatch({ 
            type: 'SET_LOCATION', 
            payload: response.location 
          });
        }

        // Handle combat initiation if needed
        if (response.combatInitiated && response.opponent) {
          // Set combat as active
          dispatch({
            type: 'combat/SET_ACTIVE',
            payload: true
          });
          
          // Add opponent to participants
          const opponentParticipant = response.opponent as CombatParticipant;
          
          // Update combat state with participants and initial values
          dispatch({
            type: 'combat/UPDATE_STATE',
            payload: {
              isActive: true,
              rounds: 1,
              playerTurn: true,
              participants: [opponentParticipant]
            }
          });
        }
      } catch (error) {
        console.error('Error getting AI response:', error);
        
        // Create a fallback journal entry when AI service fails
        const fallbackEntry = generateActionFallbackEntry(input, effectiveActionType);
        
        // Add fallback entry to journal
        dispatch({
          type: 'journal/ADD_ENTRY',
          payload: fallbackEntry
        });
        
        
        // Fallback response if AI service fails
        dispatch({
          type: 'ADD_NARRATIVE_HISTORY',
          payload: `You ${input.toLowerCase()}. ${fallbackEntry.content}`
        });

        // Generate some fallback suggested actions
        const fallbackActions: SuggestedAction[] = [
          { id: 'fallback-gen-1', title: 'Focus on what you see', type: 'optional', description: 'Look more closely at your surroundings' },
          { id: 'fallback-gen-2', title: 'Check nearby buildings', type: 'optional', description: 'Investigate structures around you' },
          { id: 'fallback-gen-3', title: 'Look for armed individuals', type: 'optional', description: 'Scan for potential threats' },
          { id: 'fallback-gen-4', title: 'Ask about what you see', type: 'optional', description: 'Find someone to talk to about the area' }
        ];
        
        dispatch({
          type: 'SET_SUGGESTED_ACTIONS',
          payload: fallbackActions 
        });
      }

      return null;
    } catch (error) {
      console.error('Error in handleUserInput:', error);
      return null;
    } finally {
      // Mark as not loading once complete
      dispatch({ type: 'ui/SET_LOADING', payload: false });
    }
  };

  /**
   * Retries the last user action if one exists
   * 
   * @returns Promise resolving to null when complete
   */
  const retryLastAction = async () => {
    if (lastActionInput) {
      return handleUserInput(lastActionInput, lastActionType);
    }
    return null;
  };

  // Default props structure for when state/dispatch are missing
  const defaultProps: GameSessionProps = {
    state: initialGameState,
    dispatch: safeDispatch,
    isLoading: isLoading,
    error: null,
    isCombatActive: false,
    opponent: null,
    handleUserInput: () => { /* Default no-op */ },
    retryLastAction: () => { /* Default no-op */ },
    handleCombatEnd: () => {},
    handlePlayerHealthChange: localAdaptedHealthChangeHandler,
    handleUseItem,
    handleEquipWeapon,
    executeCombatRound: async () => { /* Default no-op */ },
    initiateCombat: () => { /* Default no-op */ },
    getCurrentOpponent: () => null,
  };

  // If state or dispatch is unavailable, return default props
  if (!state || !dispatch) {
    return defaultProps;
  }

  // Construct final props using direct arguments and derived values
  return {
    // Core props from arguments/state
    state: state,
    dispatch: safeDispatch,
    isLoading: isLoading,
    error: null,

    // Derived/Calculated props
    isCombatActive: state.combat?.isActive ?? false,
    opponent,
    handleEquipWeapon,
    handleUseItem,
    handlePlayerHealthChange: localAdaptedHealthChangeHandler,

    // Provide implementations for functions
    handleUserInput: handleUserInput,
    retryLastAction: retryLastAction,
    handleCombatEnd: () => {},
    executeCombatRound: async () => { /* Default no-op */ },
    initiateCombat: () => { /* Default no-op */ },
    getCurrentOpponent: () => opponent,
  };
}