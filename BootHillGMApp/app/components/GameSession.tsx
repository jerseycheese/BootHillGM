'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AIService from '../services/AIService';
import CombatSystem from './CombatSystem';
import JournalViewer from './JournalViewer';
import UserInputHandler from './UserInputHandler';
import { Character } from '../types/character';
import { JournalEntry } from '../types/journal';
import { addJournalEntry, getJournalContext } from '../utils/JournalManager';
import { useCampaignState } from './CampaignStateManager';
import { debounce } from 'lodash';
import '../styles/wireframe.css';

export default function GameSession() {
  const router = useRouter();
  const { state, dispatch, saveGame } = useCampaignState();
  const [isLoading, setIsLoading] = useState(false);
  const [isCombatActive, setIsCombatActive] = useState(false);
  const [opponent, setOpponent] = useState<Character | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const initializationRef = useRef(false);

  // Initialize the game session with AI-generated narrative and initial inventory
  const initializeGameSession = useCallback(async () => {
    console.log('Initializing game session');
    if (!state || !dispatch) {
      console.log('State or dispatch is undefined, cannot initialize game session');
      return;
    }
    setIsInitializing(true);
    try {
      const journalContext = getJournalContext(state.journal || []);
      const { narrative: initialNarrative, location } = await AIService.getAIResponse(
        `Initialize a new game session for a character named ${state.character?.name || 'Unknown'}. 
        Provide a brief introduction to the game world and the character's current situation. 
        Include a detailed description of their current location and some potential options for action.
        Ensure to explicitly state the name of the current location.`,
        journalContext,
        state.inventory || []
      );
      console.log('Dispatching SET_NARRATIVE action');
      dispatch({ type: 'SET_NARRATIVE', payload: initialNarrative });
      console.log('Dispatching SET_LOCATION action');
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
          console.log(`Dispatching ADD_ITEM action for ${item.name}`);
          dispatch({ type: 'ADD_ITEM', payload: item });
        }
      });

    } catch (error) {
      console.error('Error in initializeGameSession:', error);
      dispatch({ type: 'SET_NARRATIVE', payload: 'An error occurred while starting the game. Please try again.' });
      dispatch({ type: 'SET_LOCATION', payload: 'Unknown Location' });
    } finally {
      setIsInitializing(false);
    }
  }, [state, dispatch]);

  // Effect to initialize game session or redirect to character creation
  useEffect(() => {
    console.log('GameSession useEffect triggered');
    if (isClient && state && !initializationRef.current) {
      if (!state.character) {
        console.log('No character found, checking localStorage');
        const lastCreatedCharacter = localStorage.getItem('lastCreatedCharacter');
        if (lastCreatedCharacter) {
          console.log('Found character in localStorage, setting character');
          const character = JSON.parse(lastCreatedCharacter);
          dispatch({ type: 'SET_CHARACTER', payload: character });
          localStorage.removeItem('lastCreatedCharacter');
        } else {
          console.log('No character found, redirecting to character creation');
          router.push('/character-creation');
        }
      } else if (!state.narrative) {
        console.log('No narrative found, initializing game session');
        initializeGameSession().then(() => setIsInitializing(false)); // Set isInitializing to false after initialization
        saveGame(state);
        initializationRef.current = true;
      } else {
        console.log('Game session already initialized');
        setIsInitializing(false);
        initializationRef.current = true;
      }
    }
  }, [isClient, state, router, initializeGameSession, dispatch, saveGame]);

  const handleInventoryChanges = useCallback((acquiredItems: string[], removedItems: string[]) => {
    console.log('handleInventoryChanges called with:', { acquiredItems, removedItems });
    if (!state || !dispatch) {
      console.log('State or dispatch is undefined, cannot handle inventory changes');
      return;
    }
    try {
      // Handle removed items first
      removedItems.forEach(itemName => {
        const normalizedName = itemName.toLowerCase().trim();
        const itemToRemove = state.inventory?.find(item => item.name.toLowerCase() === normalizedName);
        if (itemToRemove) {
          // Always update the quantity, even if it becomes 0
          console.log('Dispatching UPDATE_ITEM_QUANTITY for removed item:', itemToRemove);
          dispatch({
            type: 'UPDATE_ITEM_QUANTITY',
            payload: { id: itemToRemove.id, quantity: Math.max(0, itemToRemove.quantity - 1) }
          });
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
          console.log('Dispatching UPDATE_ITEM_QUANTITY for existing item:', existingItem);
          dispatch({
            type: 'UPDATE_ITEM_QUANTITY',
            payload: { id: existingItem.id, quantity: existingItem.quantity + 1 }
          });
        } else {
          // If it's a new item, add it to the inventory
          const itemId = `${normalizedName.replace(/\s+/g, '-')}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          console.log('Dispatching ADD_ITEM for new item:', { itemId, itemName });
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
    } catch (error) {
      console.error('Error handling inventory changes:', error);
    }
  }, [dispatch, state]);

  const debouncedHandleInventoryChanges = useMemo(
    () => {
      if (process.env.NODE_ENV === 'test') {
        console.log('Using non-debounced handleInventoryChanges in test environment');
        return handleInventoryChanges;
      }
      console.log('Using debounced handleInventoryChanges');
      return debounce(handleInventoryChanges, 300);
    },
    [handleInventoryChanges]
  );

  const handleUserInput = useCallback(async (input: string) => {
    setIsLoading(true);
    try {
      const journalContext = getJournalContext(state.journal);
      const { narrative: aiResponse, acquiredItems, removedItems } = await AIService.getAIResponse(input, journalContext, state.inventory || []);

      dispatch({ type: 'SET_NARRATIVE', payload: `${state.narrative || ''}\n\nPlayer: ${input}\n\nGame Master: ${aiResponse}` });

      const newJournalEntry = await addJournalEntry(state.journal, input, journalContext, state.character?.name || 'Unknown');

      dispatch({
        type: 'UPDATE_JOURNAL',
        payload: newJournalEntry,
      });

      const cleanedAcquiredItems = [...new Set(acquiredItems.filter(item => item && item.trim() !== ''))];
      const cleanedRemovedItems = [...new Set(removedItems.filter(item => item && item.trim() !== ''))];
      debouncedHandleInventoryChanges(cleanedAcquiredItems, cleanedRemovedItems);


    } catch (error) {
      console.error('Error in handleUserInput:', error);
      dispatch({ type: 'SET_NARRATIVE', payload: `${state.narrative || ''}\n\nAn error occurred. Please try again.` });
    } finally {
      setIsLoading(false);
    }
  }, [state, dispatch, debouncedHandleInventoryChanges]);

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

  useEffect(() => {
    setIsClient(true);
  }, []);


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
        <p>Name: {state.character?.name}</p>
        <p>Location: {state.location || 'Unknown'}</p>
        <p>Health: {state.character?.health}</p>
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
        <UserInputHandler onSubmit={handleUserInput} isLoading={isLoading} />
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
