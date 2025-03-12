import { useCallback, useState } from 'react';
import { cleanCharacterName } from '../utils/combatUtils';
import { AIService } from '../services/ai';
import { GameState } from '../types/campaign';
import { GameEngineAction } from '../types/gameActions';
import { JournalEntry } from '../types/journal';
import { generateNarrativeSummary } from '../utils/aiService';
import { WEAPON_STATS } from '../types/combat';
import { AIResponse } from '../services/ai/types';
import { presentDecision } from '../reducers/narrativeReducer';

const aiService = new AIService();

const getJournalContext = (journal: JournalEntry[]) => {
  return journal.slice(-5).map(entry => entry.content).join('\n');
};

interface ProcessResponseParams {
  input: string;
  response: AIResponse;
  state: GameState;
  dispatch: React.Dispatch<GameEngineAction>;
}

const processAIResponse = async ({ input, response, state, dispatch }: ProcessResponseParams) => {
  const narrativeUpdate = state.narrative?.narrativeHistory
    ? `${state.narrative.narrativeHistory.join('')}\n\nPlayer: ${input}\n\nGame Master: ${response.narrative}`
    : response.narrative;

  dispatch({ type: 'SET_NARRATIVE', payload: { text: narrativeUpdate } });

  const narrativeSummary = await generateNarrativeSummary(input, response.narrative);

  dispatch({
    type: 'UPDATE_JOURNAL',
    payload: {
      timestamp: Date.now(),
      type: 'narrative' as const,
      content: input, // Use input as content
      narrativeSummary,
    },
  });

  if (response.location) {
    dispatch({ type: 'SET_LOCATION', payload: response.location });
  }

  if (response.playerDecision) {
    dispatch(presentDecision(response.playerDecision));
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
        experience: response.opponent.attributes.experience,
      },
      minAttributes: {
        speed: 1,
        gunAccuracy: 1,
        throwingAccuracy: 1,
        strength: 1,
        baseStrength: 1,
        bravery: 1,
        experience: 0,
      },
      maxAttributes: {
        speed: 10,
        gunAccuracy: 10,
        throwingAccuracy: 10,
        strength: 10,
        baseStrength: 10,
        bravery: 10,
        experience: 100,
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

    dispatch({ type: 'SET_CHARACTER', payload: structuredOpponent });
  }

  const WEAPON_KEYWORDS = ['gun', 'rifle', 'pistol', 'revolver', 'peacemaker'];

  (response.acquiredItems || []).forEach((itemName) => {
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

  return { acquiredItems: response.acquiredItems, removedItems: response.removedItems };
};

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
        const journalContext = getJournalContext(state.journal || []);
        
        // The getAIResponse method in AIService only accepts 3 parameters, not 4
        const aiResponse = await aiService.getAIResponse(
          input,
          journalContext,
          state.inventory || []
        );
        const { acquiredItems, removedItems } = await processAIResponse({
          input,
          response: aiResponse,
          state,
          dispatch,
        });
        onInventoryChange(acquiredItems, removedItems);
        return aiResponse;
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
    if (!lastAction) return;
    return handleUserInput(lastAction);
  }, [lastAction, handleUserInput]);

  return {
    handleUserInput,
    retryLastAction,
    isLoading,
    error,
  };
};
