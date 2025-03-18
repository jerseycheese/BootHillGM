'use client';

import { useState, FormEvent } from 'react';
import { useGameSession } from '../hooks/useGameSession';
import { useAIWithOptimizedContext } from '../utils/narrative';
import { AIRequestResult } from '../types/ai.types';
import { LocationType } from '../services/locationService';
import { InventoryItem } from '../types/item.types';
import { v4 as uuidv4 } from 'uuid';

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
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim() || isLoading) return;
    
    try {
      // Clear input
      const userPrompt = inputText;
      setInputText('');
      
      // Get currently relevant focus tags based on game state
      const focusTags = getFocusTagsFromGameState();
      
      // Use focused context for more specific and relevant responses
      const response = await makeAIRequestWithFocus(
        userPrompt,
        state.inventory || [],
        focusTags
      );
      
      // Process the AI response
      handleAIResponse(response);
      
      // Log optimization stats only in debug mode and development environment
      if (debugMode && process.env.NODE_ENV !== 'production' && response.contextQuality) {
        console.debug('Context optimization stats:', response.contextQuality);
      }
    } catch {
      // Error is already handled by the hook
      // No need to do anything here as the error will be displayed from the hook's error state
    }
  };
  
  // Extract relevant focus tags from the current game state
  const getFocusTagsFromGameState = () => {
    const tags: string[] = [];
    
    // Add location tag
    if (state.location) {
      if (typeof state.location === 'string') {
        tags.push(`location:${state.location}`);
      } else if (state.location.type === 'town' && state.location.name) {
        tags.push(`town:${state.location.name}`);
      } else if (state.location.type) {
        tags.push(`location:${state.location.type}`);
      }
    }
    
    // Add character tags - prioritize the current opponent if in combat
    if (state.isCombatActive && state.opponent?.name) {
      tags.push(`character:${state.opponent.name}`);
    }
    
    // Add narrative context tags
    if (state.narrative?.narrativeContext) {
      // Add character focus
      if (state.narrative.narrativeContext.characterFocus) {
        state.narrative.narrativeContext.characterFocus.forEach(character => {
          tags.push(`character:${character}`);
        });
      }
      
      // Add themes
      if (state.narrative.narrativeContext.themes) {
        state.narrative.narrativeContext.themes.forEach(theme => {
          tags.push(`theme:${theme}`);
        });
      }
    }
    
    return tags;
  };
  
  // Process AI response (integrate with your existing processing logic)
  const handleAIResponse = (response: AIRequestResult) => {
    // Update narrative with AI response
    if (response.narrative) {
      // Create a proper narrative state update instead of passing just the string
      dispatch({ 
        type: 'UPDATE_NARRATIVE', 
        payload: {
          narrativeHistory: [...state.narrative?.narrativeHistory || [], response.narrative],
        }
      });
    }
    
    // Process location changes
    if (response.location) {
      // Convert string location to LocationType if needed
      const locationToSet = typeof response.location === 'string' 
        ? { type: 'unknown', description: response.location } as LocationType 
        : response.location;
        
      dispatch({ 
        type: 'SET_LOCATION', 
        payload: locationToSet 
      });
    }
    
    // Process combat initiation
    if (response.combatInitiated) {
      dispatch({ 
        type: 'SET_COMBAT_ACTIVE', 
        payload: true 
      });
      
      if (response.opponent) {
        dispatch({ 
          type: 'SET_OPPONENT', 
          payload: response.opponent 
        });
      }
    }
    
    // Process inventory changes
    if (response.acquiredItems && response.acquiredItems.length > 0) {
      response.acquiredItems.forEach((itemName: string) => {
        // Create a proper InventoryItem with required fields
        const inventoryItem: InventoryItem = {
          id: uuidv4(), // Generate a unique ID
          name: itemName,
          quantity: 1,
          description: `A ${itemName}`,
          category: 'general'
        };
        
        dispatch({ 
          type: 'ADD_ITEM', 
          payload: inventoryItem
        });
      });
    }
    
    if (response.removedItems && response.removedItems.length > 0) {
      response.removedItems.forEach((itemName: string) => {
        dispatch({ 
          type: 'REMOVE_ITEM', 
          payload: itemName 
        });
      });
    }
    
    // Process journal updates
    if (response.storyProgression) {
      dispatch({
        type: 'UPDATE_JOURNAL',
        payload: {
          content: response.storyProgression.description,
          timestamp: Date.now(),
          type: 'narrative', // Changed from 'story' to 'narrative' to match JournalEntryType
          narrativeSummary: response.storyProgression.title || 'Story Development'
        }
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
        
        {/* Debug mode toggle - only in development */}
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
