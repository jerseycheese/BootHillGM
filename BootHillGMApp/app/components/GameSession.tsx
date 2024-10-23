'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
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
import { CampaignState } from '../types/campaign';
import Inventory from './Inventory';

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
  const { state, dispatch, saveGame, loadGame } = useCampaignState();
  const [isCombatActive, setIsCombatActive] = useState(false);
  const [opponent, setOpponent] = useState<Character | null>(null);
  const hasAttemptedLoad = useRef(false);
  const { isInitializing, isClient, initializeGameSession } = useGameInitialization();

  const handleInventoryChange = useCallback(async (acquiredItems: string[], removedItems: string[]) => {
    if (!dispatch) return;
  
    // Process removals first
    for (const itemName of removedItems) {
      const existingItem = state?.inventory?.find(item => item.name === itemName);
      if (existingItem) {
        
        if (existingItem.quantity > 1) {
          // Dispatch the quantity update
          dispatch({
            type: 'UPDATE_ITEM_QUANTITY',
            payload: {
              id: existingItem.id,
              quantity: existingItem.quantity - 1
            }
          });
  
          // Give React time to process the update
          await new Promise(resolve => setTimeout(resolve, 50));
        } else {
          dispatch({ type: 'REMOVE_ITEM', payload: itemName });
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    }
  
    // After all updates are complete, save the game state
    if (saveGame) {
      await new Promise(resolve => setTimeout(resolve, 100));
      saveGame(state);
    }
  }, [dispatch, state, saveGame]);

  const { handleUserInput, isLoading } = useAIInteractions(
    state,
    dispatch,
    handleInventoryChange,
    (updatedState: CampaignState) => {
      saveGame(updatedState);
    }
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

  const handleUseItem = async (itemName: string) => {
    if (!state?.character) {
      console.warn('No character in state, aborting item use');
      return;
    }
    // Create the action text
    const actionText = `use ${itemName}`;
    await handleUserInput(actionText);
  };
  
  useEffect(() => {
    const initGame = async () => {
      // Skip initialization if not client-side yet
      if (!isClient) {
        return;
      }
  
      // Ensure we have required context before proceeding
      if (!state || !dispatch) {
        router.push('/');
        return;
      }
  
      // Use ref to prevent duplicate initialization attempts
      if (!hasAttemptedLoad.current) {
        hasAttemptedLoad.current = true;
        
        if (!state.character) {
          const savedStateJSON = localStorage.getItem('campaignState');
          const lastCharacterJSON = localStorage.getItem('lastCreatedCharacter');
          
          if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);
            
            // Initialize new game state if current state lacks narrative/inventory
            if (!savedState.narrative || savedState.narrative.length === 0) {
              const initializedState = await initializeGameSession();
              
              if (initializedState) {
                // Merge initialized state with saved character data
                const characterData = lastCharacterJSON ? JSON.parse(lastCharacterJSON) : null;
                
                const updatedState = {
                  ...initializedState,
                  character: characterData,
                  isClient: true,
                  savedTimestamp: Date.now()
                };
  
                dispatch({ type: 'SET_STATE', payload: updatedState });
                saveGame(updatedState);
              }
            } else {
              // Use existing saved state, just update character if needed
              const characterData = lastCharacterJSON ? JSON.parse(lastCharacterJSON) : null;
              const updatedState = {
                ...savedState,
                character: characterData,
                isClient: true,
                savedTimestamp: Date.now()
              };
              
              dispatch({ type: 'SET_STATE', payload: updatedState });
              saveGame(updatedState);
            }
          } else {
            // No saved state exists, start fresh game
            const initializedState = await initializeGameSession();
            if (initializedState) {
              dispatch({ type: 'SET_STATE', payload: initializedState });
              saveGame(initializedState);
            }
          }
        }
      }
    };
  
    initGame();
  }, [isClient, state, dispatch, router, loadGame, saveGame, initializeGameSession]);
  
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
      <Inventory onUseItem={handleUseItem} />
      <JournalViewer entries={state.journal || []} />
    </div>
  );
}
