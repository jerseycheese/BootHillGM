'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getAIResponse } from '../utils/aiService';
import { getJournalContext } from '../utils/JournalManager';
import CombatSystem from './CombatSystem';
import JournalViewer from './JournalViewer';
import { Character } from '../types/character';
import { JournalEntry } from '../types/journal';
import { addJournalEntry } from '../utils/JournalManager';
import { useCampaignState } from './CampaignStateManager';
import { debounce } from 'lodash';
import '../styles/wireframe.css';

export default function GameSession() {
  const router = useRouter();
  const { state, dispatch, saveGame } = useCampaignState();
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCombatActive, setIsCombatActive] = useState(false);
  const [opponent, setOpponent] = useState<Character | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const initializationRef = useRef(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize the game session with AI-generated narrative and initial inventory
  const initializeGameSession = useCallback(async () => {
    if (!state || !dispatch) return;
    setIsInitializing(true);
    try {
      const journalContext = getJournalContext(state.journal || []);
      const { narrative: initialNarrative, location } = await getAIResponse(
        `Initialize a new game session for a character named ${state.character?.name || 'Unknown'}. 
        Provide a brief introduction to the game world and the character's current situation. 
        Include a detailed description of their current location and some potential options for action.
        Ensure to explicitly state the name of the current location.`,
        journalContext,
        state.inventory || []
      );
      dispatch({ type: 'SET_NARRATIVE', payload: initialNarrative });
      dispatch({ type: 'SET_LOCATION', payload: location || 'Unknown Location' });

      // Add initial items to inventory if they don't already exist
      const initialItems = [
        { 
          id: 'health-potion-initial', 
          name: 'Health Potion', 
          quantity: 2, 
          description: 'Restores 20 health points' 
        },
        { 
          id: 'rope-initial', 
          name: 'Rope', 
          quantity: 1, 
          description: 'A sturdy rope, 50 feet long' 
        }
      ];

      initialItems.forEach(item => {
        const existingItem = state.inventory?.find(invItem => invItem.id === item.id);
        if (!existingItem) {
          dispatch({ type: 'ADD_ITEM', payload: item });
        }
      });

    } catch {
      dispatch({ type: 'SET_NARRATIVE', payload: 'An error occurred while starting the game. Please try again.' });
      dispatch({ type: 'SET_LOCATION', payload: 'Unknown Location' });
    } finally {
      setIsInitializing(false);
    }
  }, [state, dispatch]);

  // Effect to initialize game session or redirect to character creation
  useEffect(() => {
    if (isClient && state && !initializationRef.current) {
      if (!state.character) {
        const lastCreatedCharacter = localStorage.getItem('lastCreatedCharacter');
        if (lastCreatedCharacter) {
          const character = JSON.parse(lastCreatedCharacter);
          dispatch({ type: 'SET_CHARACTER', payload: character });
          localStorage.removeItem('lastCreatedCharacter');
        } else {
          router.push('/character-creation');
        }
      } else if (!state.narrative) {
        initializeGameSession();
        saveGame(state); // Moved saveGame after initializeGameSession
        initializationRef.current = true;
      } else {
        setIsInitializing(false);
        initializationRef.current = true;
      }
    }
  }, [isClient, state, router, initializeGameSession, dispatch, saveGame]);

  const debouncedHandleInventoryChanges = useMemo(
    () => debounce((acquiredItems: string[], removedItems: string[]) => {
      
      // Handle removed items first
      removedItems.forEach(itemName => {
        const normalizedName = itemName.toLowerCase().trim();
        const itemToRemove = state.inventory?.find(item => item.name.toLowerCase() === normalizedName);
        if (itemToRemove) {
          if (itemToRemove.quantity > 1) {
            // If there's more than one, decrease the quantity
            dispatch({
              type: 'UPDATE_ITEM_QUANTITY',
              payload: { id: itemToRemove.id, quantity: itemToRemove.quantity - 1 }
            });
          } else {
            // If it's the last one, remove the item entirely
            dispatch({ type: 'REMOVE_ITEM', payload: itemToRemove.id });
          }
        } else {
          console.warn(`Attempted to remove non-existent item: ${itemName}`);
        }
      });
  
      // Handle acquired items
      acquiredItems.forEach(itemName => {
        const normalizedName = itemName.toLowerCase().trim();
        const existingItem = state.inventory?.find(item => item.name.toLowerCase() === normalizedName);
        if (existingItem) {
          // If item already exists, increase its quantity
          dispatch({
            type: 'UPDATE_ITEM_QUANTITY',
            payload: { id: existingItem.id, quantity: existingItem.quantity + 1 }
          });
        } else {
          // If it's a new item, add it to the inventory
          const itemId = `${normalizedName.replace(/\s+/g, '-')}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          dispatch({
            type: 'ADD_ITEM',
            payload: {
              id: itemId,
              name: itemName, // Use original item name to preserve capitalization
              quantity: 1,
              description: `An item you acquired during your adventure.`
            }
          });
        }
      });
  
    }, 300),
    [dispatch, state.inventory]
  );

  // Handle user input and process it through the AI
  const handleUserInput = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !state || !dispatch) return;

    setIsLoading(true);
    try {
      const journalContext = getJournalContext(state.journal);
      const {
        narrative: aiResponse,
        acquiredItems: rawAcquiredItems,
        removedItems: rawRemovedItems,
      } = await getAIResponse(userInput, journalContext, state.inventory || []);

      // Update narrative
      const updatedNarrative = `${state.narrative || ''}\n\nPlayer: ${userInput}\n\nGame Master: ${aiResponse}`;
      dispatch({
        type: 'SET_NARRATIVE',
        payload: updatedNarrative,
      });

      // Add new journal entry with player's action
      const newJournalEntries = await addJournalEntry(
        state.journal,
        userInput,
        journalContext,
        state.character?.name || 'Unknown'
      );
      dispatch({
        type: 'UPDATE_JOURNAL',
        payload: newJournalEntries[newJournalEntries.length - 1],
      });

      // Clean up acquired and removed items
      const acquiredItems = [...new Set(rawAcquiredItems.filter(item => item && item.trim() !== ''))];
      const removedItems = [...new Set(rawRemovedItems.filter(item => item && item.trim() !== ''))];

      debouncedHandleInventoryChanges(acquiredItems, removedItems);
    } catch {
      dispatch({
        type: 'SET_NARRATIVE',
        payload: `${state.narrative || ''}\n\nAn error occurred. Please try again.`,
      });
    } finally {
      setIsLoading(false);
      setUserInput('');
    }
  }, [userInput, isLoading, state, dispatch, debouncedHandleInventoryChanges]);

  const handleCombatEnd = useCallback((winner: 'player' | 'opponent', combatSummary: string) => {
    if (!state || !dispatch) return;
    setIsCombatActive(false);
    setOpponent(null);
    
    const endMessage = winner === 'player' 
      ? "You have emerged victorious from the combat!" 
      : "You have been defeated in combat.";
    
    dispatch({ 
      type: 'SET_NARRATIVE', 
      payload: `${state.narrative || ''}\n\n${endMessage}\n\n${combatSummary}\n\nWhat would you like to do now?` 
    });

    // Update journal with combat summary when combat ends
    const journalEntry: JournalEntry = {
      timestamp: Date.now(),
      content: `Combat: ${combatSummary}`
    };
    dispatch({ type: 'UPDATE_JOURNAL', payload: journalEntry });
  }, [state, dispatch]);

  const handlePlayerHealthChange = useCallback((newHealth: number) => {
    if (!dispatch || !state.character) return;
      dispatch({
        type: 'SET_CHARACTER',
        payload: { ...state.character, health: newHealth }
    });
  }, [dispatch, state.character]);

  const handleManualSave = () => {
    saveGame(state);
  };

  const memoizedInventory = useMemo(() => {
    if (!state.inventory || state.inventory.length === 0) {
      return <p className="wireframe-text">Your inventory is empty.</p>;
    } else {
      return (
        <ul className="wireframe-list">
          {state.inventory.map((item) => (
            item && item.id && item.name && item.quantity > 0 ? (
              <li key={item.id} className="wireframe-text">
                {`${item.name} (x${item.quantity})`}
              </li>
            ) : null
          ))}
        </ul>
      );
    }
  }, [state.inventory]);

  // Show loading state while initializing or if state is not properly loaded
  if (!isClient || !state || !state.character || isInitializing) {
    return <div className="wireframe-container">Loading game session...</div>;
  }

  // Render game session UI
  return (
    <div className="wireframe-container">
      <h1 className="wireframe-title">Game Session</h1>
      {/* Character status display */}
      <div className="wireframe-section">
        <h2 className="wireframe-subtitle">Character Status</h2>
        <p>Name: {state.character.name}</p>
        <p>Location: {state.location || 'Unknown'}</p>
        <p>Health: {state.character.health}</p>
        <button onClick={handleManualSave} className="wireframe-button">Save Game</button>
      </div>
      {/* Game narrative display */}
      <div className="wireframe-section h-64 overflow-y-auto">
        <pre className="wireframe-text whitespace-pre-wrap">{state.narrative}</pre>
      </div>
      {/* Conditional rendering of Combat System or User Input form */}
      {isCombatActive && opponent ? (
        <CombatSystem
          playerCharacter={state.character}
          opponent={opponent}
          onCombatEnd={handleCombatEnd}
          onPlayerHealthChange={handlePlayerHealthChange}
        />
      ) : (
        <form onSubmit={handleUserInput} className="wireframe-section">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="wireframe-input"
            placeholder="What would you like to do?"
            disabled={isLoading}
          />
          <button type="submit" className="wireframe-button" disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Take Action'}
          </button>
        </form>
      )}
      {/* Inventory and Journal components */}
      <div className="wireframe-section">
        <h2 className="wireframe-subtitle">Inventory</h2>
        {memoizedInventory}
      </div>
      <JournalViewer entries={state.journal || []} />
    </div>
  );
}
