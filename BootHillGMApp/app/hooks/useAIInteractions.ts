import { useCallback, useState } from 'react';
import { cleanCharacterName } from '../utils/combatUtils';
import { AIService } from '../services/ai';
import { GameState, SuggestedAction } from '../types/campaign';
import { GameEngineAction } from '../utils/gameEngine';
import { JournalEntry } from '../types/journal';
import { Character } from '../types/character';
import { generateNarrativeSummary } from '../utils/aiService';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const aiService = new AIService(API_KEY);

type AIResponse = {
  narrative: string;
  location?: string;
  combatInitiated?: boolean;
  opponent?: Character;
  acquiredItems: string[];
  removedItems: string[];
  suggestedActions?: SuggestedAction[];
};

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
  const narrativeUpdate = state.narrative 
    ? `${state.narrative}\n\nPlayer: ${input}\n\nGame Master: ${response.narrative}`
    : response.narrative;

  dispatch({ type: 'SET_NARRATIVE', payload: narrativeUpdate });

  const narrativeSummary = await generateNarrativeSummary(
    input,
    `${state.character?.name || 'You'} ${input}`
  );

  dispatch({
    type: 'UPDATE_JOURNAL',
    payload: {
      timestamp: Date.now(),
      type: 'narrative' as const,
      content: input,
      narrativeSummary
    }
  });

  if (response.location) {
    dispatch({ type: 'SET_LOCATION', payload: response.location });
  }

  if (response.combatInitiated && response.opponent) {
    // Extract only the structured data fields for the opponent
    const structuredOpponent = {
      name: response.opponent.name.split(/[.!?\n]/)[0].split(/\s+(?=[A-Z])/)[0].trim(),
      attributes: {
        speed: response.opponent.attributes.speed,
        gunAccuracy: response.opponent.attributes.gunAccuracy,
        throwingAccuracy: response.opponent.attributes.throwingAccuracy,
        strength: response.opponent.attributes.strength,
        baseStrength: response.opponent.attributes.baseStrength,
        bravery: response.opponent.attributes.bravery,
        experience: response.opponent.attributes.experience
      },
      skills: {
        shooting: response.opponent.skills.shooting,
        riding: response.opponent.skills.riding,
        brawling: response.opponent.skills.brawling
      },
      weapon: response.opponent.weapon ? {
        name: response.opponent.weapon.name.split(/[.!?]/)[0].trim(),
        damage: response.opponent.weapon.damage
      } : undefined,
      wounds: response.opponent.wounds || [],
      isUnconscious: response.opponent.isUnconscious || false
    };
    
    dispatch({
      type: 'SET_OPPONENT',
      payload: structuredOpponent
    });
    
    // Initialize combat state with null combat type to trigger selection
    dispatch({
      type: 'UPDATE_COMBAT_STATE',
      payload: {
        isActive: true,
        combatType: null,
        playerStrength: state.character?.attributes.strength ?? 0,
        opponentStrength: response.opponent.attributes.strength,
        currentTurn: 'player',
        winner: null,
        summary: null,
        combatLog: []
      }
    });
    
    dispatch({
      type: 'SET_COMBAT_ACTIVE',
      payload: true
    });

    dispatch({ type: 'SET_CHARACTER', payload: response.opponent });
  }

  const WEAPON_KEYWORDS = ['gun', 'rifle', 'pistol', 'revolver', 'peacemaker'];

  response.acquiredItems.forEach(itemName => {
    const isWeapon = WEAPON_KEYWORDS.some(keyword => 
      itemName.toLowerCase().includes(keyword.toLowerCase())
    );
    
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: itemName,
        description: itemName,
        quantity: 1,
        category: isWeapon ? 'weapon' : 'general'
      }
    });
  });

  dispatch({ 
    type: 'SET_GAME_PROGRESS', 
    payload: state.gameProgress + 1
  });

  if (response.suggestedActions) {
    dispatch({
      type: 'SET_SUGGESTED_ACTIONS',
      payload: response.suggestedActions
    });
  }

  return { acquiredItems: response.acquiredItems, removedItems: response.removedItems };
};

export const useAIInteractions = (
  state: GameState,
  dispatch: React.Dispatch<GameEngineAction>,
  onInventoryChange: (acquired: string[], removed: string[]) => void,
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleUserInput = useCallback(async (input: string) => {
    setIsLoading(true);
    setError(null);
    setLastAction(input);

    try {
      const journalContext = getJournalContext(state.journal || []);
      const response = await aiService.getResponse(
        input, 
        journalContext,
        { 
          inventory: state.inventory || [],
          character: state.character || undefined,
          location: state.location
        }
      );

      const { acquiredItems, removedItems } = await processAIResponse({
        input,
        response,
        state,
        dispatch
      });

      onInventoryChange(acquiredItems, removedItems);
      return response;
    } catch (err) {
      console.error('Error in handleUserInput:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [state, dispatch, onInventoryChange]);

  const retryLastAction = useCallback(async () => {
    if (!lastAction) return;
    return handleUserInput(lastAction);
  }, [lastAction, handleUserInput]);

  return {
    handleUserInput,
    retryLastAction,
    isLoading,
    error
  };
};
