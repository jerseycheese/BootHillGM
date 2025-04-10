'use client';

import { useState, FormEvent } from 'react';
import { useGameSession } from '../hooks/useGameSession';
import { useAIWithOptimizedContext } from '../utils/narrative';
import { AIRequestResult } from '../types/ai.types';
import { LocationType } from '../services/locationService';
import { InventoryItem, ItemCategory } from '../types/item.types'; // Import ItemCategory
import { Character } from '../types/character';
import { JournalUpdatePayload } from '../types/gameActions';
import { v4 as uuidv4 } from 'uuid';

interface OpponentCharacter {
  name?: string;
  id?: string;
}

/**
 * Game prompt component that uses optimized narrative context
 * Drop-in replacement for the standard prompt component
 */
export default function GamePromptWithOptimizedContext() {
  const { state, dispatch } = useGameSession();
  const { 
    makeAIRequestWithFocus,
    isLoading, 
    error 
  } = useAIWithOptimizedContext();
  
  const [inputText, setInputText] = useState('');
  const [debugMode, setDebugMode] = useState(false);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim() || isLoading) return;
    
    try {
      const userPrompt = inputText;
      setInputText('');
      
      const focusTags = getFocusTagsFromGameState();
      
      const inventoryItems = state.inventory && 'items' in state.inventory 
        ? state.inventory.items 
        : (state.inventory as unknown as InventoryItem[] || []);
      
      const response = await makeAIRequestWithFocus(
        userPrompt,
        inventoryItems,
        focusTags
      );
      
      handleAIResponse(response);
      
      if (debugMode && process.env.NODE_ENV !== 'production' && response.contextQuality) {
      }
    } catch {
      // Error is handled by the hook
    }
  };
  
  const getFocusTagsFromGameState = () => {
    const tags: string[] = [];
    
    if (state.location) {
      if (typeof state.location === 'string') {
        tags.push(`location:${state.location}`);
      } else if (state.location.type === 'town' && state.location.name) {
        tags.push(`town:${state.location.name}`);
      } else if (state.location.type) {
        tags.push(`location:${state.location.type}`);
      }
    }
    
    const opponent = state.character && 'opponent' in state.character 
      ? state.character.opponent 
      : (state as unknown as { opponent?: OpponentCharacter }).opponent;
    
    // Access combat status via the combat slice
    if (state.combat?.isActive && opponent?.name) {
      tags.push(`character:${opponent.name}`);
    }
    
    if (state.narrative?.narrativeContext) {
      if (state.narrative.narrativeContext.characterFocus) {
        state.narrative.narrativeContext.characterFocus.forEach(character => {
          tags.push(`character:${character}`);
        });
      }
      
      if (state.narrative.narrativeContext.themes) {
        state.narrative.narrativeContext.themes.forEach(theme => {
          tags.push(`theme:${theme}`);
        });
      }
    }
    
    return tags;
  };
  
  const handleAIResponse = (response: AIRequestResult) => {
    if (response.narrative) {
      dispatch({ 
        type: 'UPDATE_NARRATIVE', 
        payload: {
          narrativeHistory: [...state.narrative?.narrativeHistory || [], response.narrative],
        }
      });
    }
    
    if (response.location) {
      const locationToSet = typeof response.location === 'string' 
        ? { type: 'unknown', description: response.location } as LocationType 
        : response.location;
        
      dispatch({ 
        type: 'SET_LOCATION', 
        payload: locationToSet 
      });
    }
    
    if (response.combatInitiated) {
      dispatch({ 
        type: 'combat/SET_ACTIVE', // Use namespaced type
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
          // Add missing required properties with default values
          minAttributes: { speed: 1, gunAccuracy: 1, throwingAccuracy: 1, strength: 1, baseStrength: 1, bravery: 1, experience: 0 },
          maxAttributes: { speed: 20, gunAccuracy: 20, throwingAccuracy: 20, strength: 20, baseStrength: 20, bravery: 20, experience: 100 },
        };
        dispatch({ 
          type: 'character/SET_OPPONENT', // Use namespaced type
          payload: characterPayload as Character // Explicitly cast to Character
        });
      }
    }
    
    if (response.acquiredItems && response.acquiredItems.length > 0) {
      // Handle potentially nested acquiredItems structure using type guards
      response.acquiredItems.forEach((acquiredItemData: unknown) => {
        let itemName: string | undefined;
        let itemCategory: ItemCategory | undefined;
        const validCategories: ItemCategory[] = ['general', 'weapon', 'consumable', 'medical'];

        // Type guard for expected structure: { name: string; category?: ItemCategory }
        if (typeof acquiredItemData === 'object' && acquiredItemData !== null && 'name' in acquiredItemData && typeof acquiredItemData.name === 'string') {
          itemName = acquiredItemData.name;
          if ('category' in acquiredItemData && typeof acquiredItemData.category === 'string' && validCategories.includes(acquiredItemData.category as ItemCategory)) {
            itemCategory = acquiredItemData.category as ItemCategory;
          }
        }
        // Type guard for observed nested structure: { name: { name: string; category: string }; ... }
        else if (typeof acquiredItemData === 'object' && acquiredItemData !== null && 'name' in acquiredItemData && typeof acquiredItemData.name === 'object' && acquiredItemData.name !== null && 'name' in acquiredItemData.name && typeof acquiredItemData.name.name === 'string') {
          itemName = acquiredItemData.name.name;
          if ('category' in acquiredItemData.name && typeof acquiredItemData.name.category === 'string' && validCategories.includes(acquiredItemData.name.category as ItemCategory)) {
            itemCategory = acquiredItemData.name.category as ItemCategory;
          }
        }
        // Type guard for string fallback (old format)
        else if (typeof acquiredItemData === 'string') {
          itemName = acquiredItemData;
          itemCategory = undefined; // No category info from string
        }

        // If we couldn't extract a valid name, skip this item
        if (typeof itemName !== 'string') {
          console.warn('[GamePrompt] Could not extract valid item name from acquiredItem structure:', acquiredItemData);
          return;
        }

        // Default category if not found/invalid
        const category = itemCategory ?? 'general';

        const inventoryItem: InventoryItem = {
          id: uuidv4(),
          name: itemName,
          quantity: 1,
          description: `A ${itemName}`,
          category: category
        };

        dispatch({
          type: 'inventory/ADD_ITEM', // Use namespaced type
          payload: inventoryItem
        });
      });
    }
    
    if (response.removedItems && response.removedItems.length > 0) {
      response.removedItems.forEach((itemName: string) => {
        dispatch({ 
          type: 'inventory/REMOVE_ITEM', // Use namespaced type
          payload: itemName 
        });
      });
    }
    
    if (response.storyProgression) {
      // Create a strongly typed journal entry
      const journalEntry: JournalUpdatePayload = {
        id: uuidv4(),
        content: response.storyProgression.description ?? '', 
        timestamp: Date.now(),
        type: 'narrative',
        narrativeSummary: response.storyProgression.title || 'Story Development'
      };
      
      dispatch({
        type: 'UPDATE_JOURNAL',
        payload: journalEntry
      });
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
              onClick={() => dispatch({ type: 'CLEAR_ERROR' })} 
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
