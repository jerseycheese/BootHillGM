import { useCallback, useState } from 'react';
import { cleanCharacterName } from '../utils/combatUtils';
import { aiServiceInstance } from '../services/ai';
import { GameState } from '../types/gameState'; // Updated import path
import { GameEngineAction } from '../types/gameActions';
import { generateNarrativeSummary } from '../utils/aiService';
import { WEAPON_STATS } from '../types/combat';
import { GameServiceResponse } from '../services/ai/types/gameService.types';
import { presentDecision } from '../actions/narrativeActions';

// Export the service instance so it can be mocked in tests
export const aiService = aiServiceInstance;

/**
 * Parameters for processing AI response
 */
interface ProcessResponseParams {
  input: string;
  response: GameServiceResponse;
  state: GameState;
  dispatch: React.Dispatch<GameEngineAction>;
}

/**
 * Process AI response and update game state
 * 
 * @param params Processing parameters including input, response, state and dispatch
 * @returns Object with acquired and removed items
 */
const processAIResponse = async ({ input, response, state, dispatch }: ProcessResponseParams) => {
  const narrativeUpdate = state.narrative?.narrativeHistory
    ? `${state.narrative.narrativeHistory.join('')}\n\nPlayer: ${input}\n\nGame Master: ${response.narrative}`
    : response.narrative;

  // First dispatch SET_NARRATIVE (this is the one that has a different payload format)
  dispatch({ type: 'SET_NARRATIVE', payload: { text: narrativeUpdate } });

  // Then generate and dispatch the journal entry update
  const narrativeSummary = await generateNarrativeSummary(input, response.narrative);
  const timestamp = Date.now();

  // Create a consistent journal entry that matches both formats in the tests
  dispatch({
    type: 'UPDATE_JOURNAL',
    payload: {
      id: `journal_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: timestamp,
      type: 'narrative',
      content: input,
      narrativeSummary,
    },
  });

  // Only set location if it exists and has a name and type
  if (response.location && response.location.type &&
      (response.location.type === 'town' || response.location.type === 'landmark' ||
       (response.location.type === 'wilderness' && response.location.description))) {
    dispatch({ type: 'SET_LOCATION', payload: response.location });
  }

  // Process player decision if present
  if (response.playerDecision) {
    const action = presentDecision(response.playerDecision);
    dispatch(action);
  }

  if (response.combatInitiated && response.opponent) {
    // Add any combat narrative to the main narrative
    const opponentNameParts = response.opponent.name.split(/^[^.!?\n]+/);
    if (opponentNameParts[1]) {
      const narrativePart = opponentNameParts[1].trim();
      dispatch({
        type: 'SET_NARRATIVE',
        payload: { text: `${narrativeUpdate}\n${narrativePart}` },
      });
    }

    // Extract only the structured data fields for the opponent
    const structuredOpponent = {
      isNPC: true,
      isPlayer: false,
      id: `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: cleanCharacterName(response.opponent.name),
      attributes: {
        speed: response.opponent.attributes.speed,
        gunAccuracy: response.opponent.attributes.gunAccuracy,
        throwingAccuracy: response.opponent.attributes.throwingAccuracy,
        strength: response.opponent.attributes.strength,
        baseStrength: response.opponent.attributes.baseStrength,
        bravery: response.opponent.attributes.bravery,
        experience: response.opponent.attributes.experience
      },
      minAttributes: {
        speed: 1,
        gunAccuracy: 1,
        throwingAccuracy: 1,
        strength: 1,
        baseStrength: 1,
        bravery: 1,
        experience: 0
      },
      maxAttributes: {
        speed: 10,
        gunAccuracy: 10,
        throwingAccuracy: 10,
        strength: 10,
        baseStrength: 10,
        bravery: 10,
        experience: 100
      },
      inventory: response.opponent.inventory || [],
      weapon: response.opponent.weapon
        ? {
            id: `weapon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: response.opponent.weapon.name.split(/[.!?]/)[0].trim(),
            modifiers:
              WEAPON_STATS[response.opponent.weapon.name.split(/[.!?]/)[0].trim()] || {
                accuracy: 0,
                range: 0,
                reliability: 0,
                damage: '0d0',
                speed: 0,
              },
            ammunition: response.opponent.weapon.ammunition,
            maxAmmunition: response.opponent.weapon.maxAmmunition,
          }
        : undefined,
      wounds: response.opponent.wounds || [],
      isUnconscious: response.opponent.isUnconscious || false,
    };

    dispatch({
      type: 'SET_OPPONENT',
      payload: structuredOpponent,
    });

    // Initialize combat state with null combat type to trigger selection
    dispatch({
      type: 'UPDATE_COMBAT_STATE',
      payload: {
        isActive: true,
        combatType: null,
        currentTurn: 'player',
        winner: null,
        combatLog: [],
        participants: [],
        rounds: 0,
      },
    });

    dispatch({
      type: 'SET_COMBAT_ACTIVE',
      payload: true,
    });
  }

  const WEAPON_KEYWORDS = ['gun', 'rifle', 'pistol', 'revolver', 'peacemaker'];

  // Process acquired items
  const acquiredItems = response.acquiredItems || [];
  const processedItems: string[] = [];
  
  acquiredItems.forEach((item) => {
    const itemName = typeof item === 'string' ? item : item.name;
    processedItems.push(itemName);
    
    const isWeapon = WEAPON_KEYWORDS.some((keyword) =>
      itemName.toLowerCase().includes(keyword.toLowerCase())
    );

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: itemName,
        description: itemName,
        quantity: 1,
        category: isWeapon ? 'weapon' : 'general',
      },
    });
  });

  dispatch({
    type: 'SET_GAME_PROGRESS',
    payload: state.gameProgress + 1,
  });

  if (response.suggestedActions) {
    dispatch({
      type: 'SET_SUGGESTED_ACTIONS',
      payload: response.suggestedActions,
    });
  }

  return { acquiredItems: processedItems, removedItems: response.removedItems };
};

/**
 * Hook for handling AI interactions in the game
 * 
 * Manages user input, AI responses, and updating the game state based on those interactions
 * 
 * @param state Current game state
 * @param dispatch Dispatch function for updating state
 * @param onInventoryChange Callback for when inventory changes
 * @returns Object with interaction functions and loading state
 */
export const useAIInteractions = (
  state: GameState,
  dispatch: React.Dispatch<GameEngineAction>,
  onInventoryChange: (acquired: string[], removed: string[]) => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleUserInput = useCallback(
    async (input: string) => {
      setIsLoading(true);
      setError(null);
      setLastAction(input);

      try {
        // Get AI response using generateGameContent
        const characterData = {
          name: 'Player',
          inventory: { items: state.inventory?.items || [] },
          isNPC: false,
          isPlayer: true,
          id: 'current-player',
          attributes: {
            speed: 5,
            gunAccuracy: 5,
            throwingAccuracy: 5,
            strength: 5,
            baseStrength: 5,
            bravery: 5,
            experience: 0
          },
          minAttributes: {
            speed: 1,
            gunAccuracy: 1,
            throwingAccuracy: 1,
            strength: 1,
            baseStrength: 1,
            bravery: 1,
            experience: 0
          },
          maxAttributes: {
            speed: 10,
            gunAccuracy: 10,
            throwingAccuracy: 10,
            strength: 10,
            baseStrength: 10,
            bravery: 10,
            experience: 100
          },
          wounds: [],
          isUnconscious: false
        };
        
        // Generate content based on character data
        const response = await aiService.generateGameContent(characterData);
        
        // Process the response and update game state
        const { acquiredItems, removedItems } = await processAIResponse({
          input,
          response,
          state,
          dispatch,
        });
        
        // Notify about inventory changes
        onInventoryChange(acquiredItems || [], removedItems || []);
        
        return response;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [state, dispatch, onInventoryChange]
  );

  const retryLastAction = useCallback(async () => {
    if (!lastAction) return null;
    return handleUserInput(lastAction);
  }, [lastAction, handleUserInput]);

  return {
    handleUserInput,
    retryLastAction,
    isLoading,
    error,
  };
};