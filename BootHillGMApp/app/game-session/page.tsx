'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '../utils/gameEngine';
import { getAIResponse } from '../utils/aiService';
import { getJournalContext } from '../utils/JournalManager';
import CombatSystem from '../components/CombatSystem';
import Inventory from '../components/Inventory';
import { Character } from '../types/character';
import { JournalEntry } from '../types/journal';
import '../styles/wireframe.css';

export default function GameSession() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCombatActive, setIsCombatActive] = useState(false);
  const [opponent, setOpponent] = useState<Character | null>(null);
  const narrativeRef = useRef<HTMLDivElement>(null);

  // Initialize the game session when the component mounts
  useEffect(() => {
    const initializeGameSession = async () => {
      setIsLoading(true);
      // Redirect to character creation if no character exists
      if (!state.character) {
        router.push('/character-creation');
        return;
      }

      // Initialize the game narrative if it's empty
      if (state.narrative === '') {
        const journalContext = getJournalContext(state.journal);
        const { narrative: initialNarrative, location } = await getAIResponse(
          `Initialize a new game session for a character named ${state.character.name}. 
          Provide a brief introduction to the game world and the character's current situation. 
          Include a description of their current location and some potential options for action.`,
          journalContext
        );
        dispatch({ type: 'SET_NARRATIVE', payload: initialNarrative });
        dispatch({ type: 'SET_LOCATION', payload: location || 'Unknown' });

        // Add some initial items to the inventory
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
      setIsLoading(false);
    };
  
    initializeGameSession();
  }, [state.character, router, dispatch, state.narrative, state.journal]);

  // Handle user input and process it through the AI
  const handleUserInput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setIsLoading(true);
    try {
      const journalContext = getJournalContext(state.journal);
      const { narrative: aiResponse, location, combatInitiated, opponent } = await getAIResponse(userInput, journalContext);
      
      // Update the game narrative with user input and AI response
      dispatch({ type: 'SET_NARRATIVE', payload: `${state.narrative}\n\nPlayer: ${userInput}\n\nGame Master: ${aiResponse}` });
      
      // Update location if it has changed
      if (location) dispatch({ type: 'SET_LOCATION', payload: location });
      
      // Add important story elements to the journal
      if (aiResponse.includes('important:')) {
        const importantInfo = aiResponse.split('important:')[1].trim();
        const journalEntry: JournalEntry = {
          timestamp: Date.now(),
          content: importantInfo
        };
        dispatch({ type: 'UPDATE_JOURNAL', payload: journalEntry });
      }
      
      // Initiate combat if the AI response indicates it
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
  };

  // Handle the end of a combat encounter
  const handleCombatEnd = (winner: 'player' | 'opponent') => {
    setIsCombatActive(false);
    const combatResult = winner === 'player' 
      ? `You have defeated ${opponent?.name}!` 
      : `You have been defeated by ${opponent?.name}...`;
    
    dispatch({ type: 'SET_NARRATIVE', payload: `${state.narrative}\n\n${combatResult}` });
    
    // Update player health if they lost the combat
    if (winner === 'opponent' && state.character) {
      const newHealth = Math.max(0, state.character.health - 20);
      dispatch({ 
        type: 'SET_CHARACTER', 
        payload: { ...state.character, health: newHealth }
      });
    }
    
    setOpponent(null);
  };

  // Update the player's health (used during combat)
  const updatePlayerHealth = (newHealth: number) => {
    if (state.character) {
      dispatch({ 
        type: 'SET_CHARACTER', 
        payload: { ...state.character, health: newHealth }
      });
    }
  };

  // Render the character's current status
  const renderCharacterStatus = () => (
    <div className="wireframe-section">
      <h2 className="wireframe-subtitle">Character Status</h2>
      <p>Name: {state.character?.name}</p>
      <p>Location: {state.location}</p>
      <p>Health: {state.character?.health}</p>
    </div>
  );

  // Render loading state if game is initializing
  if (isLoading) {
    return <div>Loading game session...</div>;
  }

  // Render game session UI
  return (
    <div className="wireframe-container">
      <h1 className="wireframe-title">Game Session</h1>
      {renderCharacterStatus()}
      <div className="wireframe-section h-64 overflow-y-auto" ref={narrativeRef}>
        <pre className="wireframe-text whitespace-pre-wrap">{state.narrative}</pre>
      </div>
      <Inventory />
      {isCombatActive && opponent && state.character ? (
        <CombatSystem
          playerCharacter={state.character}
          opponent={opponent}
          onCombatEnd={handleCombatEnd}
          onPlayerHealthChange={updatePlayerHealth}
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
    </div>
  );
}