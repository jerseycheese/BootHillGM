// BootHillGMApp/app/components/GameSession.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getAIResponse } from '../utils/aiService';
import { getJournalContext } from '../utils/JournalManager';
import CombatSystem from './CombatSystem';
import JournalViewer from './JournalViewer';
import { Character } from '../types/character';
import { JournalEntry } from '../types/journal';
import { InventoryItem } from '../types/inventory';
import '../styles/wireframe.css';
import { useCampaignState } from './CampaignStateManager';

export default function GameSession() {
  const router = useRouter();
  const { state, dispatch, saveGame } = useCampaignState();
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCombatActive, setIsCombatActive] = useState(false);
  const [opponent, setOpponent] = useState<Character | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isClient, setIsClient] = useState(false);console.log('GameSession render - Current game state:', state);

  console.log('GameSession render - Current game state:', state);

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

      // Add initial items to inventory if it's empty
      if (!state.inventory || state.inventory.length === 0) {
        dispatch({ 
          type: 'ADD_ITEM', 
          payload: { 
            id: '1', 
            name: 'Health Potion', 
            quantity: 2, 
            description: 'Restores 20 health points' 
          } 
        });
        dispatch({ 
          type: 'ADD_ITEM', 
          payload: { 
            id: '2', 
            name: 'Rope', 
            quantity: 1, 
            description: 'A sturdy rope, 50 feet long' 
          } 
        });
      }
    } catch (error) {
      console.error('Error initializing game session:', error);
      dispatch({ type: 'SET_NARRATIVE', payload: 'An error occurred while starting the game. Please try again.' });
      dispatch({ type: 'SET_LOCATION', payload: 'Unknown Location' });
    } finally {
      setIsInitializing(false);
    }
  }, [state, dispatch]);

  // Effect to initialize game session or redirect to character creation
  useEffect(() => {
    if (isClient && state) {
      console.log('GameSession useEffect - Checking character:', state.character);
      const lastCreatedCharacter = localStorage.getItem('lastCreatedCharacter');
      if (!state.character) {
        if (lastCreatedCharacter) {
          const character = JSON.parse(lastCreatedCharacter);
          console.log('Loading last created character:', character);
          dispatch({ type: 'SET_CHARACTER', payload: character });
          localStorage.removeItem('lastCreatedCharacter');
        } else {
          console.log('No character found, redirecting to character creation');
          router.push('/character-creation');
        }
      } else if (!state.narrative) {
        console.log('Character found, initializing game session');
        saveGame(state);
        initializeGameSession();
      } else {
        console.log('Game session already initialized');
        setIsInitializing(false);
      }
    }
    console.log('Current game state:', state); // Add this line for debugging
  }, [isClient, state, router, initializeGameSession, dispatch, saveGame]);


  // Handle user input and process it through the AI
  const handleUserInput = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !state || !dispatch) return;

    setIsLoading(true);
    try {
      // Get recent journal entries for context
      const journalContext = getJournalContext(state.journal || []);
      // Get AI response based on user input, journal context, inventory, and extract acquired items
      const { narrative: aiResponse, location, combatInitiated, opponent, acquiredItems, removedItems } = await getAIResponse(userInput, journalContext, state.inventory || []);

      // Update game narrative with user input and AI response
      dispatch({ type: 'SET_NARRATIVE', payload: `${state.narrative || ''}\n\nPlayer: ${userInput}\n\nGame Master: ${aiResponse}` });
      
      // Update location if it has changed
      if (location) dispatch({ type: 'SET_LOCATION', payload: location });
      
      console.log('Acquired items from AI:', acquiredItems);
      acquiredItems.forEach(itemName => {
        if (itemName && itemName.trim() !== '') {
          const itemId = `${itemName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
          console.log(`Dispatching ADD_ITEM for ${itemName} with id ${itemId}`);
          dispatch({ 
            type: 'ADD_ITEM', 
            payload: { 
              id: itemId,
              name: itemName,
              quantity: 1,
              description: `An item you acquired during your adventure.`
            }
          });
      }
      });
      
      console.log('Removed items from AI:', removedItems);
      removedItems.forEach(itemName => {
        const itemToRemove = state.inventory?.find(item => item.name.toLowerCase() === itemName.toLowerCase() || item.name.toLowerCase() === `removed_items: ${itemName.toLowerCase()}`);
        if (itemToRemove) {      
          dispatch({ type: 'REMOVE_ITEM', payload: itemToRemove.id });
        }
      });

      // Clean up inventory periodically
      // Note: We've removed the 'CLEAN_INVENTORY' action as it's not defined in our reducer
      
      // Add a journal entry for the player's action
      const journalEntry: JournalEntry = {
        timestamp: Date.now(),
        content: `Player action: ${userInput}`
      };
      dispatch({ type: 'UPDATE_JOURNAL', payload: journalEntry });
      
      // Handle combat initiation if indicated by AI response
      if (combatInitiated && opponent) {
        setIsCombatActive(true);
        setOpponent(opponent);
        dispatch({ type: 'SET_NARRATIVE', payload: `${state.narrative || ''}\n\nA combat situation has arisen! Prepare to face ${opponent.name}!` });
      }

      logInventory(state.inventory || []);
      setUserInput('');
    } catch (error) {
      console.error('Error processing user input:', error);
      dispatch({ type: 'SET_NARRATIVE', payload: `${state.narrative || ''}\n\nAn error occurred. Please try again.` });
    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading, state, dispatch]);

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
    console.log('Manual save triggered');
  };
    
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
        {!state.inventory || state.inventory.length === 0 ? (
          <p className="wireframe-text">Your inventory is empty.</p>
        ) : (
          <ul className="wireframe-list">
            {state.inventory.map((item) => (
              <li key={item.id} className="wireframe-text">
                {item && item.name && item.quantity > 0 ? `${item.name} (x${item.quantity})` : null}
              </li>
            ))}
          </ul>
        )}
      </div>
      <JournalViewer entries={state.journal || []} />
    </div>
  );
}

// Debugging function to log the current inventory state
function logInventory(inventory: InventoryItem[]) {
  console.log("Current Inventory:");
  if (inventory && inventory.length > 0) {
    inventory.forEach(item => {
      if (item && item.name) {
        console.log(`${item.name}: ${item.quantity}`);
      }
    });
  } else {
    console.log("Inventory is empty");
  }
}
