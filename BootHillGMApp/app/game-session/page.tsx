// BootHillGMApp/app/game-session/page.tsx
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
  const [narrative, setNarrative] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('');
  const [isCombatActive, setIsCombatActive] = useState(false);
  const [opponent, setOpponent] = useState<Character | null>(null);
  const narrativeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeGameSession = async () => {
      setIsLoading(true);
      // Request an initial narrative and location from the AI
      const { narrative: initialNarrative, location } = await getAIResponse(
        `Initialize a new game session for a character named ${state.character?.name}. 
        Provide a brief introduction to the game world and the character's current situation. 
        Include a description of their current location and some potential options for action. 
        Make it clear that the player can choose to do anything they want, without restrictions.`
      );
      setNarrative(initialNarrative);
      setCurrentLocation(location || 'Unknown');
      setIsLoading(false);

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
    };
  
    // Initialize the game session if a character exists, otherwise redirect to character creation
    if (!state.character) {
      router.push('/character-creation');
    } else {
      initializeGameSession();
    }
  }, [state.character, router, dispatch]);

  const handleUserInput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setIsLoading(true);
    try {
      const { narrative: aiResponse, location, combatInitiated, opponent } = await getAIResponse(userInput);
      
      // Update game narrative and location based on AI response
      setNarrative(prev => `${prev}\n\nPlayer: ${userInput}\n\nGame Master: ${aiResponse}`);
      if (location) setCurrentLocation(location);
      
      if (combatInitiated && opponent) {
        setIsCombatActive(true);
        setOpponent(opponent);
        setNarrative(prev => `${prev}\n\nA combat situation has arisen! Prepare to face ${opponent.name}!`);
      }
      
      setUserInput('');
    } catch (error) {
      // Handle errors in AI response
      console.error('Error processing user input:', error);
      setNarrative(prev => `${prev}\n\nAn error occurred. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCombatEnd = (winner: 'player' | 'opponent') => {
    setIsCombatActive(false);
    const combatResult = winner === 'player' 
      ? `You have defeated ${opponent?.name}!` 
      : `You have been defeated by ${opponent?.name}...`;
    
    setNarrative(prev => `${prev}\n\n${combatResult}`);
    
    if (winner === 'opponent' && state.character) {
      const newHealth = Math.max(0, state.character.health - 20); // Reduce health by 20 points
      dispatch({ 
        type: 'UPDATE_CHARACTER', 
        payload: { ...state.character, health: newHealth }
      });
    }
    
    setOpponent(null);
  };

  const updatePlayerHealth = (newHealth: number) => {
    if (state.character) {
      dispatch({ 
        type: 'UPDATE_CHARACTER', 
        payload: { ...state.character, health: newHealth }
      });
    }
  };

  const renderCharacterStatus = () => (
    <div className="wireframe-section">
      <h2 className="wireframe-subtitle">Character Status</h2>
      <p>Name: {state.character?.name}</p>
      <p>Location: {currentLocation}</p>
      <p>Health: {state.character?.health}</p>
    </div>
  );

  if (!state.character) {
    return <div>Loading...</div>;
  }

  return (
    <div className="wireframe-container">
      <h1 className="wireframe-title">Game Session</h1>
      {renderCharacterStatus()}
      <div className="wireframe-section h-64 overflow-y-auto" ref={narrativeRef}>
        <pre className="wireframe-text whitespace-pre-wrap">{narrative}</pre>
      </div>
      <Inventory />  {/* Add the Inventory component here */}
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
            placeholder="What would you like to do? (You can do anything!)"
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