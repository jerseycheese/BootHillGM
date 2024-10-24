'use client';

import React, { useState, useCallback, useEffect } from 'react';
import CombatSystem from './CombatSystem';
import JournalViewer from './JournalViewer';
import UserInputHandler from './UserInputHandler';
import { useAIInteractions } from '../hooks/useAIInteractions';
import '../styles/wireframe.css';
import { useGameInitialization } from '../hooks/useGameInitialization';
import { useCampaignState } from './CampaignStateManager';
import { Character } from '../types/character';
import { GameState } from '../types/campaign';
import Inventory from './Inventory';

export default function GameSession() {
  // All hooks must be called unconditionally and in the same order
  // to prevent React hooks ordering issues during re-renders
  const { state, dispatch, saveGame } = useCampaignState();
  const [isCombatActive, setIsCombatActive] = useState(false);
  const [opponent, setOpponent] = useState<Character | null>(null);
  const { isInitializing, isClient } = useGameInitialization();

  // Consolidated state update handler
  const handleInventoryChange = useCallback(async (acquiredItems: string[], removedItems: string[]) => {
    if (!dispatch) return;
    
    for (const itemName of removedItems) {
      const existingItem = state?.inventory?.find(item => item.name === itemName);
      if (existingItem) {
        if (existingItem.quantity > 1) {
          dispatch({
            type: 'UPDATE_ITEM_QUANTITY',
            payload: {
              id: existingItem.id,
              quantity: existingItem.quantity - 1
            }
          });
        } else {
          dispatch({ type: 'REMOVE_ITEM', payload: itemName });
        }
      }
    }
  }, [dispatch, state?.inventory]);

  const { isLoading, error, handleUserInput, retryLastAction } = useAIInteractions(
    state,
    dispatch,
    handleInventoryChange,
    (updatedState: GameState) => {
      console.log('Saving after AI interaction:', {
        narrativeLength: updatedState.narrative?.length
      });
      saveGame(updatedState);
    }
  );

  // Combat handlers
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

    dispatch({ 
      type: 'UPDATE_JOURNAL', 
      payload: {
        timestamp: Date.now(),
        content: `Combat: ${combatSummary}`
      }
    });
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

  const handleUseItem = useCallback(async (itemName: string) => {
    if (!state?.character) {
      console.warn('No character in state, aborting item use');
      return;
    }
    const actionText = `use ${itemName}`;
    await handleUserInput(actionText);
  }, [state?.character, handleUserInput]);

  // Single state update effect to prevent multiple unnecessary re-renders
  // Only runs when state changes and client-side rendering is confirmed
  useEffect(() => {
    if (isClient && state) {
      console.log('GameSession state updated:', {
        narrativeLength: state?.narrative?.length,
        timestamp: state?.savedTimestamp,
        hasInventory: !!state?.inventory?.length
      });
    }
  }, [isClient, state]);

  // Loading state
  if (!isClient || !state || !state.character || isInitializing) {
    return <div className="wireframe-container">Loading game session...</div>;
  }

  // Render component
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
      {error && (
        <div className="text-red-500 flex items-center gap-2">
          <span>{error}</span>
          <button
            onClick={retryLastAction}
            className="px-2 py-1 text-sm bg-red-100 hover:bg-red-200 rounded"
          >
            Retry
          </button>
        </div>
      )}
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
