'use client';

import { useState, FormEvent } from 'react';
import { useGameSession } from '../hooks/useGameSession';
import { useAIWithOptimizedContext } from '../utils/narrative';
import { AIRequestResult } from '../types/ai.types';
import { LocationType } from '../services/locationService';
import { InventoryItem, ItemCategory } from '../types/item.types';
import { Character } from '../types/character';
import { JournalUpdatePayload } from '../types/gameActions';
import { v4 as uuidv4 } from 'uuid';
import { ActionTypes } from '../types/actionTypes';
import { /* removed updateNarrative, clearError */ } from '../actions/narrativeActions';
import { updateJournal } from '../actions/journalActions';

interface OpponentCharacter {
  name?: string;
  id?: string;
}

export default function GamePromptWithOptimizedContext() {
  const session = useGameSession();
  // Remove unused variables with underscore prefix
  const { state, dispatch, updateNarrative } = session;
  
  // Remove unused functions
  // const makeAIRequest = ...
  // const makeAIRequestWithCompactContext = ...
  
  const {
    makeAIRequestWithFocus,
    isLoading,
    error,
    clearError // Add clearError from the hook
  } = useAIWithOptimizedContext();
  
  const [inputText, setInputText] = useState('');
  const [debugMode, setDebugMode] = useState(false);

  const getFocusTagsFromGameState = () => {
    const tags: string[] = [];
    
    if (state.location) {
      // Access current location object for type
      const loc = state.location;
      if (loc.type === 'town' && loc.name) {
        tags.push(`town:${loc.name}`);
      } else if (loc.type) {
        tags.push(`location:${loc.type}`);
      }
    }
    
    const opponent = state.character && 'opponent' in state.character 
      ? state.character.opponent 
      : (state as unknown as { opponent?: OpponentCharacter }).opponent;
    
    if (state.combat?.isActive && opponent?.name) {
      tags.push(`character:${opponent.name}`);
    }
    
    if (state.narrative?.narrativeContext) {
      if (state.narrative.narrativeContext.characterFocus) {
        state.narrative.narrativeContext.characterFocus.forEach((character: string) => {
          tags.push(`character:${character}`);
        });
      }
      
      if (state.narrative.narrativeContext.themes) {
        state.narrative.narrativeContext.themes.forEach((theme: string) => {
          tags.push(`theme:${theme}`);
        });
      }
    }
    
    return tags;
  };
  
  const handleAIResponse = (response: AIRequestResult) => {
    if (response.narrative) {
      // Use hook-provided updater instead of dispatch
      updateNarrative({
        text: response.narrative, // Pass the new narrative text to the 'text' property
      });
    }
    
    if (response.location) {
      const locationToSet = typeof response.location === 'string' 
        ? { type: 'unknown', description: response.location } as LocationType 
        : response.location;
        
      dispatch({
        type: ActionTypes.SET_LOCATION,
        payload: locationToSet
      });
    }
    
    if (response.combatInitiated) {
      dispatch({ 
        type: ActionTypes.SET_COMBAT_ACTIVE,
        payload: true 
      });
      
      if (response.opponent) {
        const characterPayload: Partial<Character> = {
          id: `npc-${response.opponent.name?.replace(/\s+/g, '-') || uuidv4()}`, 
          name: response.opponent.name || 'Unknown Opponent',
          isNPC: true, 
          isPlayer: false,
          attributes: {
            strength: response.opponent.attributes?.strength ?? response.opponent.strength ?? 10,
            baseStrength: response.opponent.attributes?.baseStrength ?? response.opponent.attributes?.strength ?? response.opponent.strength ?? 10,
            speed: response.opponent.attributes?.speed ?? 10,
            gunAccuracy: response.opponent.attributes?.gunAccuracy ?? 10,
            throwingAccuracy: response.opponent.attributes?.throwingAccuracy ?? 10,
            bravery: response.opponent.attributes?.bravery ?? 10,
            experience: response.opponent.attributes?.experience ?? 0,
          },
          inventory: { items: [] },
          wounds: [],
          isUnconscious: false,
          minAttributes: { speed: 1, gunAccuracy: 1, throwingAccuracy: 1, strength: 1, baseStrength: 1, bravery: 1, experience: 0 },
          maxAttributes: { speed: 20, gunAccuracy: 20, throwingAccuracy: 20, strength: 20, baseStrength: 20, bravery: 20, experience: 100 },
        };
        dispatch({ 
          type: ActionTypes.SET_OPPONENT,
          payload: characterPayload as Character
        });
      }
    }
    
    if (response.acquiredItems && response.acquiredItems.length > 0) {
      response.acquiredItems.forEach((acquiredItemData: unknown) => {
        let itemName: string | undefined;
        let itemCategory: ItemCategory | undefined;
        const validCategories: ItemCategory[] = ['general', 'weapon', 'consumable', 'medical'];

        if (typeof acquiredItemData === 'object' && acquiredItemData !== null && 'name' in acquiredItemData && typeof acquiredItemData.name === 'string') {
          itemName = acquiredItemData.name;
          if ('category' in acquiredItemData && typeof acquiredItemData.category === 'string' && validCategories.includes(acquiredItemData.category as ItemCategory)) {
            itemCategory = acquiredItemData.category as ItemCategory;
          }
        }
        else if (typeof acquiredItemData === 'object' && acquiredItemData !== null && 'name' in acquiredItemData && typeof acquiredItemData.name === 'object' && acquiredItemData.name !== null && 'name' in acquiredItemData.name && typeof acquiredItemData.name.name === 'string') {
          itemName = acquiredItemData.name.name;
          if ('category' in acquiredItemData.name && typeof acquiredItemData.name.category === 'string' && validCategories.includes(acquiredItemData.name.category as ItemCategory)) {
            itemCategory = acquiredItemData.name.category as ItemCategory;
          }
        }
        else if (typeof acquiredItemData === 'string') {
          itemName = acquiredItemData;
          itemCategory = undefined;
        }

        if (typeof itemName !== 'string') {
          console.warn('[GamePrompt] Could not extract valid item name from acquiredItem structure:', acquiredItemData);
          return;
        }

        const category = itemCategory ?? 'general';

        const inventoryItem: InventoryItem = {
          id: uuidv4(),
          name: itemName,
          quantity: 1,
          description: `A ${itemName}`,
          category: category
        };

        dispatch({
          type: ActionTypes.ADD_ITEM,
          payload: inventoryItem
        });
      });
    }
    
    if (response.removedItems && response.removedItems.length > 0) {
      response.removedItems.forEach((itemName: string) => {
        dispatch({ 
          type: ActionTypes.REMOVE_ITEM,
          payload: itemName 
        });
      });
    }
    
    if (response.storyProgression) {
      const journalEntry: JournalUpdatePayload = {
        id: uuidv4(),
        content: response.storyProgression.description ?? '', 
        timestamp: Date.now(),
        type: 'narrative',
        narrativeSummary: response.storyProgression.title || 'Story Development'
      };
      
      dispatch(updateJournal(journalEntry));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim() || isLoading) return;
    
    try {
      const userPrompt = inputText;
      setInputText('');
      
      const focusTags = getFocusTagsFromGameState();
      
      const inventoryItems = state.inventory && 'items' in state.inventory 
        ? state.inventory.items 
        : (state.inventory as unknown as InventoryItem[]) || [];
      
      const response = await makeAIRequestWithFocus(
        userPrompt,
        inventoryItems,
        focusTags
      );
      
      handleAIResponse(response);
      
      if (debugMode && process.env.NODE_ENV !== 'production' && response.contextQuality) {
        console.log('Context Quality:', response.contextQuality);
      }
    } catch {
      // Error is handled by the hook
    }
  };
  
  return (
    <div className="game-prompt mt-4">
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="What will you do?"
            className="flex-grow p-2 border rounded"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
          >
            {isLoading ? 'Thinking...' : 'Send'}
          </button>
        </div>
        
        {error && (
          <div className="text-red-600 mt-2 p-3 bg-red-50 border border-red-200 rounded">
            <div className="font-bold">Error:</div>
            <div>{error.message}</div>
            <button 
              onClick={clearError} // Use the correct function to clear the error
              className="text-sm text-blue-600 hover:underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}
        
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <input
              type="checkbox"
              id="debug-mode"
              checked={debugMode}
              onChange={() => setDebugMode(!debugMode)}
              className="mr-2"
            />
            <label htmlFor="debug-mode">
              Debug Mode (logs optimization stats)
            </label>
          </div>
        )}
      </form>
    </div>
  );
}