'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import { debounce } from 'lodash';

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
    console.log('GameSession render - Current game state:', state);
    console.log('Current inventory:', state.inventory);
  }, [state]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize the game session with AI-generated narrative and initial inventory
  const initializeGameSession = useCallback(async () => {
    console.log('initializeGameSession called');
    if (!state || !dispatch) return;
    setIsInitializing(true);
    console.log('Initializing game session...');
    console.log('Current inventory:', state.inventory);
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

      console.log('Initial items to add:', initialItems);

      initialItems.forEach(item => {
        const existingItem = state.inventory?.find(invItem => invItem.id === item.id);
        console.log(`Checking item: ${item.name}, Exists: ${!!existingItem}`);
        if (!existingItem) {
          console.log(`Adding new item: ${item.name}`);
          dispatch({ type: 'ADD_ITEM', payload: item });
        }
      });

      console.log('Inventory after initialization:', state.inventory);

    } catch (error) {
      console.error('Error initializing game session:', error);
      dispatch({ type: 'SET_NARRATIVE', payload: 'An error occurred while starting the game. Please try again.' });
      dispatch({ type: 'SET_LOCATION', payload: 'Unknown Location' });
    } finally {
      setIsInitializing(false);
      console.log('Game session initialization completed');
    }
  }, [state, dispatch]);

  // Effect to initialize game session or redirect to character creation
  useEffect(() => {
    console.log('GameSession useEffect - Checking character:', state.character);
    if (isClient && state && !initializationRef.current) {
      if (!state.character) {
        const lastCreatedCharacter = localStorage.getItem('lastCreatedCharacter');
        if (lastCreatedCharacter) {
          console.log('Loading last created character:', lastCreatedCharacter);
          const character = JSON.parse(lastCreatedCharacter);
          dispatch({ type: 'SET_CHARACTER', payload: character });
          localStorage.removeItem('lastCreatedCharacter');
        } else {
          console.log('No character found, redirecting to character creation');
          router.push('/character-creation');
        }
      } else if (!state.narrative) {
        console.log('Character found, initializing game session');
        initializeGameSession();
        saveGame(state); // Moved saveGame after initializeGameSession
        initializationRef.current = true;
      } else {
        console.log('Game session already initialized');
        setIsInitializing(false);
        initializationRef.current = true;
      }
    }
    console.log('Current game state:', state);
  }, [isClient, state.character, state.narrative, router, initializeGameSession, dispatch, saveGame]);

  const debouncedHandleInventoryChanges = useMemo(
    () => debounce((acquiredItems: string[], removedItems: string[]) => {
      console.log('Debounced inventory changes:', { acquiredItems, removedItems });
      
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
  
      console.log('Updated inventory:', state.inventory?.map(item => `${item.name}: ${item.quantity}`));
    }, 300),
    [dispatch, state.inventory]
  );

  // Handle user input and process it through the AI
  const handleUserInput = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !state || !dispatch) return;

    setIsLoading(true);
    try {
      const journalContext = state.journal.map(entry => entry.content).join('\n');
      const {
        narrative: aiResponse,
        location,
        combatInitiated,
        opponent,
        acquiredItems: rawAcquiredItems,
        removedItems: rawRemovedItems,
      } = await getAIResponse(userInput, journalContext, state.inventory || []);

      dispatch({
        type: 'SET_NARRATIVE',
        payload: `${state.narrative || ''}\n\nPlayer: ${userInput}\n\nGame Master: ${aiResponse}`,
      });

      // Clean up acquired and removed items
      const acquiredItems = [...new Set(rawAcquiredItems.filter(item => item && item.trim() !== ''))];
      const removedItems = [...new Set(rawRemovedItems.filter(item => item && item.trim() !== ''))];

      debouncedHandleInventoryChanges(acquiredItems, removedItems);
      console.log('Calling inventory changes with:', { acquiredItems, removedItems });
    } catch (error) {
      console.error('Error processing user input:', error);
      dispatch({
        type: 'SET_NARRATIVE',
        payload: `${state.narrative || ''}\n\nAn error occurred. Please try again.`,
      });
    } finally {
      setIsLoading(false);
      setUserInput('');
    }
  }, [userInput, isLoading, state, dispatch, debouncedHandleInventoryChanges]);


const handleInventoryChanges = useCallback((acquiredItems: string[], removedItems: string[]) => {
  // Create a map to count occurrences of each item
  const itemCounts = new Map<string, number>();

  // Count occurrences of acquired items
  acquiredItems.forEach(itemName => {
    const normalizedName = itemName.toLowerCase().trim();
    itemCounts.set(normalizedName, (itemCounts.get(normalizedName) || 0) + 1);
  });

  // Process acquired items
  itemCounts.forEach((count, normalizedName) => {
    const existingItem = state.inventory?.find(item => item.name.toLowerCase() === normalizedName);
    if (existingItem) {
      // If item already exists, increase its quantity
      dispatch({
        type: 'UPDATE_ITEM_QUANTITY',
        payload: { id: existingItem.id, quantity: existingItem.quantity + count }
      });
    } else {
      // If it's a new item, add it to the inventory
      const itemId = `${normalizedName.replace(/\s+/g, '-')}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          id: itemId,
          name: normalizedName,
          quantity: count,
          description: `An item you acquired during your adventure.`
        }
      });
    }
  });

  // Handle removed items
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

  // Log the updated inventory for debugging
  console.log('Updated inventory:', state.inventory?.map(item => `${item.name}: ${item.quantity}`));
}, [dispatch, state.inventory]);

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
