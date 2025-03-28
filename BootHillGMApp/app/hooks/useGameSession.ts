import { useState, useCallback } from 'react';
import { useCampaignState } from '../components/CampaignStateManager';
import { useLocation } from './useLocation';
import { getAIResponse } from '../services/ai/gameService';
import { getJournalContext, addJournalEntry } from '../utils/JournalManager';
import { useCombatManager } from './useCombatManager';
import { InventoryItem, ItemCategory } from '../types/item.types';
import { InventoryManager } from '../utils/inventoryManager';
import { addNarrativeHistory } from '../actions/narrativeActions';
import { Character } from '../types/character';
import { CampaignState } from '../types/campaign';
import { LocationType } from '../services/locationService';
import { SuggestedAction } from '../types/campaign';
import { getPlayerFromCharacter, getItemsFromInventory, getEntriesFromJournal } from './selectors/typeGuards';
import { CharacterState } from '../types/state/characterState';
import { InventoryState } from '../types/state/inventoryState';
import { JournalState } from '../types/state/journalState';
import { NarrativeState } from '../types/narrative.types';
import { JournalEntry } from '../types/journal';
import { NarrativeChoice, NarrativeDisplayMode } from '../types/narrative/choice.types';

// Define a type that encompasses both possible state structures
type StateWithMixedStructure = {
  currentPlayer?: string;
  npcs?: string[];
  character?: Character | CharacterState | { player?: Character; opponent?: Character };
  location?: LocationType | null;
  savedTimestamp?: number;
  gameProgress?: number;
  journal?: JournalState | JournalEntry[] | { entries?: JournalEntry[] };
  narrative?: NarrativeState | {
    currentStoryPoint?: unknown;
    visitedPoints?: unknown[];
    availableChoices?: unknown[];
    narrativeHistory?: unknown[];
    displayMode?: string;
  };
  inventory?: InventoryState | InventoryItem[] | { items?: InventoryItem[] };
  quests?: string[];
  combat?: { isActive?: boolean; [key: string]: unknown };
  opponent?: Character | null;
  isClient?: boolean;
  suggestedActions?: SuggestedAction[];
  combatState?: unknown;
  [key: string]: unknown;
};

// Helper function to create a state object compatible with CampaignState
const createCompatibleState = (state: StateWithMixedStructure, isCombatActive: boolean): CampaignState & { isCombatActive: boolean } => {
  // Extract opponent from character state if available
  const opponent = state.character &&
    typeof state.character === 'object' &&
    'opponent' in state.character
      ? (state.character as { opponent?: Character }).opponent
      : state.opponent || null;
  
  // Create a default narrative state that matches NarrativeState interface
  const defaultNarrativeState: NarrativeState = {
    currentStoryPoint: null,
    visitedPoints: [],
    availableChoices: [],
    narrativeHistory: [],
    displayMode: 'standard'
  };
  
  // Process narrative state based on its type
  let narrativeState = defaultNarrativeState;
  
  if (state.narrative) {
    if (typeof state.narrative === 'string') {
      // Convert string to basic narrative state
      narrativeState = {
        ...defaultNarrativeState,
        narrativeHistory: [state.narrative]
      };
    } else if (typeof state.narrative === 'object') {
      // Extract properties safely
      const narrativeObj = state.narrative as Record<string, unknown>;
      
      // Create properly typed narrative choices if they exist
      const availableChoices: NarrativeChoice[] = [];
      if (Array.isArray(narrativeObj.availableChoices)) {
        for (const choice of narrativeObj.availableChoices) {
          if (typeof choice === 'object' && choice !== null) {
            const choiceObj = choice as Record<string, unknown>;
            if (typeof choiceObj.id === 'string' && typeof choiceObj.text === 'string') {
              availableChoices.push({
                id: choiceObj.id,
                text: choiceObj.text,
                leadsTo: typeof choiceObj.leadsTo === 'string' ? choiceObj.leadsTo : 'unknown'
              });
            }
          }
        }
      }
      
      narrativeState = {
        currentStoryPoint: null, // We can't safely reconstruct a StoryPoint
        visitedPoints: Array.isArray(narrativeObj.visitedPoints) ?
          narrativeObj.visitedPoints.filter(p => typeof p === 'string') as string[] : [],
        availableChoices,
        narrativeHistory: Array.isArray(narrativeObj.narrativeHistory) ?
          narrativeObj.narrativeHistory.filter(h => typeof h === 'string') as string[] : [],
        displayMode: typeof narrativeObj.displayMode === 'string' ?
          narrativeObj.displayMode as NarrativeDisplayMode : 'standard'
      };
    }
  }
  
  // Create a compatible state object
  return {
    currentPlayer: state.currentPlayer || '',
    npcs: state.npcs || [],
    character: getPlayerFromCharacter(state.character as (CharacterState | Character | null | undefined)) || null,
    location: state.location || null,
    savedTimestamp: state.savedTimestamp,
    gameProgress: state.gameProgress || 0,
    journal: getEntriesFromJournal(state.journal as (JournalState | JournalEntry[] | null | undefined)),
    narrative: narrativeState,
    inventory: getItemsFromInventory(state.inventory as (InventoryState | InventoryItem[] | null | undefined)),
    quests: state.quests || [],
    isCombatActive,
    opponent: opponent || null,
    isClient: state.isClient,
    suggestedActions: state.suggestedActions || [],
    // Just omit combatState since we're handling isActive separately
    combatState: undefined,
    get player() {
      return this.character;
    }
  };
};

// Parameters for updating the narrative display
type UpdateNarrativeParams = {
  text: string;
  playerInput?: string;
  acquiredItems?: string[];
  removedItems?: string[];
};

/**
 * Hook to manage the core game session functionality.
 * Handles user interactions, narrative progression, inventory management,
 * and coordinates with the combat system.
 *
 * Key features:
 * - Manages game state and narrative flow
 * - Processes user input and AI responses
 * - Handles inventory modifications
 * - Coordinates combat encounters
 * - Provides error handling and retry capabilities
 *
 * @returns Object containing game session state and handler functions
 */

export const useGameSession = () => {
  const { state, dispatch } = useCampaignState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [usingItems, setUsingItems] = useState<{ [itemId: string]: boolean }>({});
  const { updateLocation } = useLocation();

  const isUsingItem = useCallback((itemId: string) => {
      return !!usingItems[itemId];
  }, [usingItems]);

  // Updates the game narrative using the narrativeReducer
  const updateNarrative = useCallback(
    (textOrParams: string | UpdateNarrativeParams) => {
      let text: string;
      let playerInput: string | undefined;

      if (typeof textOrParams === 'string') {
        text = textOrParams;
      } else {
        text = textOrParams.text;
        playerInput = textOrParams.playerInput;
      }

      // Dispatch ADD_NARRATIVE_HISTORY action
      // Prefix player input with "Player:" to ensure it's identified as a player action
      const combinedText = playerInput ? `Player: ${playerInput}\n${text}` : text;
      dispatch(addNarrativeHistory(combinedText));

    }, [dispatch]);

    const combatManager = useCombatManager({
        onUpdateNarrative: updateNarrative
    });

  // Processes user input and updates game state accordingly
  const handleUserInput = useCallback(async (input: string) => {
    setIsLoading(true);
    setError(null);
    setLastAction(input);  // Store the last action

    try {
      // Use helper functions to extract the right data structure
      const journalEntries = getEntriesFromJournal(state.journal);
      const inventoryItems = getItemsFromInventory(state.inventory);

      const response = await getAIResponse(
        input,
        getJournalContext(journalEntries),
        inventoryItems
      );

      // Update journal with the new action
      const updatedJournal = await addJournalEntry(journalEntries, input);

      // Update campaign state with new journal
      dispatch({
        type: 'UPDATE_JOURNAL',
        payload: updatedJournal,
      });

      if (response.combatInitiated && response.opponent) {
        updateNarrative({
          text: 'Combat has been initiated.',
          playerInput: input,
        });
        combatManager.initiateCombat(response.opponent);
      } else {
        updateNarrative({
          text: response.narrative,
          playerInput: input,
          acquiredItems: response.acquiredItems,
          removedItems: response.removedItems
        });
        updateLocation(response.location);
      }

      if (response.acquiredItems?.length > 0) {
        response.acquiredItems.forEach((itemName) => {
          const newItem: InventoryItem = {
            id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: itemName,
            description: itemName,
            quantity: 1,
            category: 'general' as ItemCategory,
          };
          dispatch({ type: 'ADD_ITEM', payload: newItem });
        });
      }

      if (!isUsingItem && response.removedItems?.length > 0) {
        response.removedItems.forEach((itemName: string) => {
          const itemToRemove = inventoryItems.find(
            (item: InventoryItem) => item.name === itemName
          );
          if (itemToRemove) {
            dispatch({ type: 'REMOVE_ITEM', payload: itemToRemove.id });
          }
        });
      }

      if (response.suggestedActions) {
        dispatch({
          type: 'SET_SUGGESTED_ACTIONS',
          payload: response.suggestedActions,
        });
      }

      return response;
    } catch (error) {
      console.error('Error in handleUserInput:', error);
      setError('An unexpected error occurred');
      // TODO: Implement more robust error handling, e.g., displaying a user-friendly message or providing a retry option.
    } finally {
      setIsLoading(false);
    }
  }, [
    dispatch,
    state.inventory,
    state.journal,
    updateNarrative,
    isUsingItem,
    combatManager,
    updateLocation, // Add updateLocation to dependency array
  ]);

    // Fixed retryLastAction to properly call handleUserInput
    const retryLastAction = useCallback(async () => {
        if (lastAction) {
            return await handleUserInput(lastAction);
        }
        return null;  // Explicit return for clarity
    }, [lastAction, handleUserInput]);

    // Handles using an item from the inventory
    // Updates both the inventory state and narrative display
    const handleUseItem = useCallback(async (itemId: string) => {
      const inventoryItems = getItemsFromInventory(state.inventory);
      const item = inventoryItems.find((i: InventoryItem) => i.id === itemId);
      
      if (!item) {
        setError(`Item not found in inventory: ${itemId}`);
        return;
      }

      // Validate item use *before* calling getAIResponse
      const playerCharacter = getPlayerFromCharacter(state.character);
      const isCombatActive = state.combat && 
        typeof state.combat === 'object' && 
        'isActive' in state.combat ? 
        !!state.combat.isActive : false;
      
      // Create a compatible state for the validateItemUse function
      const stateWithMixedStructure = state as unknown as StateWithMixedStructure;
      const compatibleState = createCompatibleState(stateWithMixedStructure, isCombatActive);
      
      const validationResult = InventoryManager.validateItemUse(
        item,
        playerCharacter || undefined,
        compatibleState
      );
      
      if (!validationResult.valid) {
        setError(validationResult.reason || `Cannot use ${item.name}`);
        return;
      }

      try {
        setUsingItems(prev => ({ ...prev, [itemId]: true }));
        setIsLoading(true);

        // Get the AI response for using this item
        const actionText = `use ${item.name}`;
        const journalEntries = getEntriesFromJournal(state.journal);
        
        const response = await getAIResponse(
          actionText,
          getJournalContext(journalEntries),
          inventoryItems
        );

        // Now dispatch the USE_ITEM action *after* getting the AI response
        dispatch({ type: 'USE_ITEM', payload: itemId });

        // Update journal with the new action
        const updatedJournal = await addJournalEntry(journalEntries, actionText);
        dispatch({
          type: 'UPDATE_JOURNAL',
          payload: updatedJournal,
        });

        // Explicitly update the narrative with the item usage
        updateNarrative({
          text: response.narrative || `You use the ${item.name}.`,
          playerInput: actionText,
          removedItems: response.removedItems && response.removedItems.length > 0 ? [item.name] : undefined
        });

        // Handle any location changes from the response
        if (response.location) {
          updateLocation(response.location);
        }

        // Handle suggested actions if any
        if (response.suggestedActions) {
          dispatch({
            type: 'SET_SUGGESTED_ACTIONS',
            payload: response.suggestedActions,
          });
        }

        return response;
      } catch (error) {
        console.error('Error in handleUseItem:', error);
        setError(`Failed to use ${item.name}. Please try again.`);
      } finally {
        setUsingItems(prev => ({ ...prev, [itemId]: false }));
        setIsLoading(false);
      }
    }, [
      state,
      dispatch,
      updateNarrative,
      updateLocation,
      setUsingItems,
    ]);

    return {
      state,
      dispatch,
      isLoading,
      error,
      handleUserInput,
      retryLastAction,
      handleUseItem,
      isUsingItem,
      ...combatManager
    };
};

// Empty mock object that's safe for production builds
export const __mocks = {
  // Implementation is replaced in test environment
  handleUserInput: () => Promise.resolve({}),
  retryLastAction: () => Promise.resolve(null)
};
