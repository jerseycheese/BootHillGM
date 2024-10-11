// BootHillGMApp/app/game-session/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '../utils/gameEngine';
import { getAIResponse } from '../utils/aiService';
import { getJournalContext } from '../utils/JournalManager';
import CombatSystem from '../components/CombatSystem';
import Inventory from '../components/Inventory';
import JournalViewer from '../components/JournalViewer';
import { Character } from '../types/character';
import { JournalEntry } from '../types/journal';
import '../styles/wireframe.css';

export default function GameSession() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCombatActive, setIsCombatActive] = useState(false);
  const [opponent, setOpponent] = useState<Character | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize the game session with AI-generated narrative and initial inventory
  const initializeGameSession = useCallback(async () => {
    setIsInitializing(true);
    try {
      const journalContext = getJournalContext(state.journal);
      const { narrative: initialNarrative, location } = await getAIResponse(
        `Initialize a new game session for a character named ${state.character?.name}. 
        Provide a brief introduction to the game world and the character's current situation. 
        Include a detailed description of their current location and some potential options for action.
        Ensure to explicitly state the name of the current location.`,
        journalContext
      );
      dispatch({ type: 'SET_NARRATIVE', payload: initialNarrative });
      dispatch({ type: 'SET_LOCATION', payload: location || 'Unknown Location' });

      // Add initial items to inventory if it's empty
      if (state.inventory.length === 0) {
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
  }, [state.character?.name, state.journal, state.inventory.length, dispatch]);

  // Effect to initialize game session or redirect to character creation
  useEffect(() => {
    if (!state.character) {
      router.push('/character-creation');
    } else if (state.narrative === '') {
      initializeGameSession();
    } else {
      setIsInitializing(false);
    }
  }, [state.character, state.narrative, router, initializeGameSession]);

  // Handle user input and process it through the AI
  const handleUserInput = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    setIsLoading(true);
    try {
      // Get recent journal entries for context
      const journalContext = getJournalContext(state.journal);
      // Get AI response based on user input and journal context
      const { narrative: aiResponse, location, combatInitiated, opponent } = await getAIResponse(userInput, journalContext);
      
      // Update game narrative with user input and AI response
      dispatch({ type: 'SET_NARRATIVE', payload: `${state.narrative}\n\nPlayer: ${userInput}\n\nGame Master: ${aiResponse}` });
      
      // Update location if it has changed
      if (location) dispatch({ type: 'SET_LOCATION', payload: location });
      
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
        dispatch({ type: 'SET_NARRATIVE', payload: `${state.narrative}\n\nA combat situation has arisen! Prepare to face ${opponent.name}!` });
      }
      
      setUserInput('');
    } catch (error) {
      console.error('Error processing user input:', error);
      dispatch({ type: 'SET_NARRATIVE', payload: `${state.narrative}\n\nAn error occurred. Please try again.` });
    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading, state.narrative, state.journal, dispatch]);

  const handleCombatEnd = (winner: 'player' | 'opponent', combatSummary: string) => {
    setIsCombatActive(false);
    setOpponent(null);
    
    const endMessage = winner === 'player' 
      ? "You have emerged victorious from the combat!" 
      : "You have been defeated in combat.";
    
    dispatch({ 
      type: 'SET_NARRATIVE', 
      payload: `${state.narrative}\n\n${endMessage}\n\n${combatSummary}\n\nWhat would you like to do now?` 
    });

    // Update journal with combat summary when combat ends
    const journalEntry: JournalEntry = {
      timestamp: Date.now(),
      content: `Combat: ${combatSummary}`
    };
    dispatch({ type: 'UPDATE_JOURNAL', payload: journalEntry });
  };

  const handlePlayerHealthChange = (newHealth: number) => {
    dispatch({
      type: 'UPDATE_CHARACTER',
      payload: { health: newHealth }
    });
  };

  // Show loading state while initializing
  if (!state.character || isInitializing) {
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
      </div>
      {/* Game narrative display */}
      <div className="wireframe-section h-64 overflow-y-auto">
        <pre className="wireframe-text whitespace-pre-wrap">{state.narrative}</pre>
      </div>
      {/* Conditional rendering of Combat System or User Input form */}
      {isCombatActive ? (
        <CombatSystem
          playerCharacter={state.character}
          opponent={opponent!}
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
      <Inventory />
      <JournalViewer entries={state.journal} />
    </div>
  );
}
