'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CombatSystem from './CombatSystem';
import JournalViewer from './JournalViewer';
import UserInputHandler from './UserInputHandler';
import { useAIInteractions } from '../hooks/useAIInteractions';
import '../styles/wireframe.css';
import { useGameInitialization } from '../hooks/useGameInitialization';
import { useCampaignState } from './CampaignStateManager';
import { Character } from '../types/character';
import { JournalEntry } from '../types/journal';
import { InventoryItem } from '../types/inventory';

/**
 * Main game session component that orchestrates:
 * - Game initialization via useGameInitialization hook
 * - Combat system integration
 * - Inventory management
 * - User input processing
 * - Journal entries
 */
export default function GameSession() {
  const router = useRouter();
  const { state, dispatch, saveGame } = useCampaignState();
  const [isCombatActive, setIsCombatActive] = useState(false);
  const [opponent, setOpponent] = useState<Character | null>(null);
  const { isInitializing, isClient, initializationRef, initializeGameSession } = useGameInitialization();

  const handleInventoryChange = useCallback((acquired: string[], removed: string[]) => {
    if (!dispatch) return;

    acquired.forEach(itemName => {
      const newItem: InventoryItem = {
        id: `${itemName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        name: itemName,
        quantity: 1,
        description: `A ${itemName.toLowerCase()} acquired during your adventure.`
      };
      dispatch({ type: 'ADD_ITEM', payload: newItem });
    });

    removed.forEach(itemName => {
      dispatch({ type: 'REMOVE_ITEM', payload: itemName });
    });
  }, [dispatch]);

  const { handleUserInput, isLoading } = useAIInteractions(
    state,
    dispatch,
    handleInventoryChange
  );

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
    if (!dispatch || !state?.character) return;
    dispatch({
      type: 'SET_CHARACTER',
      payload: { ...state.character, health: newHealth }
    });
  }, [dispatch, state?.character]);

  const handleManualSave = useCallback(() => {
    if (state) {
      saveGame(state);
    }
  }, [state, saveGame]);

  const memoizedInventory = useMemo(() => {
    if (!state?.inventory || state.inventory.length === 0) {
      return <p className="wireframe-text">Your inventory is empty.</p>;
    }
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
  }, [state?.inventory]);

  useEffect(() => {
    const initGame = async () => {
      // Only initialize once client-side and with valid state
      if (!isClient) {
        return;
      }
  
      if (!state || !dispatch) {
        router.push('/');
        return;
      }
  
      if (!state.character) {
        router.push('/character-creation');
        return;
      }
  
      // Prevent duplicate initialization and ensure narrative exists
      if (!initializationRef.current && !state.narrative) {
  
        try {
          // Initialize and immediately save complete state
          const updatedState = await initializeGameSession();
          if (updatedState) {
            saveGame(updatedState);
            console.log('Game saved with updated state:', updatedState);
          }
        } catch (error) {
          console.error('Initialization error:', error);
        }
      }
    };
  
    initGame();
  }, [isClient, state, dispatch, router, initializationRef, initializeGameSession, saveGame]);

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