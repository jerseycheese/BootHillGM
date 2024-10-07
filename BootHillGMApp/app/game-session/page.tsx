'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '../utils/gameEngine';
import { getAIResponse } from '../utils/aiService';
import CombatSystem from '../components/CombatSystem';
import Inventory from '../components/Inventory';
import { Character } from '../types/character';
import '../styles/wireframe.css';

export default function GameSession() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCombatActive, setIsCombatActive] = useState(false);
  const [opponent, setOpponent] = useState<Character | null>(null);
  const narrativeRef = useRef<HTMLDivElement>(null);

  // Initialize game session, including character and inventory setup
  useEffect(() => {
    const initializeGameSession = async () => {
      setIsLoading(true);
      if (!state.character) {
        router.push('/character-creation');
        return;
      }

      if (state.narrative === '') {
        const { narrative: initialNarrative, location } = await getAIResponse(
          `Initialize a new game session for a character named ${state.character.name}. 
          Provide a brief introduction to the game world and the character's current situation. 
          Include a description of their current location and some potential options for action.`
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
  }, [state.character, router, dispatch, state.narrative]);

  // Handle user input and update game state accordingly
  const handleUserInput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setIsLoading(true);
    try {
      // Get AI response based on user input
      const { narrative: aiResponse, location, combatInitiated, opponent } = await getAIResponse(userInput);
      
      // Update narrative with user input and AI response
      dispatch({ type: 'SET_NARRATIVE', payload: `${state.narrative}\n\nPlayer: ${userInput}\n\nGame Master: ${aiResponse}` });
      
      // Update location if provided
      if (location) dispatch({ type: 'SET_LOCATION', payload: location });
      
      // Initiate combat if triggered
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

  const handleCombatEnd = (winner: 'player' | 'opponent') => {
    setIsCombatActive(false);
    const combatResult = winner === 'player' 
      ? `You have defeated ${opponent?.name}!` 
      : `You have been defeated by ${opponent?.name}...`;
    
    dispatch({ type: 'SET_NARRATIVE', payload: `${state.narrative}\n\n${combatResult}` });
    
    if (winner === 'opponent' && state.character) {
      const newHealth = Math.max(0, state.character.health - 20);
      dispatch({ 
        type: 'SET_CHARACTER', 
        payload: { ...state.character, health: newHealth }
      });
    }
    
    setOpponent(null);
  };

  const updatePlayerHealth = (newHealth: number) => {
    if (state.character) {
      dispatch({ 
        type: 'SET_CHARACTER', 
        payload: { ...state.character, health: newHealth }
      });
    }
  };

  const renderCharacterStatus = () => (
    <div className="wireframe-section">
      <h2 className="wireframe-subtitle">Character Status</h2>
      <p>Name: {state.character?.name}</p>
      <p>Location: {state.currentLocation}</p>
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
      {isCombatActive && opponent ? (
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